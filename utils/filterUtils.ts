import { Member, AdvancedFilterCriteria } from '../types';

export interface MatchingIndividual {
    id: string; // Original Member ID
    appNo?: string;
    name?: string;
    personName: string; // Enhanced Name (Head or FM)
    dob: string;
    doa: string;
    contactNo: string;
    maritalStatus: string;
    occupation: string;
    address?: string;
    relationship?: string;
    isHead: boolean;
    dnc: boolean;
    ggrp: boolean;
    visitorType: string;
    familyCount: number;
    churchArea?: string;
    district?: string;
    uniqueKey: string;
    _isFamilyMember: boolean;
    _originalMember: Member;
}

export const isDateInRangeIgnoreYear = (dateStr: string, startStr: string, endStr: string) => {
    if (!dateStr) return false;
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return false;
    const [, , dMonth, dDay] = match;
    const dateMonthDay = `${dMonth}-${dDay}`;

    let inRange = true;
    if (startStr) {
        const startMatch = startStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (startMatch) {
            const startMonthDay = `${startMatch[2]}-${startMatch[3]}`;
            inRange = inRange && (dateMonthDay >= startMonthDay);
        }
    }
    if (endStr) {
        const endMatch = endStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (endMatch) {
            const endMonthDay = `${endMatch[2]}-${endMatch[3]}`;
            inRange = inRange && (dateMonthDay <= endMonthDay);
        }
    }

    // Handle year-wrap (e.g., Dec to Jan)
    if (startStr && endStr) {
        const startMatch = startStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        const endMatch = endStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (startMatch && endMatch) {
            const startMonthDay = `${startMatch[2]}-${startMatch[3]}`;
            const endMonthDay = `${endMatch[2]}-${endMatch[3]}`;
            if (startMonthDay > endMonthDay) {
                inRange = (dateMonthDay >= startMonthDay) || (dateMonthDay <= endMonthDay);
            }
        }
    }
    return inRange;
};

