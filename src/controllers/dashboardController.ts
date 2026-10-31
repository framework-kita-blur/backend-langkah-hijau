import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getEmissionSummaryHandler = async (req: Request, res: Response) {
    try {
        // total emisi & jarak tempuh mahasiswa
        const aggregateResult = await prisma.vehicleActivity.aggregate({
            _sum: {
                produced_emission: true,
                mileage: true,
            },
            _count: {
                activity_id: true,
            },
        });

        // kelompok geofence (unpad vs pribadi)
        const groupByGeofence = await prisma.vehicleActivity.groupBy({
            by: ['geofence_label'],
            _sum: {
                produced_emission: true,
            },
        });

        // ambil seluruh data aktivitas beserta relasi ke kendaraan dan mahasiswa untuk agregasi per fakultas
        const activitiesWithFaculty = await prisma.vehicleActivity.findMany({
            include: {
                studentVehicle: {
                    include: {
                        student: true, // data userStudent yang punya kolom 'faculty'
                    },
                },
            },
        });

        // grouping & sum emisi per fakultas
        const facultyMap: { [key: string]: {
            total_emission: number,
            total_mileage: number,
            total_activities: number,
        } } = {};

        activitiesWithFaculty.forEach((activity) => {
            const facultyName = activity.studentVehicle?.student?.faculty || 'Lainnya / Tidak Diketahui';

            const emission = Number(activity.produced_emission) || 0;
            const mileage = Number(activity.mileage) || 0;

            if(!facultyMap[facultyName]) {
                facultyMap[facultyName] = {
                    total_emission: 0,
                    total_mileage: 0,
                    total_activities: 0,
                };
            }

            facultyMap[facultyName].total_emission += emission;
            facultyMap[facultyName].total_mileage += mileage;
            facultyMap[facultyName].total_activities += 1;
        })

        // ubah object map jadi array agar rapi saat dikirim ke response json
        const breakdownByFaculty = Object.keys(facultyMap).map((faculty) => ({
            faculty,
            total_emission_kg: facultyMap[faculty]?.total_emission,
            total_mileage_km: facultyMap[faculty]?.total_mileage,
            total_activities: facultyMap[faculty]?.total_activities,
        }));

        return res.status(200).json({ 
            message: 'Ringkasan data emisi berhasil dimuat',
            summary: {
                total_activities: aggregateResult._count.activity_id,
                total_emission_kg: Number(aggregateResult._sum.produced_emission || 0),
                total_mileage_km: Number(aggregateResult._sum.mileage || 0),
                breakdown_by_geofence: groupByGeofence,
                breakdown_by_faculty: breakdownByFaculty,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ message: 'Gagal memuat data dashboard', error: error.message });
    }
}