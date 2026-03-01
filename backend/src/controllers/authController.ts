import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // 1. Check Super Admin Credentials (from .env)
        if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'super-admin', email, role: 'super-admin' },
                process.env.JWT_SECRET || 'fallback_secret_key',
                { expiresIn: '12h' }
            );
            return res.json({
                success: true,
                message: 'Login successful as Super Admin',
                token,
                user: { id: 'super-admin', email, role: 'super-admin', name: 'Super Admin' }
            });
        }

        // 2. Check Admin Credentials (from Database)
        const [rows]: any = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        }

        const admin = rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role || 'admin', churchArea: admin.church_area },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '12h' }
        );

        // Update last login timestamp
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: admin.id,
                email: admin.email,
                role: admin.role || 'admin',
                name: admin.name,
                churchArea: admin.church_area
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during login' });
    }
};
