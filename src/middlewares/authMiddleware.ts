import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client'

interface JwtPayload {
    user_id: string;
    role: Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // bearer token

        if (!token) {
            return res.status(401).json({
                message: 'Akses ditolak, token tidak ditemukan'
            })
        }

        try {
            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as JwtPayload;
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({
                message: 'Token tidak valid atau sudah kedaluwarsa'
            });
        }
    };

export const requireRole = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
               message: 'Anda tidak memiliki hak akses ke endpoint ini' 
            });
        }
        next();
    }
}