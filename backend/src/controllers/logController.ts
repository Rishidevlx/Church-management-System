import { Request, Response } from 'express';
import { pool } from '../config/db';

// GET /api/logs
export const getAllLogs = async (req: Request, res: Response): Promise<any> => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 200');
        return res.json({ success: true, logs: rows });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while fetching logs' });
    }
};

// POST /api/logs
export const createLog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { adminEmail, adminName, action, module, description, ipAddress } = req.body;

        if (!adminName || !action || !module) {
            return res.status(400).json({ success: false, message: 'Admin details, action, and module are required' });
        }

        const insertLogQuery = `
            INSERT INTO activity_logs (admin_email, admin_name, action, module, description, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await pool.query(insertLogQuery, [
            adminEmail || 'Unknown',
            adminName,
            action,
            module,
            description || null,
            ipAddress || null
        ]);

        return res.status(201).json({ success: true, message: 'Log created successfully' });
    } catch (error) {
        console.error('Error creating log:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while creating log' });
    }
};
