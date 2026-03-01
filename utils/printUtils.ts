import { Member, FamilyMember } from '../types';

export const printMemberForm = (member: Member) => {
  const printSection = document.getElementById('print-section');
  if (!printSection) return;

  // Helper to check box
  const chk = (condition: boolean | undefined | null) => condition ? '✓' : '';

  // Helper to generate exactly 5 family rows to ensure layout stability
  const generateRows = () => {
    let rows = '';
    const fmList = member.familyMembers || [];
    for (let i = 0; i < 5; i++) {
      const fm = fmList[i];
      if (fm) {
        rows += `
          <tr style="height: 28px;">
              <td style="text-align: center;">${i + 1}</td>
              <td>${fm.name || ''}</td>
              <td style="text-align: center;">${fm.dob || ''}</td>
              <td>${fm.qualification || ''}</td>
              <td>${fm.maritalStatus || ''}</td>
          </tr>
        `;
      } else {
        rows += `
          <tr style="height: 28px;">
              <td style="text-align: center;">${i + 1}</td>
              <td></td><td></td><td></td><td></td>
          </tr>
        `;
      }
    }
    return rows;
  };

  // Helper to format contact into exactly 10 boxes (strip non-digits, take last 10)
  const formatContact = (num: string) => {
    const rawDigits = (num || '').replace(/\D/g, '');
    const cleanNum = rawDigits.slice(-10); // get last 10 exactly

    if (!cleanNum) return '<span class="contact-box"></span>'.repeat(10);

    return cleanNum.split('').map(d => `<span class="contact-box">${d}</span>`).join('') +
      '<span class="contact-box"></span>'.repeat(Math.max(0, 10 - cleanNum.length));
  };

  // Safe access to purpose object which might be missing on legacy data
  const purposeObj = member.purpose || {} as any;

  const formHTML = `
    <div class="print-content-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
        
        @page { margin: 0; }

        .print-content-wrapper { 
          font-family: "Times New Roman", Times, serif; 
          font-size: 11pt; 
          line-height: 1.2; 
          color: #000;
          background: white;
          width: 100%;
          padding: 10mm;
          box-sizing: border-box;
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
          font-size: 11px;
          font-weight: bold;
        }
        .contact-box {
          display: inline-block; 
          width: 18px; 
          height: 22px; 
          border: 1px solid black; 
          vertical-align: middle; 
          margin-right: -1px;
          text-align: center;
          line-height: 20px;
          font-size: 12px;
          font-weight: bold;
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
        u { text-decoration: none; border-bottom: 1px solid black; display: inline-block; padding-bottom: 1px; }
        
        /* Auto adjust text sizing for long values */
        .dynamic-text {
            word-wrap: break-word;
            white-space: pre-wrap;
        }
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
        No.of People in family <span class="box-input" style="width: 35px;">${member.familyCount || ''}</span> 
        <span style="font-size: 9.5pt;">(குடும்ப நபர்களின் எண்ணிக்கை)</span>
        <span style="float: right; margin-right: 40px;">Batch <span class="box-input" style="width: 60px;">${member.batch || ''}</span></span>
      </div>

      <div style="font-size: 10.5pt; margin-bottom: 6px; display: flex;">
        <span style="display:inline-block; min-width: 100px;">Name(பெயர்):</span> 
        <u style="flex:1; margin-left:10px;" class="dynamic-text"><strong>${member.name || ''}</strong></u>
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
        <div style="display: flex; margin-bottom: 4px;">
           <span style="width: 130px;">Address (முழுவிலாசம்):</span> 
           <u style="flex: 1; min-height: 18px;" class="dynamic-text">${member.address || '________________________________________________________'}</u>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <div>Check In-Time: <u style="min-width: 80px; text-align: center;">${member.checkInTime || '___________'}</u> <span class="tamil" style="display:inline;">(உள்ளே வரும் நேரம்)</span></div>
          <div>
             Contact No: ${formatContact(member.contactNo)}
          </div>
        </div>
        
        <div style="margin-top: 8px; display: flex;">
          <span style="display:inline-block; min-width: 150px;">Occupation(தொழில்):</span>
          <u style="flex:1" class="dynamic-text">${member.occupation || '____________________'}</u>
        </div>
        <div style="margin-top: 8px;">
           How did you hear about Love of Jesus Ministry? <u class="dynamic-text">${member.heardAbout || '__________________________________'}</u><br>
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
          3) Church Name: <u style="min-width: 150px;" class="dynamic-text">${member.churchName || '________________'}</u> Area: <u style="min-width: 120px;" class="dynamic-text">${member.churchArea || '________________'}</u><br>
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
          <td width="33%">Family Issue <span class="box-input" style="float:right">${chk(purposeObj.familyIssue)}</span><br><span class="tamil">(குடும்ப பிரச்சினை)</span></td>
          <td width="33%">Bondages <span class="box-input" style="float:right">${chk(purposeObj.bondages)}</span><br><span class="tamil">(கட்டுகள் உடைக்கப்பட)</span></td>
          <td width="33%">Friends <span class="box-input" style="float:right">${chk(purposeObj.friends)}</span><br><span class="tamil">(நண்பர்களுக்காக)</span></td>
        </tr>
        <tr>
          <td>Health Issue <span class="box-input" style="float:right">${chk(purposeObj.healthIssue)}</span><br><span class="tamil">(சரீர சுகத்திற்காக)</span></td>
          <td>WitchCraft <span class="box-input" style="float:right">${chk(purposeObj.witchCraft)}</span><br><span class="tamil">(செய்வினைவிட்டு நீங்க)</span></td>
          <td>Others <span class="box-input" style="float:right">${chk(purposeObj.others)}</span><br><span class="tamil">(மற்ற காரியங்கள்)</span></td>
        </tr>
        <tr>
          <td>Work Issue <span class="box-input" style="float:right">${chk(purposeObj.workIssue)}</span><br><span class="tamil">(வேலையில் பிரச்சினை)</span></td>
          <td>Deliverance <span class="box-input" style="float:right">${chk(purposeObj.deliverance)}</span><br><span class="tamil">(விடுதலைக்காக)</span></td>
          <td><u class="dynamic-text">${purposeObj.otherDetails || '_______________________'}</u></td>
        </tr>
        <tr>
          <td>Personal Issues <span class="box-input" style="float:right">${chk(purposeObj.personalIssues)}</span><br><span class="tamil">(தனிப்பட்ட பிரச்சினை)</span></td>
          <td>Prophecy <span class="box-input" style="float:right">${chk(purposeObj.prophecy)}</span><br><span class="tamil">(தீர்க்கதரிசனத்திற்காக)</span></td>
          <td></td>
        </tr>
         <tr>
          <td>Relative <span class="box-input" style="float:right">${chk(purposeObj.relative)}</span><br><span class="tamil">(உறவினர்களுக்காக)</span></td>
          <td>Counselling <span class="box-input" style="float:right">${chk(purposeObj.counselling)}</span><br><span class="tamil">(ஆலோசனைக்காக)</span></td>
          <td></td>
        </tr>
      </table>

      <div class="section-header">ADDITIONAL INFORMATION</div>
      <div style="font-size: 10.5pt; line-height: 1.5;">
        <div style="margin-bottom: 12px;">
          1) Do you have any tattoos? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.tattoos)}</span> &nbsp; No <span class="box-input">${chk(member.tattoos === false)}</span> <br>
          <span class="tamil">பச்சை குத்தியுள்ளீர்களா?</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          2) Have you been involved in occult practices or consulted with witch doctors? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.occultPractices)}</span> &nbsp; No <span class="box-input">${chk(member.occultPractices === false)}</span> <br>
          <span class="tamil">தவறான பழக்கவழக்கங்களில் ஈடுபட்டு அதற்காக மருத்துவரின் ஆலோசனையை அணுகியுள்ளீர்களா?</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          3) Do you possess any objects related to black magic or occult practices? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.blackMagicObjects)}</span> &nbsp; No <span class="box-input">${chk(member.blackMagicObjects === false)}</span> <br>
          <span class="tamil">மந்திர, சூனிய காரியங்களில் ஈடுபட்டு அதற்கு உண்டான பொருட்களை வைத்துள்ளீர்களா?</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          4) Have you practiced astrology or consulted with sorcery practitioners? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input">${chk(member.astrology)}</span> &nbsp; No <span class="box-input">${chk(member.astrology === false)}</span> <br>
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
    setTimeout(() => { printSection.innerHTML = ''; }, 100);
  }, 100);
};
