require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: true }
        });

        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                email VARCHAR(255),
                phone VARCHAR(50),
                global_logo LONGTEXT,
                confirm_delete BOOLEAN DEFAULT true,
                two_factor_auth BOOLEAN DEFAULT false,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if row exists
        const [rows] = await connection.query('SELECT id FROM system_settings WHERE id = 1');
        if (rows.length === 0) {
            await connection.query(`
                INSERT INTO system_settings (id, name, address, email, phone) 
                VALUES (1, 'Ecclesia Central Church', '123 Holy Way, Grace Avenue, 40001', 'contact@ecclesiacentral.com', '+91 9876543210')
            `);
        }

        console.log('Table system_settings created and seeded.');
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}
setup();
