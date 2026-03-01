import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

// POST /api/admins/create
export const createAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, username, email, password, phone, church_area, address, role, status } = req.body;

        // Basic validation
        if (!name || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, username, email, and password are required' });
        }

        // Check if admin exists
        const [existing]: any = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Admin with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into DB
        const insertQuery = `
            INSERT INTO admins (name, username, email, password, phone, church_area, address, role, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(insertQuery, [
            name,
            username,
            email,
            hashedPassword,
            phone || null,
            church_area || null,
            address || null,
            role || 'admin',
            status || 'active'
        ]);

        return res.status(201).json({ success: true, message: 'Admin created successfully' });

    } catch (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while creating admin' });
    }
};

// GET /api/admins
export const getAllAdmins = async (req: Request, res: Response): Promise<any> => {
    try {
        const [rows]: any = await pool.query(`
            SELECT id, name, username, email, phone, church_area, address, role, status, last_login, created_at 
            FROM admins 
            ORDER BY created_at DESC
        `);

        return res.json({ success: true, admins: rows });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while fetching admins' });
    }
};

// PUT /api/admins/:id/status
export const updateAdminStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const adminId = req.params.id;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        await pool.query('UPDATE admins SET status = ? WHERE id = ?', [status, adminId]);
        return res.json({ success: true, message: 'Admin status updated' });
    } catch (error) {
        console.error('Error updating admin status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while updating admin status' });
    }
};

// PUT /api/admins/:id
export const updateAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const adminId = req.params.id;
        const { name, phone, status } = req.body;

        await pool.query(
            'UPDATE admins SET name = COALESCE(?, name), phone = COALESCE(?, phone), status = COALESCE(?, status) WHERE id = ?',
            [name, phone, status, adminId]
        );
        return res.json({ success: true, message: 'Admin details updated successfully' });
    } catch (error) {
        console.error('Error updating admin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while updating admin' });
    }
};

// DELETE /api/admins/:id
export const deleteAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
        const adminId = req.params.id;

        // Prevent deleting superadmin if id represents it (assume id=1 or role check)
        const [admin]: any = await pool.query('SELECT role, username FROM admins WHERE id = ?', [adminId]);
        if (admin.length > 0 && admin[0].username === 'superadmin') {
            return res.status(403).json({ success: false, message: 'Cannot delete the primary Super Admin' });
        }

        await pool.query('DELETE FROM admins WHERE id = ?', [adminId]);
        return res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while deleting admin' });
    }
};
