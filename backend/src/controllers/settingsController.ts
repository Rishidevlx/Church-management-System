import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getSettings = async (req: Request, res: Response): Promise<any> => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM system_settings WHERE id = 1');
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }
        return res.json({ success: true, settings: rows[0] });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, address, email, phone, global_logo, confirm_delete, two_factor_auth } = req.body;

        await pool.query(
            `UPDATE system_settings 
             SET name = ?, address = ?, email = ?, phone = ?, global_logo = ?, confirm_delete = ?, two_factor_auth = ? 
             WHERE id = 1`,
            [name, address, email, phone, global_logo, confirm_delete ? 1 : 0, two_factor_auth ? 1 : 0]
        );

        return res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
