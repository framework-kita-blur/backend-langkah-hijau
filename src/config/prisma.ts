import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ambil url database dari .env
const connectionString = process.env.DATABASE_URL;

// buat connection pool pakai node-postgres (pg)
const pool = new Pool({ connectionString });

// buat instance adapter untuk prisma v7
const adapter = new PrismaPg(pool);

// inisialisasi PrismaClient dengan memasukkan adapter
const prisma = new PrismaClient({ adapter });

export default prisma;