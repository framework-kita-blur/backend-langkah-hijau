import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const loginHandler = async(req: Request, res: Response) => {
    try {
        const {email, password} = loginSchema.parse(req.body);

        // cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { userStudent: true },
        });

        if (!user) {
            return res.status(401).json({ message: "Email atau password salah! " });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email atau password salah! " });
        }

        // JWT Token
        const tokenPayload = {
            user_id: user.user_id,
            role: user.role,
        }

        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(tokenPayload, secret, { expiresIn:'7d' });

        return res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                student_profile: user.userStudent || null,
            },
        });
    } catch (error:any) {
        return res.status(400).json({ message: 'Format input tidak valid', error: error.errors || error.message });
    }
};