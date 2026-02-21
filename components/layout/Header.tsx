import React from 'react';
import { MenuIcon, SearchIcon, BellIcon, UserIcon, ChurchIcon, ChevronDownIcon, PrinterIcon } from '../Icons';

interface HeaderProps {
  role: 'super_admin' | 'admin';
  userEmail: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, userEmail, onMenuClick }) => {
  
  // --- Native Print Logic ---
  const handlePrintEmptyForm = () => {
    // 1. Get the container
    const printSection = document.getElementById('print-section');
    if (!printSection) return;

    // 2. Define the exact HTML content
    // We do NOT use window.open. We inject this into the current page's #print-section div.
    // CSS @media print handles the visibility.
    const formHTML = `
      <div class="print-content-wrapper">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          
          .print-content-wrapper { 
            font-family: "Times New Roman", Times, serif; 
            font-size: 11pt; /* Optimal for A4 readability */
            line-height: 1.2; 
            color: #000;
            background: white;
            width: 100%;
          }

          /* Utility Classes */
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          
          /* Box Styles */
          .box-input { 
            display: inline-block; 
            width: 14px; 
            height: 14px; 
            border: 1px solid black; 
            vertical-align: middle; 
            margin: 0 4px;
          }
          
          .contact-box {
            display: inline-block; 
            width: 18px; 
            height: 20px; 
            border: 1px solid black; 
            vertical-align: middle; 
            margin-right: -1px; /* Remove double borders */
          }

          /* Section Headers */
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

          /* Tables */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 6px; 
          }
          td, th { 
            border: 1px solid black; 
            padding: 4px; 
            vertical-align: top;
            text-align: left;
            font-size: 10.5pt;
          }
          th { text-align: center; vertical-align: middle; background: #f9f9f9; }
          
          /* Tamil Font Styling */
          .tamil { 
            font-size: 9.5pt; 
            display: block; 
            margin-top: 2px;
            font-weight: normal;
          }

          /* Header Styling */
          .header-title h1 { margin: 2px 0; font-size: 18pt; }
          .header-title h2 { margin: 2px 0; font-size: 14pt; }
          
          /* Helper for clean layout tables */
          .clean-table td { border: none; padding: 2px 0; }
          
          .page-break { page-break-after: always; }
        </style>
        
        <!-- ================= PAGE 1 ================= -->
        
        <div class="header-title text-center">
           <h1 class="font-bold">LOVE OF JESUS MINISTRY</h1>
           <h2 class="font-bold">APPOINTMENT PRAYER</h2>
           <h2 class="font-bold">APPLICATION FORM</h2>
        </div>

        <div style="margin-top: 10px; border: 1px solid black; padding: 0; display: flex; font-weight: bold; font-size: 10.5pt;">
            <div style="padding: 5px; width: 30%; border-right: 1px solid black;">APP NO: ........................</div>
            <div style="padding: 5px; width: 40%; text-align: center; border-right: 1px solid black;">VISITOR INFORMATION</div>
            <div style="padding: 5px; width: 30%;">Date: ........................</div>
        </div>

        <div style="display: flex; border: 1px solid black; border-top: none; font-size: 10pt;">
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             New Visitor <span class="box-input"></span><br><span class="tamil">புதியவர்</span>
          </div>
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             Existing Visitor <span class="box-input"></span><br><span class="tamil">ஏற்கனவே வந்தவர்</span>
          </div>
          <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
             Shalom Church Member <span class="box-input"></span><br><span class="tamil">ஷாலோம் சபையின் அங்கத்தினர்</span>
          </div>
          <div style="flex: 1; padding: 5px;">
             Power Ministry <span class="box-input"></span><br><span class="tamil">வல்லமை பயிற்சி எடுத்தவர்</span>
          </div>
        </div>

        <div style="margin: 10px 0; font-size: 10.5pt;">
          No.of People in family <span class="box-input" style="width: 35px;"></span> 
          <span style="font-size: 9.5pt;">(குடும்ப நபர்களின் எண்ணிக்கை)</span>
          <span style="float: right; margin-right: 40px;">Batch <span class="box-input" style="width: 60px;"></span></span>
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
            <tr style="height: 28px;"><td>1</td><td></td><td></td><td></td><td></td></tr>
            <tr style="height: 28px;"><td>2</td><td></td><td></td><td></td><td></td></tr>
            <tr style="height: 28px;"><td>3</td><td></td><td></td><td></td><td></td></tr>
            <tr style="height: 28px;"><td>4</td><td></td><td></td><td></td><td></td></tr>
            <tr style="height: 28px;"><td>5</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>

        <div style="font-size: 10.5pt; line-height: 1.6;">
          Address (முழுவிலாசம்): _____________________________________________________________________________<br>
          ___________________________________________________________________________________________________<br>
          
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <div>Check In-Time: ___________________ <span class="tamil" style="display:inline;">(உள்ளே வரும் நேரம்)</span></div>
            <div>
               Contact No: 
               <span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span><span class="contact-box"></span>
            </div>
          </div>
          
          <div style="margin-top: 8px;">
            Occupation(தொழில்): __________________________
          </div>
          <div style="margin-top: 8px;">
             How did you hear about Love of Jesus Ministry? __________________________________________________<br>
             <span class="tamil">எப்படி இயேசுவின் அன்பின் ஊழியத்தை தெரிந்துகொண்டீர்கள்?</span>
          </div>
        </div>

        <div class="section-header">MINISTRY AND CHURCH INVOLVEMENT</div>
        <div style="font-size: 10.5pt; line-height: 1.5;">
          <div style="margin-bottom: 6px;">
            1) Are you involved in Ministry? &nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span> 
            &nbsp;&nbsp;&nbsp; Type: Full Time <span class="box-input"></span> &nbsp; Part Time <span class="box-input"></span><br>
            <span class="tamil" style="margin-left: 20px;">ஊழியம் செய்கின்றவரா? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; முழு நேரம் &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; பகுதி நேரம்</span>
          </div>
          <div style="margin-bottom: 6px;">
            2) Are you a regular church-goer? &nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span><br>
            <span class="tamil" style="margin-left: 20px;">தவறாமல் சபைக்கு செல்கிறீர்களா?</span>
          </div>
          <div>
            3) Church Name: __________________________________________ Area: _________________________________<br>
            <span class="tamil" style="margin-left: 20px;">(எந்த திருச்சபையை சார்ந்தவர்)</span>
          </div>
        </div>

        <div class="section-header">SPIRITUAL BACKGROUND</div>
        <table class="clean-table" style="font-size: 10.5pt;">
          <tr>
            <td width="85%">1) Baptism Status: <span class="tamil" style="display:inline;">(ஞானஸ்நானம் பெற்றிருக்கிறீர்களா?)</span></td>
            <td>Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span></td>
          </tr>
          <tr>
            <td>2) Holy Spirit Anointing: <span class="tamil" style="display:inline;">(பரிசுத்த ஆவி அபிஷேகம் பெற்றிருக்கிறீர்களா?)</span></td>
            <td>Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span></td>
          </tr>
          <tr>
            <td>3) Church Activities: _______________ Position: __________________ <span class="tamil" style="display:inline;">(சபையில் ஊழிய நடவடிக்கைகள்)</span></td>
            <td>Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span></td>
          </tr>
          <tr>
            <td>4) Holy Communion Participation: <span class="tamil" style="display:inline;">(திருவிருந்து பெற்றுவருகின்றவரா?)</span></td>
            <td>Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span></td>
          </tr>
        </table>

        <!-- Forces next content to Page 2 -->
        <div class="page-break"></div>

        <!-- ================= PAGE 2 ================= -->

        <div class="section-header" style="margin-top: 0;">PURPOSE OF VISIT</div>
        <table>
          <tr>
            <td width="33%">Family Issue <span class="box-input" style="float:right"></span><br><span class="tamil">(குடும்ப பிரச்சினை)</span></td>
            <td width="33%">Bondages <span class="box-input" style="float:right"></span><br><span class="tamil">(கட்டுகள் உடைக்கப்பட)</span></td>
            <td width="33%">Friends <span class="box-input" style="float:right"></span><br><span class="tamil">(நண்பர்களுக்காக)</span></td>
          </tr>
          <tr>
            <td>Health Issue <span class="box-input" style="float:right"></span><br><span class="tamil">(சரீர சுகத்திற்காக)</span></td>
            <td>WitchCraft <span class="box-input" style="float:right"></span><br><span class="tamil">(செய்வினைவிட்டு நீங்க)</span></td>
            <td>Others <span class="box-input" style="float:right"></span><br><span class="tamil">(மற்ற காரியங்கள்)</span></td>
          </tr>
          <tr>
            <td>Work Issue <span class="box-input" style="float:right"></span><br><span class="tamil">(வேலையில் பிரச்சினை)</span></td>
            <td>Deliverance <span class="box-input" style="float:right"></span><br><span class="tamil">(விடுதலைக்காக)</span></td>
            <td>_______________________</td>
          </tr>
          <tr>
            <td>Personal Issues <span class="box-input" style="float:right"></span><br><span class="tamil">(தனிப்பட்ட பிரச்சினை)</span></td>
            <td>Prophecy <span class="box-input" style="float:right"></span><br><span class="tamil">(தீர்க்கதரிசனத்திற்காக)</span></td>
            <td></td>
          </tr>
           <tr>
            <td>Relative <span class="box-input" style="float:right"></span><br><span class="tamil">(உறவினர்களுக்காக)</span></td>
            <td>Counselling <span class="box-input" style="float:right"></span><br><span class="tamil">(ஆலோசனைக்காக)</span></td>
            <td></td>
          </tr>
        </table>

        <div class="section-header">ADDITIONAL INFORMATION</div>
        <div style="font-size: 10.5pt; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            1) Do you have any tattoos? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span> <br>
            <span class="tamil">பச்சை குத்தியுள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            2) Have you been involved in occult practices or consulted with witch doctors? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span> <br>
            <span class="tamil">தவறான பழக்கவழக்கங்களில் ஈடுபட்டு அதற்காக மருத்துவரின் ஆலோசனையை அணுகியுள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            3) Do you possess any objects related to black magic or occult practices? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span> <br>
            <span class="tamil">மந்திர, சூனிய காரியங்களில் ஈடுபட்டு அதற்கு உண்டான பொருட்களை வைத்துள்ளீர்களா?</span>
          </div>
          
          <div style="margin-bottom: 12px;">
            4) Have you practiced astrology or consulted with sorcery practitioners? &nbsp;&nbsp;&nbsp;&nbsp; Yes <span class="box-input"></span> &nbsp; No <span class="box-input"></span> <br>
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
               Yes <span class="box-input"></span> (Please tick)<br><br>
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
              Front Office Incharge : ...................................................<br>
              <span class="tamil" style="margin-top: -5px;">(முன் அலுவலக பொறுப்பாளர்)</span>
              Counsellor (ஆலோசகர்): ...................................................<br>
              Prayer Warrior (ஜெபவீரர்) : ...................................................<br>
              Followingup’s Officer : ...................................................<br>
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

    // 3. Inject HTML and Trigger Print
    printSection.innerHTML = formHTML;
    
    // We wait 100ms just to ensure DOM is fully parsed (React safety) then trigger print
    setTimeout(() => {
        window.print();
    }, 100);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm/50">
      
      {/* Left: Mobile Menu & Breadcrumb/Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MenuIcon size={24} />
        </button>
        
        {role === 'admin' && (
           <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-medium">
             <ChurchIcon size={18} />
             <span>/</span>
             <span className="text-slate-800">Grace Community Church</span>
           </div>
        )}
      </div>

      {/* Center: Search (Admin Only) */}
      {role === 'admin' ? (
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members, families, or IDs..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Print Form Button */}
        {role === 'admin' && (
          <button 
            type="button"
            onClick={handlePrintEmptyForm}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors shadow-sm cursor-pointer"
            title="Print Empty Application Form"
          >
            <PrinterIcon size={18} />
            <span className="text-xs font-bold hidden md:inline">Print Form</span>
          </button>
        )}

        {role === 'admin' && (
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 rounded-full transition-all">
            <BellIcon size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        )}

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${role === 'super_admin' ? 'bg-indigo-600' : 'bg-brand-600'}`}>
            <span className="font-bold text-xs">{role === 'super_admin' ? 'SA' : 'AD'}</span>
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-bold text-slate-700 leading-tight">
              {role === 'super_admin' ? 'Super Admin' : 'Administrator'}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">{userEmail}</span>
          </div>
          <ChevronDownIcon size={14} className="text-slate-400 ml-1 hidden sm:block" />
        </button>

      </div>
    </header>
  );
};

export default Header;