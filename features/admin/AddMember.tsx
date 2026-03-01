import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { Toast } from '../../components/ui/Toast';
import { UserPlusIcon, UsersIcon, SearchIcon, PrinterIcon, XIcon, UserIcon, PhoneIcon } from '../../components/Icons';
import { Member, FamilyMember, TAMIL_NADU_DISTRICTS } from '../../types';
import { printMemberForm } from '../../utils/printUtils';

interface AddMemberProps {
  onAddMember: (member: Member) => void;
  onCancel?: () => void;
  initialData?: Member | null; // For Editing
  isModal?: boolean; // New prop to style differently if inside modal
  existingMembers?: Member[]; // New prop for search functionality
}

const EMPTY_FAMILY_MEMBER: FamilyMember = {
  name: '',
  relationship: '',
  dob: '',
  doa: '',
  qualification: '',
  occupation: '',
  contactNo: '',
  maritalStatus: ''
};

const INITIAL_FORM_STATE: Member = {
  id: '',
  appNo: '',
  date: '',
  batch: '',
  visitorType: '',

  // Personal (Head)
  name: '',
  dob: '',
  doa: '',
  maritalStatus: '',
  gender: '',
  address: '',
  checkInTime: '',
  contactNo: '',
  occupation: '',
  heardAbout: '',

  // Family
  familyCount: 0,
  familyMembers: [],

  involvedInMinistry: false,
  ministryType: '',
  regularChurchGoer: false,
  churchName: '',
  churchArea: '',
  baptismStatus: false,
  holySpiritAnointing: false,
  churchActivities: '',
  churchPosition: '',
  holyCommunion: false,
  loveOfJesusEvents: false,
  district: '',
  purpose: {
    familyIssue: false,
    bondages: false,
    friends: false,
    healthIssue: false,
    witchCraft: false,
    others: false,
    workIssue: false,
    deliverance: false,
    personalIssues: false,
    prophecy: false,
    relative: false,
    counselling: false,
    otherDetails: ''
  },
  tattoos: false,
  occultPractices: false,
  blackMagicObjects: false,
  astrology: false,
  consent: false,
  dnc: false,
  ggrp: false, // Default false
  notes: [],
  frontOfficeIncharge: '',
  counsellor: '',
  prayerWarrior: '',
  followUpOfficer: ''
};