export const calculateAge = (dob: string) => {
    if (!dob) return null;
    // Parse manually to avoid UTC timezone shift (new Date("YYYY-MM-DD") is UTC midnight)
    const match = dob.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const birthDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const flattenToMatchingIndividuals = (members: Member[], criteria: AdvancedFilterCriteria): MatchingIndividual[] => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    return members.flatMap(member => {
        // 1. DNC Filter
        if (!criteria.includeDNC && member.dnc) return [];

        const individualMatches: MatchingIndividual[] = [];

        // Check Head
        let headMatches = true;

        if (criteria.keyword) {
            const term = criteria.keyword.toLowerCase();
            const matchesKeyword =
                member.name.toLowerCase().includes(term) ||
                (member.contactNo || '').includes(term) ||
                (member.address || '').toLowerCase().includes(term);
            if (!matchesKeyword) headMatches = false;
        }

        if (criteria.membershipNo && !member.id.toLowerCase().includes(criteria.membershipNo.toLowerCase())) headMatches = false;
        if (criteria.maritalStatus && criteria.maritalStatus !== 'All' && member.maritalStatus !== criteria.maritalStatus) headMatches = false;
        if (criteria.areas && criteria.areas.length > 0 && !criteria.areas.includes(member.district || member.churchArea || '')) headMatches = false;

        if (criteria.ageFrom !== '' || criteria.ageTo !== '') {
            const age = calculateAge(member.dob);
            if (age === null) headMatches = false;
            else {
                if (criteria.ageFrom !== '' && age < (criteria.ageFrom as number)) headMatches = false;
                if (criteria.ageTo !== '' && age > (criteria.ageTo as number)) headMatches = false;
            }
        }

        if ((criteria.dobStart || criteria.dobEnd) && !isDateInRangeIgnoreYear(member.dob, criteria.dobStart, criteria.dobEnd)) headMatches = false;
        if ((criteria.anniversaryStart || criteria.anniversaryEnd) && !isDateInRangeIgnoreYear(member.doa, criteria.anniversaryStart, criteria.anniversaryEnd)) headMatches = false;

        // Quick Filters for Head
        if (criteria.quickFilter === 'today_birthday') {
            if (!member.dob) headMatches = false;
            else {
                const match = member.dob.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (!match || Number(match[2]) !== todayMonth || Number(match[3]) !== todayDate) headMatches = false;
            }
        } else if (criteria.quickFilter === 'today_anniversary') {
            if (!member.doa) headMatches = false;
            else {
                const match = member.doa.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (!match || Number(match[2]) !== todayMonth || Number(match[3]) !== todayDate) headMatches = false;
            }
        } else if (criteria.quickFilter === 'no_phone') {
            if (member.contactNo && String(member.contactNo).trim() !== '') headMatches = false;
        } else if (criteria.quickFilter === 'upcoming_birthday') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            const startStr = today.toISOString().split('T')[0];
            const endStr = nextWeek.toISOString().split('T')[0];
            if (!member.dob || !isDateInRangeIgnoreYear(member.dob, startStr, endStr)) headMatches = false;
        }

        if (headMatches) {
            individualMatches.push({
                id: member.id,
                appNo: member.appNo,
                name: member.name,
                personName: member.name,
                address: member.address,
                dob: member.dob,
                doa: member.doa,
                contactNo: member.contactNo,
                maritalStatus: member.maritalStatus,
                occupation: member.occupation,
                isHead: true,
                dnc: member.dnc,
                ggrp: member.ggrp,
                visitorType: member.visitorType,
                familyCount: member.familyCount,
                churchArea: member.churchArea,
                district: member.district,
                uniqueKey: member.id,
                _isFamilyMember: false,
                _originalMember: member
            });
        }

        // Check Family Members
        (member.familyMembers || []).forEach((fm, index) => {
            if (!fm.name && !fm.dob) return;

            let fmMatches = true;

            if (criteria.keyword) {
                const term = criteria.keyword.toLowerCase();
                const matchesKeyword =
                    fm.name.toLowerCase().includes(term) ||
                    (fm.contactNo || '').includes(term);
                if (!matchesKeyword) fmMatches = false;
            }

            if (criteria.maritalStatus && criteria.maritalStatus !== 'All' && fm.maritalStatus !== criteria.maritalStatus) fmMatches = false;

            if (criteria.ageFrom !== '' || criteria.ageTo !== '') {
                const age = calculateAge(fm.dob);
                if (age === null) fmMatches = false;
                else {
                    if (criteria.ageFrom !== '' && age < (criteria.ageFrom as number)) fmMatches = false;
                    if (criteria.ageTo !== '' && age > (criteria.ageTo as number)) fmMatches = false;
                }
            }

            if ((criteria.dobStart || criteria.dobEnd) && !isDateInRangeIgnoreYear(fm.dob, criteria.dobStart, criteria.dobEnd)) fmMatches = false;
            if ((criteria.anniversaryStart || criteria.anniversaryEnd) && !isDateInRangeIgnoreYear(fm.doa, criteria.anniversaryStart, criteria.anniversaryEnd)) fmMatches = false;

            // District/Area check still applies to the family unit
            if (criteria.areas && criteria.areas.length > 0 && !criteria.areas.includes(member.district || member.churchArea || '')) fmMatches = false;

            // Quick Filters for FM
            if (criteria.quickFilter === 'today_birthday') {
                if (!fm.dob) fmMatches = false;
                else {
                    const match = fm.dob.match(/(\d{4})-(\d{2})-(\d{2})/);
                    if (!match || Number(match[2]) !== todayMonth || Number(match[3]) !== todayDate) fmMatches = false;
                }
            } else if (criteria.quickFilter === 'today_anniversary') {
                if (!fm.doa) fmMatches = false;
                else {
                    const match = fm.doa.match(/(\d{4})-(\d{2})-(\d{2})/);
                    if (!match || Number(match[2]) !== todayMonth || Number(match[3]) !== todayDate) fmMatches = false;
                }
            } else if (criteria.quickFilter === 'no_phone') {
                if (fm.contactNo && String(fm.contactNo).trim() !== '') fmMatches = false;
            } else if (criteria.quickFilter === 'upcoming_birthday') {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                const startStr = today.toISOString().split('T')[0];
                const endStr = nextWeek.toISOString().split('T')[0];
                if (!fm.dob || !isDateInRangeIgnoreYear(fm.dob, startStr, endStr)) fmMatches = false;
            }

            if (fmMatches) {
                individualMatches.push({
                    id: member.id,
                    appNo: member.appNo,
                    name: `${fm.name} (${fm.relationship} of ${member.name})`,
                    personName: `${fm.name} (${fm.relationship} of ${member.name})`,
                    address: member.address,
                    dob: fm.dob,
                    doa: fm.doa,
                    contactNo: (criteria.quickFilter === 'no_phone') ? (fm.contactNo || '') : (fm.contactNo || member.contactNo),
                    maritalStatus: fm.maritalStatus,
                    occupation: fm.occupation,
                    relationship: fm.relationship,
                    isHead: false,
                    dnc: member.dnc,
                    ggrp: member.ggrp,
                    visitorType: member.visitorType,
                    familyCount: member.familyCount,
                    churchArea: member.churchArea,
                    district: member.district,
                    uniqueKey: `${member.id}-fm-${index}`,
                    _isFamilyMember: true,
                    _originalMember: member
                });
            }
        });

        return individualMatches;
    });
};
