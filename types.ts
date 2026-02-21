
export interface FamilyMember {
  name: string;
  relationship: string;
  dob: string;
  doa: string; // Date of Anniversary
  qualification: string;
  occupation: string;
  contactNo: string;
  maritalStatus: string;
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
  notes: string; // Admin Notes
  frontOfficeIncharge: string;
  counsellor: string;
  prayerWarrior: string;
  followUpOfficer: string;
}
