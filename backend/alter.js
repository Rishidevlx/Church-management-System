const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDB() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 4000,
        ssl: { rejectUnauthorized: true }
    });
    try {
        await conn.query('ALTER TABLE admins ADD COLUMN username VARCHAR(255) AFTER name');
        console.log('Added username column');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('Column already exists');
        else console.log('Error adding column:', e.message);
    }

    try {
        await conn.query('UPDATE admins SET username = CONCAT("user", id) WHERE username IS NULL');
        await conn.query('ALTER TABLE admins ADD UNIQUE (username)');
        console.log('Made username unique');
    } catch (e) {
        console.log('Error updating unique constraint:', e.message);
    }

    await conn.end();
}
alterDB();
