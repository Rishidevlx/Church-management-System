
export interface FamilyMember {
  name: string;
  relationship: string;
  dob: string;
  doa: string; // Date of Anniversary
  qualification: string;
  occupation: string;
  contactNo: string;
  maritalStatus: string;
  isStarred?: boolean; // Starred for follow-up
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Member {
  id: string;
  // Header
  appNo: string;
  date: string;

  // Visitor Info
  visitorType: 'New Visitor' | 'Shalom Church Member' | 'Power Ministry' | '';
  batch: string;

  // Personal Details (Head of Family)
  name: string; // Head of Family Name
  dob: string;
  doa: string; // Wedding Anniversary
  maritalStatus: string;
  gender: string; // Added for filtering
  address: string;
  contactNo: string;
  checkInTime: string;
  occupation: string;
  heardAbout: string; // How did you hear...

  // Family
  familyCount: number; // Changed to number for easier calculation
  familyMembers: FamilyMember[];

  // Ministry & Church
  involvedInMinistry: boolean;
  ministryType: 'Full Time' | 'Part Time' | '';
  regularChurchGoer: boolean;
  churchName: string;
  churchArea: string;
  district?: string;

  // Spiritual Background
  baptismStatus: boolean;
  holySpiritAnointing: boolean;
  churchActivities: string;
  churchPosition: string;
  holyCommunion: boolean;
  loveOfJesusEvents: boolean;

  // Purpose of Visit (Checkboxes)
  purpose: {
    familyIssue: boolean;
    bondages: boolean;
    friends: boolean;
    healthIssue: boolean;
    witchCraft: boolean;
    others: boolean;
    workIssue: boolean;
    deliverance: boolean;
    personalIssues: boolean;
    prophecy: boolean;
    relative: boolean;
    counselling: boolean;
    otherDetails: string;
  };

  // Additional Info
  tattoos: boolean;
  occultPractices: boolean;
  blackMagicObjects: boolean;
  astrology: boolean;

  // Consent
  consent: boolean;

  // Admin / Office Use
  dnc: boolean; // Do Not Call
  ggrp: boolean; // GGRP Member
  isStarred?: boolean; // Starred for follow-up
  notes: Note[]; // Admin Notes
  frontOfficeIncharge: string;
  counsellor: string;
  prayerWarrior: string;
  followUpOfficer: string;
}

export interface AdvancedFilterCriteria {
  // Basic Search
  membershipNo: string;
  keyword: string; // Name, Contact, Address

  // Demographics
  areas: string[]; // Multi-select
  maritalStatus: string;
  gender: string;

  // Age
  ageFrom: number | '';
  ageTo: number | '';

  // Dates (Ranges)
  dobStart: string;
  dobEnd: string;
  anniversaryStart: string;
  anniversaryEnd: string;

  // Flags & Quick Filters
  includeDNC: boolean; // Default false
  quickFilter: 'none' | 'today_birthday' | 'upcoming_birthday' | 'today_anniversary' | 'no_phone' | 'recent';
}

export const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

// Super Admin & System Types
export interface Admin {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

export interface MatchingIndividual {
  id: string; // Original Member ID
  appNo?: string;
  name?: string; // Alias for personName for compatibility
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
