import { Request, Response } from 'express';
import { z } from 'zod';
import { VehicleType, FuelType } from '@prisma/client';
import prisma from '../config/prisma';

const vehicleSchema = z.object({
  name: z.string().optional(),
  vehicle_type: z.nativeEnum(VehicleType),
  engine_capacity: z.number().int().positive(),
  fuel_type: z.nativeEnum(FuelType),
  emission_multiplier: z.number().positive(),
  is_active: z.boolean().optional(),
});

export const getVehiclesHandler = async (req: Request, res: Response) => {
    try {
        const student = await prisma.userStudent.findUnique({
            where: {
                user_id: req.user?.user_id
            }
        });

        if (!student) return res.status(404).json({ 
            success: false, 
            message: 'Profil mahasiswa tidak ditemukan' 
        });

        const vehicles = await prisma.userStudent.findMany({
            where: {
                npm: student.npm
            }
        });
        return res.status(200).json({ 
            success: true, 
            data: vehicles 
        });
    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data kendaraan', 
            error: error.message 
        });
    }
};

export const createVehicleHandler = async (req: Request, res: Response) => {
    try {
        const data = vehicleSchema.parse(req.body);
        const student = await prisma.userStudent.findUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });
    if (!student) return res.status(404).json({ 
        success: false, 
        message: 'Profil mahasiswa tidak ditemukan' 
    });

    const vehicle = await prisma.studentVehicle.create({
        data: {
            ...data,
            npm: student.npm,
        },
    });

    return res.status(201).json({ 
        success: true, 
        message: 'Kendaraan berhasil ditambahkan', 
        data: vehicle 
    });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Validasi gagal', error: error.errors || error.message });
    }
};

export const updateVehicleHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = vehicleSchema.partial().parse(req.body);
        const student = await prisma.userStudent.findUnique({ where: { user_id: req.user?.user_id } });
        if (!student) return res.status(404).json({ 
            success: false, 
            message: 'Mahasiswa tidak ditemukan' 
        });

        const vehicle = await prisma.studentVehicle.findFirst({ 
            where: { 
                vehicle_id: id, 
                npm: student.npm 
            } 
        });
        if (!vehicle) return res.status(404).json({ 
            success: false, 
            message: 'Kendaraan tidak ditemukan atau bukan milik Anda' 
        });

        const updated = await prisma.studentVehicle.update({
            where: { vehicle_id: id },
            data,
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Kendaraan diperbarui',
            data: updated });
    } catch (error: any) {
        return res.status(400).json({ 
            success: false, 
            message: 'Gagal memperbarui', 
            error: error.errors || error.message 
        });
    }
};

export const deleteVehicleHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await prisma.userStudent.findUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });
        if (!student) return res.status(404).json({ 
            success: false, 
            message: 'Mahasiswa tidak ditemukan' 
        });

        const vehicle = await prisma.studentVehicle.findFirst({ 
            where: { 
                vehicle_id: id, 
                npm: student.npm 
            } 
        });
        
        if (!vehicle) return res.status(404).json({ 
            success: false, 
            message: 'Kendaraan tidak ditemukan' 
        });

        await prisma.studentVehicle.delete({
            where: {
                vehicle_id: id
            }
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Kendaraan berhasil dihapus' 
        });

    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal menghapus kendaraan', 
            error: error.message 
        });
    }
};