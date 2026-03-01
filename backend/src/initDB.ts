import { pool } from './config/db';

const initDB = async () => {
    try {
        console.log('Initializing Database...');

        // 1. Create Admins Table
        const createAdminsTable = `
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                church_area VARCHAR(255),
                address TEXT,
                role VARCHAR(50) DEFAULT 'admin',
                status ENUM('active', 'inactive') DEFAULT 'active',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_status (status)
            )
        `;

        await pool.query(createAdminsTable);
        console.log('✅ Admins table ready.');

        // 2. Create Members Table
        const createMembersTable = `
            CREATE TABLE IF NOT EXISTS members (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                app_no VARCHAR(50),
                visitor_type VARCHAR(100),
                batch VARCHAR(100),
                contact_no VARCHAR(20),
                dob DATE,
                doa DATE,
                qualification VARCHAR(255),
                occupation VARCHAR(255),
                address TEXT,
                marital_status VARCHAR(50),
                gender VARCHAR(20),
                heard_about VARCHAR(255),
                involved_in_ministry BOOLEAN DEFAULT FALSE,
                ministry_type VARCHAR(50),
                regular_church_goer BOOLEAN DEFAULT FALSE,
                church_name VARCHAR(255),
                church_area VARCHAR(255),
                baptized BOOLEAN DEFAULT FALSE,
                baptism_date DATE,
                holy_spirit_anointing BOOLEAN DEFAULT FALSE,
                church_activities TEXT,
                church_position VARCHAR(255),
                holy_communion BOOLEAN DEFAULT FALSE,
                love_of_jesus_events BOOLEAN DEFAULT FALSE,
                purpose JSON,
                tattoos BOOLEAN DEFAULT FALSE,
                occult_practices BOOLEAN DEFAULT FALSE,
                black_magic_objects BOOLEAN DEFAULT FALSE,
                astrology BOOLEAN DEFAULT FALSE,
                dnc BOOLEAN DEFAULT FALSE,
                ggrp BOOLEAN DEFAULT FALSE,
                is_starred BOOLEAN DEFAULT FALSE,
                notes JSON,
                front_office_incharge VARCHAR(255),
                counsellor VARCHAR(255),
                prayer_warrior VARCHAR(255),
                follow_up_officer VARCHAR(255),
                family_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_contact (contact_no),
                INDEX idx_dob (dob),
                INDEX idx_doa (doa),
                INDEX idx_area (church_area),
                INDEX idx_dnc (dnc)
            )
        `;
        await pool.query(createMembersTable);
        console.log('✅ Members table ready.');

        const createFamilyMembersTable = `
            CREATE TABLE IF NOT EXISTS family_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100),
                dob DATE,
                doa DATE,
                qualification VARCHAR(255),
                occupation VARCHAR(255),
                contact_no VARCHAR(20),
                marital_status VARCHAR(50),
                INDEX idx_member_id (member_id),
                INDEX idx_name (name),
                INDEX idx_dob (dob),
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createFamilyMembersTable);
        console.log('✅ Family Members table ready.');

        // 3. Create Activity Logs Table
        const createLogsTable = `
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_email VARCHAR(255) NOT NULL,
                admin_name VARCHAR(255) NOT NULL,
                action VARCHAR(255) NOT NULL,
                module VARCHAR(255) NOT NULL,
                description TEXT,
                ip_address VARCHAR(45),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_admin_email (admin_email),
                INDEX idx_module (module),
                INDEX idx_timestamp (timestamp)
            )
        `;
        await pool.query(createLogsTable);
        console.log('✅ Activity Logs table ready.');

        console.log('🎉 Database initialization complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error initializing database:', err);
        process.exit(1);
    }
};

initDB();
