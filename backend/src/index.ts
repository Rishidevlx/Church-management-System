import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import memberRoutes from './routes/memberRoutes';
import logRoutes from './routes/logRoutes';
import settingsRoutes from './routes/settingsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DB Health check — live ping test
app.get('/api/health/db', async (req, res) => {
    const { pool } = await import('./config/db');
    const start = Date.now();
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.json({
            connected: true,
            responseTime: Date.now() - start,
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '4000',
            database: process.env.DB_NAME || 'church_management',
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        res.status(503).json({
            connected: false,
            error: err.message || 'Connection failed',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '4000',
            database: process.env.DB_NAME || 'church_management',
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server is running on port ${PORT}`);
});
