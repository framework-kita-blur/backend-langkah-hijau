import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Role } from '@prisma/client'
import prisma from '../config/prisma';

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    npm: z.string().length(12),
    faculty: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const updatePasswordSchema = z.object({
    old_password: z.string(),
    new_password: z.string().min(8),
})

export const registerHandler = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar',
            })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
               name: data.name,
               email: data.email,
               password: hashedPassword,
               role: Role.Mobile,
               userStudent: {
                    create: {
                        npm: data.npm,
                        faculty: data.faculty,
                    },
                }, 
            },
            include: {
                userStudent: true
            },
        });

        const token = jwt.sign({ user_id: newUser.user_id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            token,
            user: { user_id: newUser.user_id, name: newUser.name, email: newUser.email, role: newUser.role, student_profile: newUser.userStudent },
        })
    } catch(error: any) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validasi gagal', 
            error: error.errors || error.message });
    }
};

export const loginHandler = async(req: Request, res: Response) => {
    try {
        const {email, password} = loginSchema.parse(req.body);

        // cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { userStudent: true },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Email atau password salah! " });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET || "secret", {expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                student_profile: user.userStudent,
            },
        });
    } catch (error:any) {
        return res.status(400).json({ 
            success: false,
            message: 'Format input tidak valid', 
            error: error.errors || error.message });
    }
};

export const getMeHandler = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                user_id: req.user?.user_id
            },
            include: {
                userStudent: {
                    include: {
                        studentVehicles: true
                    }
                }
            },
        });

        if (!user) return res.status(404).json({ 
            success: false, 
            message: 'User tidak ditemukan' 
        });

        return res.status(200).json({
            success: true,
            data: user,
        })
    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal memuat profil', 
            error: error.message });
    }
};

export const updatePasswordHandler = async (req: Request, res: Response) => {
    try {
        const { old_password, new_password } = updatePasswordSchema.parse(req.body);
        const user = await prisma.user.findUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });

    if (!user) return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
    });

    if (!(await bcrypt.compare(old_password, user.password))) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password lama tidak sesuai' });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
        where: { 
            user_id: user.user_id 
        }, data: { 
            password: hashedNewPassword 
        }
    });

    return res.status(200).json({ 
        success: true, 
        message: 'Password berhasil diperbarui' 
    });

    } catch (error: any) {
        return res.status(400).json({ 
            success: false, 
            message: 'Gagal memperbarui password', 
            error: error.errors || error.message 
        });
    }
}