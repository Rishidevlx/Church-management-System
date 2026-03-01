import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'church_management',
    port: parseInt(process.env.DB_PORT || '4000', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // ── CRITICAL: Prevent mysql2 from converting DATE columns to JS Date objects.
    // Without this, '2026-03-01' becomes a Date at UTC midnight → IST shows Feb 28.
    dateStrings: true,
    ssl: {
        rejectUnauthorized: true
    }
});

// Simple connectivity check
pool.getConnection()
    .then(conn => {
        console.log('Database connected successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });
