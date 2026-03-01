import { Request, Response } from 'express';
import { pool } from '../config/db';

// Helper: safely format a MySQL date value (which may be a JS Date object or string) to 'YYYY-MM-DD'
// This prevents timezone-shifted dates (e.g., IST offset causing Mar 1 → Feb 28)
const toDateString = (val: any): string => {
    if (!val) return '';
    if (val instanceof Date) {
        // Use local date parts — avoids UTC shift
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    // Already a string — extract YYYY-MM-DD part only
    const match = String(val).match(/(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : String(val);
};

export const getAllMembers = async (req: Request, res: Response): Promise<any> => {
    try {
        const [members]: any = await pool.query('SELECT * FROM members ORDER BY created_at DESC');
        const [familyMembers]: any = await pool.query('SELECT * FROM family_members');

        // Nest family members and parse JSON fields
        const result = members.map((m: any) => ({
            ...m,
            // Force dob/doa to YYYY-MM-DD string — MySQL2 returns Date objects which cause TZ shift
            dob: toDateString(m.dob),
            doa: toDateString(m.doa),
            appNo: m.app_no,
            visitorType: m.visitor_type,
            contactNo: m.contact_no,
            maritalStatus: m.marital_status,
            heardAbout: m.heard_about,
            involvedInMinistry: !!m.involved_in_ministry,
            ministryType: m.ministry_type,
            regularChurchGoer: !!m.regular_church_goer,
            churchName: m.church_name,
            churchArea: m.church_area,
            baptismStatus: !!m.baptized,
            holySpiritAnointing: !!m.holy_spirit_anointing,
            churchActivities: m.church_activities,
            churchPosition: m.church_position,
            holyCommunion: !!m.holy_communion,
            loveOfJesusEvents: !!m.love_of_jesus_events,
            tattoos: !!m.tattoos,
            occultPractices: !!m.occult_practices,
            blackMagicObjects: !!m.black_magic_objects,
            astrology: !!m.astrology,
            isStarred: !!m.is_starred,
            notes: typeof m.notes === 'string' ? JSON.parse(m.notes) : (Array.isArray(m.notes) ? m.notes : []),
            purpose: typeof m.purpose === 'string' ? JSON.parse(m.purpose) : (m.purpose || {}),
            familyMembers: familyMembers.filter((fm: any) => fm.member_id === m.id).map((fm: any) => ({
                ...fm,
                // Also fix family member dates
                dob: toDateString(fm.dob),
                doa: toDateString(fm.doa),
                contactNo: fm.contact_no,
                maritalStatus: fm.marital_status,
                isStarred: !!fm.is_starred
            }))
        }));

        return res.json({ success: true, members: result });
    } catch (error) {
        console.error('Error fetching members:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while fetching members' });
    }
};

// POST /api/members
export const createMember = async (req: Request, res: Response): Promise<any> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            id, name, appNo, visitorType, batch, contactNo, dob, doa,
            qualification, occupation, address, maritalStatus,
            gender, heardAbout, involvedInMinistry, ministryType,
            regularChurchGoer, churchName, churchArea,
            baptized, baptismDate, holySpiritAnointing, churchActivities,
            churchPosition, holyCommunion, loveOfJesusEvents, purpose,
            tattoos, occultPractices, blackMagicObjects, astrology,
            dnc, ggrp, isStarred, notes,
            frontOfficeIncharge, counsellor, prayerWarrior, followUpOfficer,
            familyCount, familyMembers
        } = req.body;

        if (!id || !name) {
            return res.status(400).json({ success: false, message: 'ID and Name are required' });
        }

        const insertMemberQuery = `
            INSERT INTO members (
                id, name, app_no, visitor_type, batch, contact_no, dob, doa,
                qualification, occupation, address, marital_status,
                gender, heard_about, involved_in_ministry, ministry_type,
                regular_church_goer, church_name, church_area,
                baptized, baptism_date, holy_spirit_anointing, church_activities,
                church_position, holy_communion, love_of_jesus_events, purpose,
                tattoos, occult_practices, black_magic_objects, astrology,
                dnc, ggrp, is_starred, notes,
                front_office_incharge, counsellor, prayer_warrior, follow_up_officer,
                family_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.query(insertMemberQuery, [
            id, name, appNo || null, visitorType || null, batch || null, contactNo || null, dob || null, doa || null,
            qualification || null, occupation || null, address || null, maritalStatus || null,
            gender || null, heardAbout || null, involvedInMinistry || false, ministryType || null,
            regularChurchGoer || false, churchName || null, churchArea || null,
            baptized || false, baptismDate || null, holySpiritAnointing || false, churchActivities || null,
            churchPosition || null, holyCommunion || false, loveOfJesusEvents || false,
            purpose ? JSON.stringify(purpose) : null,
            tattoos || false, occultPractices || false, blackMagicObjects || false, astrology || false,
            dnc || false, ggrp || false, isStarred || false,
            notes ? JSON.stringify(notes) : null,
            frontOfficeIncharge || null, counsellor || null, prayerWarrior || null, followUpOfficer || null,
            familyCount || 0
        ]);

        if (familyMembers && familyMembers.length > 0) {
            const insertFamilyQuery = `
                INSERT INTO family_members (
                    member_id, name, relationship, dob, doa,
                    qualification, occupation, contact_no, marital_status, is_starred
                ) VALUES ?
            `;
            const familyValues = familyMembers.map((fm: any) => [
                id, fm.name, fm.relationship, fm.dob || null, fm.doa || null,
                fm.qualification || null, fm.occupation || null, fm.contactNo || fm.contact_no || null, fm.maritalStatus || fm.marital_status || null,
                fm.isStarred || false
            ]);
            await connection.query(insertFamilyQuery, [familyValues]);
        }

        await connection.commit();
        return res.status(201).json({ success: true, message: 'Member created successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating member:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while creating member' });
    } finally {
        connection.release();
    }
};

// PUT /api/members/:id
export const updateMember = async (req: Request, res: Response): Promise<any> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const memberId = req.params.id;
        const {
            name, appNo, visitorType, batch, contactNo, dob, doa,
            qualification, occupation, address, maritalStatus,
            gender, heardAbout, involvedInMinistry, ministryType,
            regularChurchGoer, churchName, churchArea,
            baptized, baptismDate, holySpiritAnointing, churchActivities,
            churchPosition, holyCommunion, loveOfJesusEvents, purpose,
            tattoos, occultPractices, blackMagicObjects, astrology,
            dnc, ggrp, isStarred, notes,
            frontOfficeIncharge, counsellor, prayerWarrior, followUpOfficer,
            familyCount, familyMembers
        } = req.body;

        const updateMemberQuery = `
            UPDATE members SET
                name = ?, app_no = ?, visitor_type = ?, batch = ?, contact_no = ?, dob = ?, doa = ?,
                qualification = ?, occupation = ?, address = ?, marital_status = ?,
                gender = ?, heard_about = ?, involved_in_ministry = ?, ministry_type = ?,
                regular_church_goer = ?, church_name = ?, church_area = ?,
                baptized = ?, baptism_date = ?, holy_spirit_anointing = ?, church_activities = ?,
                church_position = ?, holy_communion = ?, love_of_jesus_events = ?, purpose = ?,
                tattoos = ?, occult_practices = ?, black_magic_objects = ?, astrology = ?,
                dnc = ?, ggrp = ?, is_starred = ?, notes = ?,
                front_office_incharge = ?, counsellor = ?, prayer_warrior = ?, follow_up_officer = ?,
                family_count = ?
            WHERE id = ?
        `;

        await connection.query(updateMemberQuery, [
            name, appNo || null, visitorType || null, batch || null, contactNo || null, dob || null, doa || null,
            qualification || null, occupation || null, address || null, maritalStatus || null,
            gender || null, heardAbout || null, involvedInMinistry || false, ministryType || null,
            regularChurchGoer || false, churchName || null, churchArea || null,
            baptized || false, baptismDate || null, holySpiritAnointing || false, churchActivities || null,
            churchPosition || null, holyCommunion || false, loveOfJesusEvents || false,
            purpose ? JSON.stringify(purpose) : null,
            tattoos || false, occultPractices || false, blackMagicObjects || false, astrology || false,
            dnc || false, ggrp || false, isStarred || false,
            notes ? JSON.stringify(notes) : null,
            frontOfficeIncharge || null, counsellor || null, prayerWarrior || null, followUpOfficer || null,
            familyCount || 0,
            memberId
        ]);

        // Simple approach for family members: Delete and Re-insert
        await connection.query('DELETE FROM family_members WHERE member_id = ?', [memberId]);

        if (familyMembers && familyMembers.length > 0) {
            const insertFamilyQuery = `
                INSERT INTO family_members (
                    member_id, name, relationship, dob, doa,
                    qualification, occupation, contact_no, marital_status, is_starred
                ) VALUES ?
            `;
            const familyValues = familyMembers.map((fm: any) => [
                memberId, fm.name, fm.relationship, fm.dob || null, fm.doa || null,
                fm.qualification || null, fm.occupation || null, fm.contactNo || fm.contact_no || null, fm.maritalStatus || fm.marital_status || null,
                fm.isStarred || false
            ]);
            await connection.query(insertFamilyQuery, [familyValues]);
        }

        await connection.commit();
        return res.json({ success: true, message: 'Member updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating member:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while updating member' });
    } finally {
        connection.release();
    }
};

// DELETE /api/members/:id
export const deleteMember = async (req: Request, res: Response): Promise<any> => {
    try {
        const memberId = req.params.id;
        await pool.query('DELETE FROM members WHERE id = ?', [memberId]);
        return res.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while deleting member' });
    }
};
