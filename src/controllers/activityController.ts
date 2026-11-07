import { Request, Response } from 'express';
import { z } from 'zod';
import { EmissionCategory, GeofenceLabel } from '@prisma/client';
import prisma from '../config/prisma';

const activitySchema = z.object({
  activity_id: z.string().uuid(), // wajib mengirim UUID untuk idempotensi
  vehicle_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  mileage: z.number().nonnegative(), // mengizinkan nilai 0
  produced_emission: z.number().nonnegative(),
  start_lat: z.number().min(-90).max(90),
  start_long: z.number().min(-180).max(180),
  end_lat: z.number().min(-90).max(90),
  end_long: z.number().min(-180).max(180),
  emission_category: z.nativeEnum(EmissionCategory),
  geofence_label: z.nativeEnum(GeofenceLabel),
});

const batchSyncSchema = z.object({
    activities: z.array(activitySchema),
});

export const syncActivityBatchHandler = async (req: Request, res: Response) => {
    try {
        const { activities } = batchSyncSchema.parse(req.body);
        const student = await prisma.userStudentfindUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });
    if (!student) return res.status(404).json({ 
        success: false, 
        message: 'Profil mahasiswa tidak ditemukan' 
    });

    const processedIds: string[] = [];

    for (const act of activities) {
        const vehicle = await prisma.studentVehicle.findFirst({
            where: {
                vehicle_id: act.vehicle_id,
                npm: student.npm
            },
        });

        if (!vehicle) continue;

        await prisma.vehicleActivity.upsert({
            where: { activity_id: act.activity_id},
            update: {},
            create: {
                activity_id: act.activity_id,
                vehicle_id: act.vehicle_id,
                start_time: new Date(act.start_time),
                end_time: new Date(act.end_time),
                mileage: act.mileage,
                produced_emission: act.produced_emission,
                start_lat: act.start_lat,
                start_long: act.start_long,
                end_lat: act.end_lat,
                end_long: act.end_long,
                emission_category: act.emission_category,
                geofence_label: act.geofence_label,
            },
        });
        processedIds.push(act.activity_id);
    }

    return res.status(200).json({
        success: true,
        message: 'Sinkronisasi aktivitas batch berhasil',
        synced_activity_ids: processedIds,
    });

    } catch (error: any) {
        return res.status(400).json({ 
            success: false, 
            message: 'Gagal sinkronisasi data', 
            error: error.errors || error.message 
        });
    }
};

export const getUserActivitiesHandler = async (req: Response, res: Response) => {
    try {
        const student = await prisma.userStudent.findUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });

        if (!student) return res.status(404).json({ 
            success: false, 
            message: 'Mahasiswa tidak ditemukan' 
        });

        const activities = await prisma.vehicleActivity.findMany({
            where: {
                studentVehicle: {
                    npm: student.npm
                },
            },
            orderBy: {
                start_time: 'desc'
            },
            take: 50,
        });

        return res.status(200).json({ 
            success: true, 
            data: activities 
        });
    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal memuat riwayat', 
            error: error.message 
        });
    }
};

export const getActivitySummaryHandler = async (req: Request, res: Response) => {
    try {
        const student = await prisma.userStudent.findUnique({ 
            where: { 
                user_id: req.user?.user_id 
            } 
        });

        if (!student) return res.status(404).json({ 
            success: false, 
            message: 'Mahasiswa tidak ditemukan' 
        });

        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthActivities = await prisma.vehicleActivity.findMany({
            where: {
                studentVehicle: { npm: student.npm },
                start_time: { gte: startOfCurrentMonth },
            }
        })

        const lastMonthActivities = await prisma.vehicleActivity.findMany({
            where: {
                studentVehicle: { npm: student.npm },
                start_time: { gte: startOfLastMonth, lte: endOfLastMonth },
            },
        });

        const sumEmission = (acts: typeof currentMonthActivities) => 
            acts.reduce((acc, curr) => acc + Number(curr.produced_emission), 0);
        const sumMileage = (acts: typeof currentMonthActivities) => 
            acts.reduce((acc, curr) => acc + Number(curr.mileage), 0);

        const currentEmission = sumEmission(currentMonthActivities);
        const lastEmission = sumEmission(lastMonthActivities);
        const totalMileage = sumMileage(currentMonthActivities);

        let emissionChangePercent = 0;
        if (lastEmission > 0) {
            emissionChangePercent = Number((((currentEmission - lastEmission) / lastEmission) * 100).toFixed(2));
        }

        const breakdownGeofence = currentMonthActivities.reduce((acc: any, curr) => {
            acc[curr.geofence_label] = (acc[curr.geofence_label] || 0) + Number(curr.produced_emission);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            summary: {
                total_emission_current_month_kg: currentEmission,
                emission_change_vs_last_month_percent: emissionChangePercent,
                total_mileage_km: totalMileage,
                breakdown_by_geofence: breakdownGeofence,
                total_activities_count: currentMonthActivities.length,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal memuat ringkasan', 
            error: error.message 
        });
    }
}