export const AddMember: React.FC<AddMemberProps> = ({ onAddMember, onCancel, initialData, isModal = false, existingMembers = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [foundMember, setFoundMember] = useState<Member | null>(null); // State for the popup

  // --- Form State ---
  const [formData, setFormData] = useState<Member>(INITIAL_FORM_STATE);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // --- Search Handler ---
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setToastMessage("Please enter a number to search.");
      setToastType('error');
      setShowToast(true);
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    let matchedMember: Member | null = null;
    let isFamilyMatch = false;
    let matchedFamilyDetail: FamilyMember | null = null;

    // Search in Head: contact, name, id, address
    for (const m of existingMembers) {
      const headContact = String(m.contactNo || '');
      const headName = String(m.name || '').toLowerCase();
      const headId = String(m.id || '').toLowerCase();
      const headAddr = String(m.address || '').toLowerCase();

      if (headContact.includes(query) || headName.includes(query) || headId.includes(query) || headAddr.includes(query)) {
        matchedMember = m;
        break;
      }

      // Search family members — guard against null contactNo
      const fmMatch = (m.familyMembers || []).find(f =>
        String(f.contactNo || '').includes(query) ||
        String(f.name || '').toLowerCase().includes(query)
      );
      if (fmMatch) {
        matchedMember = m;
        isFamilyMatch = true;
        matchedFamilyDetail = fmMatch;
        break;
      }
    }

    if (matchedMember) {
      if (isFamilyMatch && matchedFamilyDetail) {
        // If a family member matched, we swap their details to the top level 
        // just for the display in the popup view.
        const displayMember: Member = {
          ...matchedMember,
          name: `${matchedFamilyDetail.name} (Family of ${matchedMember.name})`,
          dob: matchedFamilyDetail.dob,
          doa: matchedFamilyDetail.doa,
          contactNo: matchedFamilyDetail.contactNo,
          maritalStatus: matchedFamilyDetail.maritalStatus,
          occupation: matchedFamilyDetail.occupation,
          gender: matchedFamilyDetail.relationship // Best approximation for display
        };
        setFoundMember(displayMember);
      } else {
        setFoundMember(matchedMember); // Open Popup with Head Info
      }
    } else {
      setToastMessage("No member found with this number.");
      setToastType('error');
      setShowToast(true);
    }
  };

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFamilyCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;

    setFormData(prev => {
      const currentMembers = [...prev.familyMembers];
      let newMembers = currentMembers;

      if (count > currentMembers.length) {
        const rowsToAdd = count - currentMembers.length;
        const newRows = Array(rowsToAdd).fill(EMPTY_FAMILY_MEMBER);
        newMembers = [...currentMembers, ...newRows];
      } else if (count < currentMembers.length) {
        newMembers = currentMembers.slice(0, count);
      }

      return {
        ...prev,
        familyCount: count,
        familyMembers: newMembers
      };
    });
  };

  const handleCheckboxChange = (name: keyof Member, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePurposeChange = (key: keyof typeof formData.purpose, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      purpose: { ...prev.purpose, [key]: checked }
    }));
  };

  const handleFamilyChange = (index: number, field: keyof FamilyMember, value: string) => {
    const updatedFamily = [...formData.familyMembers];
    updatedFamily[index] = { ...updatedFamily[index], [field]: value };
    setFormData(prev => ({ ...prev, familyMembers: updatedFamily }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.contactNo) {
      setToastMessage("Primary Contact Number is required");
      setToastType('error');
      setShowToast(true);
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const newMember = {
        ...formData,
        id: formData.id || Date.now().toString(), // Use existing ID if edit, else new
        date: formData.date || new Date().toISOString().split('T')[0]
      };

      onAddMember(newMember);
      setIsLoading(false);
      setToastMessage(initialData ? "Member details updated!" : "Member added successfully!");
      setToastType('success');
      setShowToast(true);

      if (!isModal && !initialData) {
        setFormData(INITIAL_FORM_STATE);
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  };

  // --- Render Helpers ---
  const SectionHeader = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-6 mt-8">
      {icon && <div className="text-brand-600">{icon}</div>}
      <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
    </div>
  );

  return (
    <div className={`relative ${isModal ? '' : 'max-w-7xl mx-auto pb-32'}`}>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      {/* FOUND MEMBER POPUP */}
      {foundMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
            <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserIcon size={24} className="text-brand-100" />
                <div>
                  <h3 className="text-lg font-bold">Existing Visitor Found</h3>
                  <p className="text-brand-100 text-xs">Record matches your search</p>
                </div>
              </div>
              <button onClick={() => setFoundMember(null)} className="text-brand-100 hover:text-white transition-colors">
                <XIcon size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <UserIcon size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Name</p>
                    <p className="text-slate-800 font-bold text-lg">{foundMember.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <PhoneIcon size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Contact</p>
                    <p className="text-slate-800 font-medium">{foundMember.contactNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Type</p>
                    <p className="text-slate-700 font-semibold text-sm mt-1">{foundMember.visitorType}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Family Size</p>
                    <p className="text-slate-700 font-semibold text-sm mt-1">{foundMember.familyCount} Members</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setFoundMember(null)}
                  className="border-slate-300 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={() => printMemberForm(foundMember)}
                  className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                  <PrinterIcon size={18} className="mr-2" />
                  Print Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isModal && (
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {initialData ? 'Edit Member Details' : 'New Member Registration'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {initialData ? 'Update the details below.' : 'Enter the details of the Head of the Family and their members.'}
              </p>
            </div>
          </div>

          {/* SEARCH BAR SECTION */}
          {!initialData && (
            <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="flex-1 max-w-md relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by Mobile Number..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button type="button" onClick={handleSearch} className="px-6 h-11">
                Search
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${isModal ? '' : 'bg-white rounded-2xl border border-slate-200 shadow-sm'}`}>

        <div className={isModal ? 'p-1' : 'p-8'}>
          {/* 1. VISITOR TYPE */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Visitor Type</label>
            <div className="flex flex-wrap gap-4">
              {['New Visitor', 'Shalom Church Member', 'Power Ministry'].map((type) => (
                <label key={type} className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition-all ${formData.visitorType === type ? 'bg-brand-600 border-brand-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 hover:border-brand-300 text-slate-700'}`}>
                  <input
                    type="radio"
                    name="visitorType"
                    value={type}
                    checked={formData.visitorType === type}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="font-semibold">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. PERSONAL DETAILS */}
          <SectionHeader title="Head of Family / Personal Details" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Input label="Name (Head of Family)" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="md:col-span-1" />
            <Input label="Contact No (Primary)" name="contactNo" value={formData.contactNo} onChange={handleInputChange} placeholder="+91" />
            <Input label="Occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">DOB</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-brand-500 text-slate-900 font-medium scheme-light" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Wedding Anniversary</label>
              <input type="date" name="doa" value={formData.doa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-brand-500 text-slate-900 font-medium scheme-light" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-brand-500 text-slate-900 font-medium h-12">
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <Input label="Check In-Time" name="checkInTime" value={formData.checkInTime} onChange={handleInputChange} type="time" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Residential Address</label>
              <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-brand-500 text-slate-900 font-medium placeholder:text-slate-400 resize-none"></textarea>
            </div>
            <div className="flex flex-col justify-end gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5 text-left items-start">
                  <label className="text-sm font-semibold text-slate-700">District <span className="text-red-500">*</span></label>
                  <select name="district" value={formData.district || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-brand-500 text-slate-900 font-medium h-12">
                    <option value="">Select District</option>
                    {TAMIL_NADU_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <Input label="How did you hear about Ministry?" name="heardAbout" value={formData.heardAbout} onChange={handleInputChange} placeholder="e.g. Friends" />
              </div>
            </div>
          </div>

          {/* 3. FAMILY TABLE - REFINED UI */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <UsersIcon className="text-brand-600" /> Family Details
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600">No. of People:</span>
                <input
                  type="number"
                  name="familyCount"
                  value={formData.familyCount === 0 ? '' : formData.familyCount}
                  onChange={handleFamilyCountChange}
                  placeholder="0"
                  min="0"
                  max="20"
                  className="w-20 bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2 outline-none focus:border-brand-500 text-slate-900 font-bold text-center text-lg shadow-sm"
                />
              </div>
            </div>

            {formData.familyCount > 0 ? (
              <div className="overflow-x-auto mt-2 w-full max-w-[100vw] sm:max-w-none">
                <table className="w-full text-left border-collapse border border-slate-300 min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                      <th className="border border-slate-300 p-2 text-center w-10">#</th>
                      <th className="border border-slate-300 p-2 min-w-[150px]">Name</th>
                      <th className="border border-slate-300 p-2 min-w-[120px]">Relationship</th>
                      <th className="border border-slate-300 p-2 min-w-[130px]">DOB</th>
                      <th className="border border-slate-300 p-2 min-w-[130px]">Anniversary</th>
                      <th className="border border-slate-300 p-2 min-w-[130px]">Qualification</th>
                      <th className="border border-slate-300 p-2 min-w-[130px]">Occupation</th>
                      <th className="border border-slate-300 p-2 min-w-[120px]">Contact No</th>
                      <th className="border border-slate-300 p-2 min-w-[120px]">Marital Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.familyMembers.map((member, index) => (
                      <tr key={index} className="bg-white">
                        <td className="border border-slate-300 p-2 text-center text-slate-500 font-medium text-xs">{index + 1}</td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm placeholder:text-slate-300 focus:bg-blue-50/30 transition-colors"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => handleFamilyChange(index, 'name', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm placeholder:text-slate-300 focus:bg-blue-50/30 transition-colors"
                            placeholder="Relation"
                            value={member.relationship}
                            onChange={(e) => handleFamilyChange(index, 'relationship', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="date"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm text-slate-600 focus:bg-blue-50/30 transition-colors"
                            value={member.dob}
                            onChange={(e) => handleFamilyChange(index, 'dob', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="date"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm text-slate-600 focus:bg-blue-50/30 transition-colors"
                            value={member.doa}
                            onChange={(e) => handleFamilyChange(index, 'doa', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm placeholder:text-slate-300 focus:bg-blue-50/30 transition-colors"
                            placeholder="Qualification"
                            value={member.qualification}
                            onChange={(e) => handleFamilyChange(index, 'qualification', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm placeholder:text-slate-300 focus:bg-blue-50/30 transition-colors"
                            placeholder="Occupation"
                            value={member.occupation}
                            onChange={(e) => handleFamilyChange(index, 'occupation', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <input
                            type="text"
                            className="w-full h-full p-2 outline-none bg-transparent text-sm placeholder:text-slate-300 focus:bg-blue-50/30 transition-colors"
                            placeholder="Contact No"
                            value={member.contactNo}
                            onChange={(e) => handleFamilyChange(index, 'contactNo', e.target.value)}
                          />
                        </td>
                        <td className="border border-slate-300 p-0">
                          <select
                            className="w-full h-full p-2 outline-none bg-transparent text-sm text-slate-700 cursor-pointer focus:bg-blue-50/30 transition-colors"
                            value={member.maritalStatus}
                            onChange={(e) => handleFamilyChange(index, 'maritalStatus', e.target.value)}
                          >
                            <option value="" className="text-slate-400">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <UsersIcon size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-bold text-lg">No Family Members Added</p>
                <p className="text-slate-400 text-sm mt-1">Enter the "No. of People" above to generate rows.</p>
              </div>
            )}
          </div>

          {/* 4. MINISTRY & CHURCH */}
          <SectionHeader title="Ministry and Church Involvement" />
          <div className="space-y-4">
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-slate-700 w-64">1) Are you involved in Ministry?</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" name="involvedInMinistry" checked={formData.involvedInMinistry === true} onChange={() => handleCheckboxChange('involvedInMinistry', true)} className="text-brand-600" /> Yes</label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" name="involvedInMinistry" checked={formData.involvedInMinistry === false} onChange={() => handleCheckboxChange('involvedInMinistry', false)} className="text-brand-600" /> No</label>
              </div>
              {formData.involvedInMinistry && (
                <div className="flex gap-4 ml-4 bg-slate-50 p-2 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium"><input type="radio" name="ministryType" value="Full Time" checked={formData.ministryType === 'Full Time'} onChange={handleInputChange} /> Full Time</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium"><input type="radio" name="ministryType" value="Part Time" checked={formData.ministryType === 'Part Time'} onChange={handleInputChange} /> Part Time</label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-slate-700 w-64">2) Are you a regular church-goer?</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" name="regularChurchGoer" checked={formData.regularChurchGoer === true} onChange={() => handleCheckboxChange('regularChurchGoer', true)} className="text-brand-600" /> Yes</label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" name="regularChurchGoer" checked={formData.regularChurchGoer === false} onChange={() => handleCheckboxChange('regularChurchGoer', false)} className="text-brand-600" /> No</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Church Name" name="churchName" value={formData.churchName} onChange={handleInputChange} />
              <Input label="Area" name="churchArea" value={formData.churchArea} onChange={handleInputChange} />
            </div>
          </div>

          {/* 5. SPIRITUAL BACKGROUND */}
          <SectionHeader title="Spiritual Background" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {[
              { label: '1) Baptism Status', key: 'baptismStatus' },
              { label: '2) Holy Spirit Anointing', key: 'holySpiritAnointing' },
              { label: '3) Holy Communion Participation', key: 'holyCommunion' },
              { label: '4) Love of Jesus Ministry Events?', key: 'loveOfJesusEvents' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData[item.key as keyof Member] === true} onChange={() => handleCheckboxChange(item.key as keyof Member, true)} className="text-brand-600" /> Yes</label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData[item.key as keyof Member] === false} onChange={() => handleCheckboxChange(item.key as keyof Member, false)} className="text-brand-600" /> No</label>
                </div>
              </div>
            ))}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <Input label="Church Activities" name="churchActivities" value={formData.churchActivities} onChange={handleInputChange} />
              <Input label="Position" name="churchPosition" value={formData.churchPosition} onChange={handleInputChange} />
            </div>
          </div>

          {/* 6. PURPOSE OF VISIT */}
          <SectionHeader title="Purpose of Visit" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {Object.keys(formData.purpose).filter(k => k !== 'otherDetails').map((key) => (
              <Checkbox
                key={key}
                id={`purpose-${key}`}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                checked={formData.purpose[key as keyof typeof formData.purpose] as boolean}
                onChange={(e) => handlePurposeChange(key as keyof typeof formData.purpose, e.target.checked)}
                className="text-slate-700"
              />
            ))}
          </div>
          <Input label="Other Details (if any)" value={formData.purpose.otherDetails} onChange={(e) => setFormData(prev => ({ ...prev, purpose: { ...prev.purpose, otherDetails: e.target.value } }))} />

          {/* 7. ADDITIONAL INFORMATION */}
          <SectionHeader title="Additional Information" />
          <div className="space-y-3">
            {[
              { label: '1) Do you have any tattoos?', key: 'tattoos' },
              { label: '2) Have you been involved in occult practices?', key: 'occultPractices' },
              { label: '3) Possess objects related to black magic?', key: 'blackMagicObjects' },
              { label: '4) Practiced astrology or sorcery?', key: 'astrology' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-6 py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700 font-medium flex-1">{item.label}</span>
                <div className="flex gap-4 w-32">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData[item.key as keyof Member] === true} onChange={() => handleCheckboxChange(item.key as keyof Member, true)} className="text-brand-600" /> Yes</label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData[item.key as keyof Member] === false} onChange={() => handleCheckboxChange(item.key as keyof Member, false)} className="text-brand-600" /> No</label>
                </div>
              </div>
            ))}
          </div>

          {/* 8. ADMIN USE & DNC & GGRP */}
          <SectionHeader title="Office Use Only" />

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex-1 flex items-start gap-3">
              <Checkbox
                id="dnc-check"
                label=""
                checked={formData.dnc}
                onChange={(e) => handleCheckboxChange('dnc', e.target.checked)}
                className="mt-1"
              />
              <div>
                <label htmlFor="dnc-check" className="font-bold text-red-700 block cursor-pointer">DNC (Do Not Call)</label>
                <p className="text-xs text-red-600 mt-0.5">Check if member requested no contact.</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex-1 flex items-start gap-3">
              <Checkbox
                id="ggrp-check"
                label=""
                checked={formData.ggrp}
                onChange={(e) => handleCheckboxChange('ggrp', e.target.checked)}
                className="mt-1"
              />
              <div>
                <label htmlFor="ggrp-check" className="font-bold text-purple-700 block cursor-pointer">GGRP Member</label>
                <p className="text-xs text-purple-600 mt-0.5">Check if part of GGRP.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Front Office Incharge" name="frontOfficeIncharge" value={formData.frontOfficeIncharge} onChange={handleInputChange} />
            <Input label="Counsellor" name="counsellor" value={formData.counsellor} onChange={handleInputChange} />
            <Input label="Prayer Warrior" name="prayerWarrior" value={formData.prayerWarrior} onChange={handleInputChange} />
            <Input label="Follow-up Officer" name="followUpOfficer" value={formData.followUpOfficer} onChange={handleInputChange} />
          </div>

          {/* CONSENT */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Checkbox
              id="consent-check"
              label="I hereby declare that I have come to Love of Jesus Ministry of my own free will and consent."
              checked={formData.consent}
              onChange={(e) => handleCheckboxChange('consent', e.target.checked)}
              className="text-slate-700 font-medium"
            />
          </div>
        </div>

        {
          isModal && (
            <div className="p-4 border-t border-slate-100 flex justify-end gap-4 bg-white sticky bottom-0 rounded-b-2xl z-10">
              <Button type="button" variant="outline" onClick={onCancel} className="w-24">
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} onClick={handleSubmit} className="w-40">
                {initialData ? 'Update' : 'Save'}
              </Button>
            </div>
          )
        }

      </form >

      {/* FIXED SAVE BUTTON AT BOTTOM (ONLY IF NOT MODAL) */}
      {
        !isModal && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-xl z-40 flex justify-end gap-4 lg:pl-72">
            <div className="w-full max-w-7xl mx-auto flex justify-end">
              <Button type="submit" isLoading={isLoading} onClick={handleSubmit} className="w-full sm:w-64">
                <UserPlusIcon size={18} className="mr-2" />
                {initialData ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </div>
        )
      }
    </div >
  );
};