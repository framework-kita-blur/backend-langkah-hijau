import { Request, Response } from 'express';
import { z } from 'zod';
import { EmissionCategory, GeofenceLabel } from '@prisma/client';
import prisma from '../config/prisma';

const syncActivitySchema = z.object({
    vehicle_id: z.string().uuid(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    mileage: z.number().positive(),
    produced_emission: z.number().nonnegative(),
    start_lat: z.number().min(-90).max(90),
    start_long: z.number().min(-180).max(180),
    end_lat: z.number().min(-90).max(90),
    end_long: z.number().min(-180).max(180),
    emission_category: z.nativeEnum(EmissionCategory),
    geofence_label: z.nativeEnum(GeofenceLabel),
});

export const syncActivityHandler = async( req: Request, res: Response) => {
    try {
        const data = syncActivitySchema.parse(req.body);

        // pastikan kendaraan terdaftar milik mahasiswa
        const vehicle = await prisma.studentVehicle.findUnique({
            where: { vehicleId: data.vehicle_id },
        });

        if (!vehicle) {
            return res.status(404).json({message: "Kendaraan tidak ditemukan! "});
        }

        // simpan aktivitas perjalanan
        const newActivity = await prisma.vehicleActivity.create({
            data: {
                vehicle_id: data.vehicle_id,
                start_time: new Date(data.start_time),
                end_time: new Date(data.end_time),
                mileage: data.mileage,
                produced_emission: data.produced_emission,
                start_lat: data.start_lat,
                start_long: data.start_long,
                end_lat: data.end_lat,
                end_long: data.end_long,
                emission_category: data.emission_category,
                geofence_label: data.geofence_label,
            },
        });

        return res.status(201).json({
            message: 'Aktivitas perjalanan berhasil disinkronkan',
            data: newActivity,
        });
    } catch(error: any) {
        return res.status(400).json({ message: 'Gagal menyinkronkan aktivitas', error: error.errors || error.message })
    }
};