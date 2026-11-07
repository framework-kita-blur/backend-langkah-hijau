import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getGeofencesHandler = async (req: Request, res: Response) => {
    try {
        const geofences = await prisma.geofence.findMany();
        return res.status(200).json({ 
            success: true, 
            data: geofences 
        });
    } catch (error: any) {
    return res.status(500).json({ 
        success: false, 
        message: 'Gagal memuat data geofence', 
        error: error.message 
    });
  }
}