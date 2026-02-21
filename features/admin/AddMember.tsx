import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { Toast } from '../../components/ui/Toast';
import { UserPlusIcon, UsersIcon, SearchIcon, PrinterIcon, XIcon, UserIcon, PhoneIcon } from '../../components/Icons';
import { Member, FamilyMember } from '../../types';

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
    notes: '',
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

    const query = searchQuery.trim();
    // Search in Head Contact or Family Member Contact
    const found = existingMembers.find(m => 
        m.contactNo.includes(query) || 
        m.familyMembers.some(f => f.contactNo.includes(query))
    );

    if (found) {
        setFoundMember(found); // Open Popup
    } else {
        setToastMessage("No member found with this number.");
        setToastType('error');
        setShowToast(true);
    }
  };

  // --- Print Handler (Populate Data) ---
  const handlePrintMember = (member: Member) => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;

    // Helper to check box
    const chk = (condition: boolean) => condition ? '✓' : '';
    
    // Helper to generate family rows
    const generateRows = () => {
        let rows = '';
        for(let i = 0; i < 5; i++) {
            const fm = member.familyMembers[i] || EMPTY_FAMILY_MEMBER;
            rows += `
                <tr style="height: 28px;">
                    <td style="text-align: center;">${i + 1}</td>
                    <td>${fm.name || ''}</td>
                    <td>${fm.dob || ''}</td>
                    <td>${fm.qualification || ''}</td>
                    <td>${fm.maritalStatus || ''}</td>
                </tr>
            `;
        }
        return rows;
    };

    // Helper to format contact into boxes
    const formatContact = (num: string) => {
        if (!num) return '<span class="contact-box"></span>'.repeat(10);
        return num.split('').map(d => `<span class="contact-box" style="text-align:center; line-height: 18px;">${d}</span>`).join('') + 
               '<span class="contact-box"></span>'.repeat(Math.max(0, 10 - num.length));
    };

    const formHTML = `
      <div class="print-content-wrapper">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          
          .print-content-wrapper { 
            font-family: "Times New Roman", Times, serif; 
            font-size: 11pt; 
            line-height: 1.2; 
            color: #000;
            background: white;
            width: 100%;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .flex { display: flex; }
          .box-input { 
            display: inline-block; 
            width: 14px; 
            height: 14px; 
            border: 1px solid black; 
            vertical-align: middle; 
            margin: 0 4px;
            text-align: center;
            line-height: 12px;
            font-size: 12px;
          }
          .contact-box {
            display: inline-block; 
            width: 18px; 
            height: 20px; 
            border: 1px solid black; 
            vertical-align: middle; 
            margin-right: -1px;
          }
          .section-header { 
            border: 1px solid black; 
            padding: 4px; 
            text-align: center; 
            font-weight: bold; 
            margin-top: 12px; 
            margin-bottom: 6px; 
            font-size: 11.5pt;
            background-color: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          td, th { border: 1px solid black; padding: 4px; vertical-align: top; text-align: left; font-size: 10.5pt; }
          th { text-align: center; vertical-align: middle; background: #f9f9f9; }
          .tamil { font-size: 9.5pt; display: block; margin-top: 2px; font-weight: normal; }
          .header-title h1 { margin: 2px 0; font-size: 18pt; }
          .header-title h2 { margin: 2px 0; font-size: 14pt; }
          .clean-table td { border: none; padding: 2px 0; }
          .page-break { page-break-after: always; }
        </style>
        
        <!-- PAGE 1 -->
        <div class="header-title text-center">
           <h1 class="font-bold">LOVE OF JESUS MINISTRY</h1>
           <h2 class="font-bold">APPOINTMENT PRAYER</h2>
           <h2 class="font-bold">APPLICATION FORM</h2>
        </div>

        <div style="margin-top: 10px; border: 1px solid black; padding: 0; display: flex; font-weight: bold; font-size: 10.5pt;">
            <div style="padding: 5px; width: 30%; border-right: 1px solid black;">APP NO: ${member.appNo || ''}</div>
            <div style="padding: 5px; width: 40%; text-align: center; border-right: 1px solid black;">VISITOR INFORMATION</div>
            <div style="padding: 5px; width: 30%;">Date: ${member.date || ''}</div>
        </div>

        <div style="display: flex; border: 1px solid black; border-top: none; font-size: 10pt;">
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             New Visitor <span class="box-input">${chk(member.visitorType === 'New Visitor')}</span><br><span class="tamil">புதியவர்</span>
          </div>
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             Existing Visitor <span class="box-input"></span><br><span class="tamil">ஏற்கனவே வந்தவர்</span>
          </div>
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             Shalom Church Member <span class="box-input">${chk(member.visitorType === 'Shalom Church Member')}</span><br><span class="tamil">ஷாலோம் சபையின் அங்கத்தினர்</span>
          </div>
          <div style="flex: 1; padding: 5px;">
             Power Ministry <span class="box-input">${chk(member.visitorType === 'Power Ministry')}</span><br><span class="tamil">வல்லமை பயிற்சி எடுத்தவர்</span>
          </div>
        </div>

        <div style="margin: 10px 0; font-size: 10.5pt;">
          No.of People in family <span class="box-input" style="width: 35px;">${member.familyCount}</span> 
          <span style="font-size: 9.5pt;">(குடும்ப நபர்களின் எண்ணிக்கை)</span>
          <span style="float: right; margin-right: 40px;">Batch <span class="box-input" style="width: 60px;">${member.batch || ''}</span></span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">S.NO<br><span class="tamil">வ.எண்</span></th>
              <th style="width: 32%;">Name<br><span class="tamil">பெயர்</span></th>
              <th style="width: 15%;">DOB<br><span class="tamil">பிறந்த தேதி</span></th>
              <th style="width: 20%;">Qualification<br><span class="tamil">கல்வி தகுதி</span></th>
              <th style="width: 25%;">Marital Status<br><span class="tamil">(திருமணம் ஆனவரா)</span></th>
            </tr>
          </thead>
          <tbody>
            ${generateRows()}
          </tbody>
        </table>

        <div style="font-size: 10.5pt; line-height: 1.6;">
          Address (முழுவிலாசம்): <u>${member.address || '________________________________________________________'}</u><br>
          
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <div>Check In-Time: <u>${member.checkInTime || '___________'}</u> <span class="tamil" style="display:inline;">(உள்ளே வரும் நேரம்)</span></div>
            <div>
               Contact No: ${formatContact(member.contactNo)}
            </div>
          </div>
          
          <div style="margin-top: 8px;">
            Occupation(தொழில்): <u>${member.occupation || '____________________'}</u>
          </div>
          <div style="margin-top: 8px;">
             How did you hear about Love of Jesus Ministry? <u>${member.heardAbout || '__________________________________'}</u><br>
             <span class="tamil">எப்படி இயேசுவின் அன்பின் ஊழியத்தை தெரிந்துகொண்டீர்கள்?</span>
          </div>
        </div>

        <div class="section-header">MINISTRY AND CHURCH INVOLVEMENT</div>
        <div style="font-size: 10.5pt; line-height: 1.5;">
          <div style="margin-bottom: 6px;">
            1) Are you involved in Ministry? &nbsp; Yes <span class="box-input">${chk(member.involvedInMinistry)}</span> &nbsp; No <span class="box-input">${chk(!member.involvedInMinistry)}</span> 
            &nbsp;&nbsp;&nbsp; Type: Full Time <span class="box-input">${chk(member.ministryType === 'Full Time')}</span> &nbsp; Part Time <span class="box-input">${chk(member.ministryType === 'Part Time')}</span><br>
            <span class="tamil" style="margin-left: 20px;">ஊழியம் செய்கின்றவரா? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; முழு நேரம் &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; பகுதி நேரம்</span>
          </div>
          <div style="margin-bottom: 6px;">
            2) Are you a regular church-goer? &nbsp; Yes <span class="box-input">${chk(member.regularChurchGoer)}</span> &nbsp; No <span class="box-input">${chk(!member.regularChurchGoer)}</span><br>
            <span class="tamil" style="margin-left: 20px;">தவறாமல் சபைக்கு செல்கிறீர்களா?</span>
          </div>
          <div>
            3) Church Name: <u>${member.churchName || '________________'}</u> Area: <u>${member.churchArea || '________________'}</u><br>
            <span class="tamil" style="margin-left: 20px;">(எந்த திருச்சபையை சார்ந்தவர்)</span>
          </div>
        </div>

        <div class="section-header">SPIRITUAL BACKGROUND</div>
        <table class="clean-table" style="font-size: 10.5pt;">
          <tr>
            <td width="85%">1) Baptism Status: <span class="tamil" style="display:inline;">(ஞானஸ்நானம் பெற்றிருக்கிறீர்களா?)</span></td>
            <td>Yes <span class="box-input">${chk(member.baptismStatus)}</span> &nbsp; No <span class="box-input">${chk(!member.baptismStatus)}</span></td>
          </tr>
          <tr>
            <td>2) Holy Spirit Anointing: <span class="tamil" style="display:inline;">(பரிசுத்த ஆவி அபிஷேகம் பெற்றிருக்கிறீர்களா?)</span></td>
            <td>Yes <span class="box-input">${chk(member.holySpiritAnointing)}</span> &nbsp; No <span class="box-input">${chk(!member.holySpiritAnointing)}</span></td>
          </tr>
          <tr>
            <td>3) Church Activities: <u>${member.churchActivities || '___'}</u> Position: <u>${member.churchPosition || '___'}</u> <span class="tamil" style="display:inline;">(சபையில் ஊழிய நடவடிக்கைகள்)</span></td>
            <td>Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span></td>
          </tr>
          <tr>
            <td>4) Holy Communion Participation: <span class="tamil" style="display:inline;">(திருவிருந்து பெற்றுவருகின்றவரா?)</span></td>
            <td>Yes <span class="box-input">${chk(member.holyCommunion)}</span> &nbsp; No <span class="box-input">${chk(!member.holyCommunion)}</span></td>
          </tr>
        </table>

        <div class="page-break"></div>

        <!-- PAGE 2 -->
        <div class="section-header" style="margin-top: 0;">PURPOSE OF VISIT</div>
        <table>
          <tr>
            <td width="33%">Family Issue <span class="box-input" style="float:right">${chk(member.purpose.familyIssue)}</span><br><span class="tamil">(குடும்ப பிரச்சினை)</span></td>
            <td width="33%">Bondages <span class="box-input" style="float:right">${chk(member.purpose.bondages)}</span><br><span class="tamil">(கட்டுகள் உடைக்கப்பட)</span></td>
            <td width="33%">Friends <span class="box-input" style="float:right">${chk(member.purpose.friends)}</span><br><span class="tamil">(நண்பர்களுக்காக)</span></td>
          </tr>
          <tr>
            <td>Health Issue <span class="box-input" style="float:right">${chk(member.purpose.healthIssue)}</span><br><span class="tamil">(சரீர சுகத்திற்காக)</span></td>
            <td>WitchCraft <span class="box-input" style="float:right">${chk(member.purpose.witchCraft)}</span><br><span class="tamil">(செய்வினைவிட்டு நீங்க)</span></td>
            <td>Others <span class="box-input" style="float:right">${chk(member.purpose.others)}</span><br><span class="tamil">(மற்ற காரியங்கள்)</span></td>
          </tr>
          <tr>
            <td>Work Issue <span class="box-input" style="float:right">${chk(member.purpose.workIssue)}</span><br><span class="tamil">(வேலையில் பிரச்சினை)</span></td>
            <td>Deliverance <span class="box-input" style="float:right">${chk(member.purpose.deliverance)}</span><br><span class="tamil">(விடுதலைக்காக)</span></td>
            <td>${member.purpose.otherDetails || '_______________________'}</td>
          </tr>
          <tr>
            <td>Personal Issues <span class="box-input" style="float:right">${chk(member.purpose.personalIssues)}</span><br><span class="tamil">(தனிப்பட்ட பிரச்சினை)</span></td>
            <td>Prophecy <span class="box-input" style="float:right">${chk(member.purpose.prophecy)}</span><br><span class="tamil">(தீர்க்கதரிசனத்திற்காக)</span></td>
            <td></td>
          </tr>
           <tr>
            <td>Relative <span class="box-input" style="float:right">${chk(member.purpose.relative)}</span><br><span class="tamil">(உறவினர்களுக்காக)</span></td>
            <td>Counselling <span class="box-input" style="float:right">${chk(member.purpose.counselling)}</span><br><span class="tamil">(ஆலோசனைக்காக)</span></td>
            <td></td>
          </tr>
        </table>

        <div class="section-header">ADDITIONAL INFORMATION</div>
        <div style="font-size: 10.5pt; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            1) Do you have any tattoos? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.tattoos)}</span> &nbsp; No <span class="box-input">${chk(!member.tattoos)}</span> <br>
            <span class="tamil">பச்சை குத்தியுள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            2) Have you been involved in occult practices or consulted with witch doctors? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.occultPractices)}</span> &nbsp; No <span class="box-input">${chk(!member.occultPractices)}</span> <br>
            <span class="tamil">தவறான பழக்கவழக்கங்களில் ஈடுபட்டு அதற்காக மருத்துவரின் ஆலோசனையை அணுகியுள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            3) Do you possess any objects related to black magic or occult practices? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.blackMagicObjects)}</span> &nbsp; No <span class="box-input">${chk(!member.blackMagicObjects)}</span> <br>
            <span class="tamil">மந்திர, சூனிய காரியங்களில் ஈடுபட்டு அதற்கு உண்டான பொருட்களை வைத்துள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            4) Have you practiced astrology or consulted with sorcery practitioners? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.astrology)}</span> &nbsp; No <span class="box-input">${chk(!member.astrology)}</span> <br>
            <span class="tamil">ஜோசியம், ஜாதகம் பார்க்க அதற்குரிய நபர்களை அணுகியுள்ளீர்களா?</span>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid black; margin: 20px 0;">

        <div class="section-header">CONSENT AND DECLARATION</div>
        <div style="font-size: 10.5pt; text-align: justify; margin-bottom: 20px;">
          I hereby declare that I have come to Love of Jesus Ministry of my own free will and consent.<br>
          <span class="tamil">இதன் மூலம் இயேசுவின் அன்பின் ஊழியத்திற்கு யாருடைய கட்டாயத்தினால் அல்ல. சுயமாக சொந்தவிருப்பத்தின்படி வந்திருக்கிறேன் என்பதை உறுதி அளிக்கிறேன்.</span><br><br>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
               Yes <span class="box-input">${chk(member.consent)}</span> (Please tick)<br><br>
               Date: ........................
            </div>
            <div style="text-align: right;">
               ............................................................<br>
               Signature(கையெழுத்து)
            </div>
          </div>
        </div>

        <div style="border: 2px solid black; padding: 10px; margin-top: 20px;">
          <div class="section-header" style="margin-top: 0; border: 1px solid black; display: inline-block; padding: 5px 20px; width: auto; background: white; margin-bottom: 10px;">FOR AUTHORIZED PERSON</div>
          <span style="float: right; font-weight: bold; font-size: 10pt;">For Office Use Only</span>
          
          <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-top: 10px;">
            <div style="width: 55%; line-height: 2.0;">
              Front Office Incharge : <u>${member.frontOfficeIncharge || '.......................'}</u><br>
              <span class="tamil" style="margin-top: -5px;">(முன் அலுவலக பொறுப்பாளர்)</span>
              Counsellor (ஆலோசகர்): <u>${member.counsellor || '.......................'}</u><br>
              Prayer Warrior (ஜெபவீரர்) : <u>${member.prayerWarrior || '.......................'}</u><br>
              Followingup’s Officer : <u>${member.followUpOfficer || '.......................'}</u><br>
              <span class="tamil" style="margin-top: -5px;">(பின் தொடரும் அலுவலர்)</span>
            </div>
            
            <div style="width: 40%; line-height: 2.0;">
              Date(தேதி): .....................<br>
              Month(மாதம்): .....................<br>
              Year(வருடம்): .....................<br>
              Time(நேரம்): .....................<br><br>
              ................................................<br>
              Signature(கையெழுத்து)
            </div>
          </div>
        </div>
      </div>
    `;

    printSection.innerHTML = formHTML;
    setTimeout(() => {
        window.print();
    }, 100);
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
        alert("Primary Contact Number is required");
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
                            onClick={() => handlePrintMember(foundMember)}
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
                <div className="flex flex-col justify-end">
                    <Input label="How did you hear about Ministry?" name="heardAbout" value={formData.heardAbout} onChange={handleInputChange} placeholder="e.g. Friends, Social Media" />
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
                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white ring-1 ring-slate-900/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                                        <th className="py-4 px-4 text-center font-bold text-xs uppercase tracking-wider w-12 text-slate-400">#</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[180px] text-slate-600">Name</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">Relationship</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">DOB</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">Anniversary</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">Qualification</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">Occupation</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[150px] text-slate-600">Contact No</th>
                                        <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider min-w-[140px] text-slate-600">Marital Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {formData.familyMembers.map((member, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-center text-slate-400 font-medium text-xs">{index + 1}</td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 font-medium transition-all placeholder:text-slate-400 focus:shadow-sm focus:ring-2 focus:ring-brand-500/10" 
                                                    placeholder="Full Name" 
                                                    value={member.name} 
                                                    onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 font-medium transition-all placeholder:text-slate-400 focus:shadow-sm focus:ring-2 focus:ring-brand-500/10" 
                                                    placeholder="Relation" 
                                                    value={member.relationship} 
                                                    onChange={(e) => handleFamilyChange(index, 'relationship', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="date" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 text-xs scheme-light transition-all focus:shadow-sm focus:ring-2 focus:ring-brand-500/10 font-medium" 
                                                    value={member.dob} 
                                                    onChange={(e) => handleFamilyChange(index, 'dob', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="date" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 text-xs scheme-light transition-all focus:shadow-sm focus:ring-2 focus:ring-brand-500/10 font-medium" 
                                                    value={member.doa} 
                                                    onChange={(e) => handleFamilyChange(index, 'doa', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 font-medium transition-all placeholder:text-slate-400 focus:shadow-sm focus:ring-2 focus:ring-brand-500/10" 
                                                    placeholder="Qualification" 
                                                    value={member.qualification} 
                                                    onChange={(e) => handleFamilyChange(index, 'qualification', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 font-medium transition-all placeholder:text-slate-400 focus:shadow-sm focus:ring-2 focus:ring-brand-500/10" 
                                                    placeholder="Occupation" 
                                                    value={member.occupation} 
                                                    onChange={(e) => handleFamilyChange(index, 'occupation', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 font-medium transition-all placeholder:text-slate-400 focus:shadow-sm focus:ring-2 focus:ring-brand-500/10" 
                                                    placeholder="Contact No" 
                                                    value={member.contactNo} 
                                                    onChange={(e) => handleFamilyChange(index, 'contactNo', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select 
                                                    className="w-full px-3 py-2.5 bg-slate-50/50 focus:bg-white border border-transparent focus:border-brand-300 rounded-lg outline-none text-slate-900 text-sm transition-all focus:shadow-sm focus:ring-2 focus:ring-brand-500/10 cursor-pointer font-medium" 
                                                    value={member.maritalStatus} 
                                                    onChange={(e) => handleFamilyChange(index, 'maritalStatus', e.target.value)}
                                                >
                                                    <option value="">Select Status</option>
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
            <Input label="Other Details (if any)" value={formData.purpose.otherDetails} onChange={(e) => setFormData(prev => ({ ...prev, purpose: { ...prev.purpose, otherDetails: e.target.value }}))} />

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

        {isModal && (
            <div className="p-4 border-t border-slate-100 flex justify-end gap-4 bg-white sticky bottom-0 rounded-b-2xl z-10">
                <Button type="button" variant="outline" onClick={onCancel} className="w-24">
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} onClick={handleSubmit} className="w-40">
                    {initialData ? 'Update' : 'Save'}
                </Button>
            </div>
        )}

      </form>
      
      {/* FIXED SAVE BUTTON AT BOTTOM (ONLY IF NOT MODAL) */}
      {!isModal && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-xl z-40 flex justify-end gap-4 lg:pl-72">
            <div className="w-full max-w-7xl mx-auto flex justify-end">
                <Button type="submit" isLoading={isLoading} onClick={handleSubmit} className="w-full sm:w-64">
                    <UserPlusIcon size={18} className="mr-2" />
                    {initialData ? 'Update Record' : 'Save Record'}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};