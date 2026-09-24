import React, { useState } from 'react';
import { 
  X, Printer, Languages, Heart, AlertOctagon, Sun, Sunset, Moon, 
  Calendar, Phone, CheckCircle2, Stethoscope, Utensils, Ban, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_LANGUAGES = [
  { code: 'Hindi', name: 'Hindi', native: 'हिंदी' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'Bengali', name: 'Bengali', native: 'বাংলা' },
  { code: 'Marathi', name: 'Marathi', native: 'मराठी' },
  { code: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
];

export default function DischargeCardModal({ 
  isOpen, 
  onClose, 
  cardData, 
  onLanguageChange, 
  selectedLanguage, 
  loadingLanguage,
  patientInfo, 
  hospitalName, 
  doctorApproval 
}) {
  if (!isOpen || !cardData) return null;

  const handlePrint = () => {
    window.print();
  };

  const meds = cardData?.medications || [];
  const diet = cardData?.diet || { eat: [], avoid: [] };
  const warnings = cardData?.warningSigns || [];
  const followUp = cardData?.followUp || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Multilingual Discharge Card</h2>
              <p className="text-[11px] text-slate-500 m-0">Everyday vocabulary · A5 printable patient card</p>
            </div>
          </div>

          {/* 8 Indian Languages Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-sm">
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={loadingLanguage}
                className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 outline-none cursor-pointer"
              >
                {INDIAN_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A5 Card</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Body (Styled specifically for A5 dimensions) */}
        <div className="overflow-y-auto p-6 sm:p-8 printable-area bg-white text-slate-800 space-y-5">

          {/* Card Border & Header */}
          <div className="border-3 border-teal-600 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-teal-50/40 to-white relative shadow-sm">
            
            {/* Top Badge Banner */}
            <div className="flex items-center justify-between border-b border-teal-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-600 animate-pulse"></span>
                <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight uppercase">
                  {hospitalName || 'CareFlow Network Hospital'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {cardData.languageNative || cardData.language} Discharge Card
                </span>
              </div>
            </div>

            {/* Patient Header Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-2xl border border-teal-100 text-xs shadow-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{patientInfo?.name || 'Patient'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <span className="font-bold text-slate-800">{patientInfo?.age || 'N/A'} yrs / {patientInfo?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Discharge Date</span>
                <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Language</span>
                <span className="font-bold text-teal-700">{cardData.language} · {cardData.languageNative}</span>
              </div>
            </div>

            {/* SECTION 1: Patient Condition in Simple Words */}
            <div className="mb-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 mb-1.5">
                <Heart className="w-4 h-4 text-teal-600" /> உங்கள் உடல்நிலை / आपकी सेहत / Patient Condition
              </h3>
              <p className="text-sm text-slate-800 font-medium leading-relaxed m-0">
                {cardData.patientCondition}
              </p>
            </div>

            {/* SECTION 2: Medications Timetable */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Stethoscope className="w-4 h-4 text-teal-600" /> மாத்திரைகள் எடுத்துக்கொள்ளும் நேரம் / दवाइयों का समय (Medicines)
              </h3>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {meds.map((med, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                      <div className="text-[11px] text-teal-700 font-medium mt-0.5">{med.purposeSimple}</div>
                    </div>

                    {/* Morning / Noon / Night Timings Grid */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Morning */}
                      <span className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 border ${
                        med.timing?.morning 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}>
                        <Sun className={`w-3 h-3 ${med.timing?.morning ? 'text-amber-500' : 'text-slate-300'}`} />
                        Morning
                      </span>

                      {/* Noon */}
                      <span className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 border ${
                        med.timing?.noon 
                          ? 'bg-orange-50 text-orange-800 border-orange-200' 
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}>
                        <Sunset className={`w-3 h-3 ${med.timing?.noon ? 'text-orange-500' : 'text-slate-300'}`} />
                        Noon
                      </span>

                      {/* Night */}
                      <span className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 border ${
                        med.timing?.night 
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}>
                        <Moon className={`w-3 h-3 ${med.timing?.night ? 'text-indigo-500' : 'text-slate-300'}`} />
                        Night
                      </span>

                      {/* Relation to food */}
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold text-[11px] border border-slate-200">
                        {med.relationToFood}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: Foods to Eat vs Foods to Avoid (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              
              {/* Foods to Eat */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2 uppercase">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" /> சாப்பிட வேண்டியவை (Foods to Eat)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 m-0 pl-1 list-none">
                  {(diet.eat || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Foods to Avoid */}
              <div className="p-3.5 bg-red-50/50 border border-red-200 rounded-2xl">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2 uppercase">
                  <Ban className="w-3.5 h-3.5 text-red-600" /> தவிர்க்க வேண்டியவை (Foods to Avoid)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 m-0 pl-1 list-none">
                  {(diet.avoid || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* SECTION 4: Follow-up Return Date (Prominent Box) */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    மறுபரிசோதனை தேதி / अगली मुलाकात / Follow-up Date
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 m-0">
                    {followUp.returnDateText || `Return in ${followUp.days || 7} days`}
                  </p>
                  <p className="text-[11px] text-slate-500 m-0">{followUp.department || 'Outpatient Clinic'}</p>
                </div>
              </div>
              <div className="bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase">
                {followUp.days || 7} Days
              </div>
            </div>

            {/* SECTION 5: High-Visibility Warning Signs (Red Emergency Alert) */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl mb-4">
              <h4 className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                எச்சரிக்கை அறிகுறிகள் — உடனே மருத்துவமனைக்கு வாருங்கள் (Seek Emergency If...)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-900 font-medium">
                {warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Card Footer with Sign-off */}
            <div className="pt-3 border-t border-teal-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span className="font-bold text-slate-700">அவசர உதவி எண் (Emergency): 108 / 102</span>
              </div>
              
              {doctorApproval?.approvalStatus === 'APPROVED' ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved by {doctorApproval.approvedBy}</span>
                </div>
              ) : (
                <div className="text-slate-400 font-medium text-[11px]">
                  Doctor Signature & Hospital Stamp
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="no-print px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Language: {cardData.language} ({cardData.languageNative}) · Standard A5 Format</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A5 Discharge Card</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
