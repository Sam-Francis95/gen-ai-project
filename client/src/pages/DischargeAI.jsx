import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Mic, User, AlertCircle, CheckCircle2, MessageSquare, Activity,
  Send, Languages, Loader2, UploadCloud, BrainCircuit, ListChecks,
  Stethoscope, Pill, ShieldAlert, ChevronRight, Apple, Ban,
  Dumbbell, FlaskConical, Clock, Zap, CalendarCheck, FileText, MapPin,
  Shield, Printer, Lock, CheckCircle, Edit3, Sparkles
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { generateInsuranceClaim, generateDischargeCard, approveDischarge } from '../api/client';
import InsuranceClaimModal from '../components/InsuranceClaimModal';
import DischargeCardModal from '../components/DischargeCardModal';

const API_URL = 'http://localhost:5000';

const SectionCard = ({ icon: Icon, title, color, children }) => (
  <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm`} style={{ borderColor: `${color}30` }}>
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: `${color}20`, backgroundColor: `${color}08` }}>
      <Icon className="w-4 h-4" style={{ color }} />
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Chip = ({ children, color = '#64748b' }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
    style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
    {children}
  </span>
);

const BulletList = ({ items, color = '#64748b', icon: Icon = ChevronRight }) => (
  <ul className="space-y-2">
    {(items || []).map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
        <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const SeverityBadge = ({ severity }) => {
  const map = {
    'Mild': { color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Moderate': { color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200' },
    'Severe': { color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200' },
  };
  const s = map[severity] || map['Moderate'];
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.border}`} style={{ color: s.color }}>
      {severity || 'Unknown'} Severity
    </span>
  );
};

function DischargeAI({ embedded = false, initialData = {} }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [formData, setFormData] = useState({ 
    patientName: initialData.patientName || '', 
    age: initialData.age || '', 
    gender: initialData.gender || '', 
    rawText: initialData.notes || '' 
  });
  const [result, setResult] = useState(null);
  const [targetLang, setTargetLang] = useState('Tamil');
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState('');

  // Feature 2: Insurance Claim Assistant State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState(null);
  const [loadingClaim, setLoadingClaim] = useState(false);

  // Feature 3: Multilingual Discharge Card State (8 Indian Languages)
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [selectedCardLang, setSelectedCardLang] = useState('Hindi');
  const [loadingCard, setLoadingCard] = useState(false);

  // Feature 4: Doctor Approval Checklist State
  const [checklist, setChecklist] = useState({
    check1: false,
    check2: false,
    check3: false,
    check4: false
  });
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorModified, setDoctorModified] = useState(false);
  const [approving, setApproving] = useState(false);
  const [doctorApproval, setDoctorApproval] = useState({
    approvalStatus: 'PENDING',
    approvedBy: '',
    approvedAt: null,
    doctorModified: false,
    doctorNotes: ''
  });

  // Fetch existing discharge report if it exists for this referral
  useEffect(() => {
    if (initialData.referralId) {
      axios.get(`${API_URL}/discharge/patient/${initialData.referralId}`)
        .then(res => {
          setResult(res.data);
          if (res.data.approval_status === 'APPROVED') {
            setDoctorApproval({
              approvalStatus: 'APPROVED',
              approvedBy: res.data.approved_by || 'Dr. Attending Physician',
              approvedAt: res.data.approved_at,
              doctorModified: Boolean(res.data.doctor_modified),
              doctorNotes: res.data.doctor_notes || ''
            });
            setChecklist({ check1: true, check2: true, check3: true, check4: true });
          }
          if (res.data.claim_data) setClaimData(res.data.claim_data);
          if (res.data.card_data) setCardData(res.data.card_data);
        })
        .catch(() => {});
    }
  }, [initialData.referralId]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setReportFile(e.target.files[0]);
  };

  const handleVoiceInput = async () => {
    setRecording(true);
    setTimeout(async () => {
      try {
        const res = await axios.post(`${API_URL}/discharge/voice`);
        setFormData(prev => ({ ...prev, rawText: res.data.text }));
        toast.success("Voice transcribed successfully");
      } catch { toast.error("Failed to process voice"); }
      finally { setRecording(false); }
    }, 2000);
  };

  const handleGenerate = async () => {
    if (!reportFile && !formData.rawText) {
      toast.error("Please upload a report or provide notes.");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (initialData.referralId) data.append('referralId', initialData.referralId);
      if (reportFile) data.append('report', reportFile);
      const res = await axios.post(`${API_URL}/discharge/generate`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      setTranslation('');
      setDoctorApproval({
        approvalStatus: 'PENDING',
        approvedBy: '',
        approvedAt: null,
        doctorModified: false,
        doctorNotes: ''
      });
      setChecklist({ check1: false, check2: false, check3: false, check4: false });
      toast.success("AI Analysis complete", { icon: '✨' });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate analysis");
    } finally { setLoading(false); }
  };

  const handleTranslate = async () => {
    if (!result) return;
    setTranslating(true);
    try {
      const res = await axios.post(`${API_URL}/discharge/translate`, { id: result.id, language: targetLang, textToTranslate: result.patientSummary });
      setTranslation(res.data.translatedText);
      toast.success(`Translated to ${targetLang}`);
    } catch { toast.error("Translation failed"); }
    finally { setTranslating(false); }
  };

  const handleFollowUp = async () => {
    try {
      const res = await axios.post(`${API_URL}/discharge/followup`, { patientId: result.patientId, structuredData: result.structuredData });
      toast.success(res.data.message, { duration: 4000, icon: '📱' });
    } catch { toast.error("Failed to schedule follow-up"); }
  };

  const handleTransfer = async (targetEmail, hospitalName) => {
    try {
      await axios.post(`${API_URL}/discharge/transfer`, {
        targetHospitalEmail: targetEmail,
        referralId: initialData.referralId || result.patientId,
        patientName: formData.patientName || 'Unknown Patient',
        aiSummary: result.patientSummary,
        senderHospitalName: user?.hospitalName || 'CareFlow Network'
      });
      toast.success(`Referral sent to ${hospitalName}!`);
    } catch {
      toast.error(`Failed to transfer to ${hospitalName}`);
    }
  };

  // Feature 2: Health Insurance Claim Assistant Handler
  const handleOpenClaimModal = async () => {
    if (!result) return;
    setLoadingClaim(true);
    try {
      const res = await generateInsuranceClaim({
        dischargeId: result.id,
        referralId: initialData.referralId || result.patientId,
        diagnosis: result.structuredData?.diagnosis,
        clinicalSummary: result.clinicalSummary,
        meds: result.structuredData?.meds,
        treatments: result.structuredData?.treatmentPlan,
        patientName: formData.patientName || 'Patient',
        age: formData.age,
        gender: formData.gender,
        hospitalName: user?.hospitalName || 'CareFlow Hospital'
      });
      setClaimData(res.claimData);
      setClaimModalOpen(true);
      toast.success('Insurance Claim dossier generated!', { icon: '🛡️' });
    } catch (err) {
      toast.error('Failed to generate insurance claim dossier.');
    } finally {
      setLoadingClaim(false);
    }
  };

  // Feature 3: Multilingual Discharge Card Handler
  const handleOpenCardModal = async (languageToUse = selectedCardLang) => {
    if (!result) return;
    setLoadingCard(true);
    try {
      const res = await generateDischargeCard({
        dischargeId: result.id,
        language: languageToUse,
        structuredData: result.structuredData,
        patientName: formData.patientName || 'Patient',
        hospitalName: user?.hospitalName || 'CareFlow Hospital'
      });
      setCardData(res.cardData);
      setSelectedCardLang(languageToUse);
      setCardModalOpen(true);
      toast.success(`Discharge Card ready in ${languageToUse}!`, { icon: '🎴' });
    } catch (err) {
      toast.error('Failed to generate multilingual discharge card.');
    } finally {
      setLoadingCard(false);
    }
  };

  // Feature 4: Doctor Approval Checklist Handler
  const allChecksConfirmed = checklist.check1 && checklist.check2 && checklist.check3 && checklist.check4;
  const checksCount = Object.values(checklist).filter(Boolean).length;

  const handleApproveDischarge = async () => {
    if (!allChecksConfirmed) {
      toast.error('Please complete all 4 checklist verifications before approving.');
      return;
    }
    if (!result?.id) {
      toast.error('Discharge record ID missing.');
      return;
    }

    setApproving(true);
    try {
      const doctorDisplayName = user?.hospitalName 
        ? `Dr. on duty (${user.hospitalName})` 
        : 'Dr. Attending Physician, MD';

      const res = await approveDischarge({
        dischargeId: result.id,
        doctorName: doctorDisplayName,
        doctorNotes,
        doctorModified,
        check1: checklist.check1,
        check2: checklist.check2,
        check3: checklist.check3,
        check4: checklist.check4,
        referralId: initialData.referralId || result.patientId
      });

      setDoctorApproval({
        approvalStatus: 'APPROVED',
        approvedBy: res.approvedBy,
        approvedAt: res.approvedAt,
        doctorModified: res.doctorModified,
        doctorNotes: res.doctorNotes
      });

      toast.success(`Discharge clinically verified & approved by ${res.approvedBy}!`, { 
        icon: '✅',
        duration: 4500 
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve discharge.');
    } finally {
      setApproving(false);
    }
  };

  const mockHospitals = [
    { name: 'Apollo Care Center', email: 'apollo@careflow.ai', specialty: 'General & Trauma', distance: '1.2 km' },
    { name: 'City General Hospital', email: 'city@careflow.ai', specialty: 'Multi-specialty', distance: '2.5 km' },
    { name: 'Metro Heart Institute', email: 'metro@careflow.ai', specialty: 'Cardiology', distance: '3.1 km' },
    { name: 'Sunshine Pediatric Care', email: 'sunshine@careflow.ai', specialty: 'Pediatrics', distance: '4.8 km' },
    { name: 'Global Neuro Center', email: 'global@careflow.ai', specialty: 'Neurology', distance: '5.6 km' }
  ];

  const sd = result?.structuredData;
  const panelClass = "bg-white border border-slate-200 shadow-sm rounded-2xl";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300";

  return (
    <div className={embedded ? "w-full" : "min-h-screen p-4 md:p-8 bg-[#fcfcfd]"}>
      <Toaster position="top-right" />

      {/* Header */}
      {!embedded && (
        <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ margin: 0, fontSize: '26px' }}>Discharge AI</h1>
              <p className="text-slate-500 text-sm">Autonomous Clinical Intelligence & Discharge Engine</p>
            </div>
          </div>
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full ${panelClass} bg-indigo-50 text-indigo-700 text-sm font-medium border-indigo-100`}>
            <CheckCircle2 className="w-4 h-4" /> Fully AI-Driven
          </div>
        </header>
      )}

      <main className={`max-w-7xl mx-auto grid grid-cols-1 ${embedded ? 'lg:grid-cols-1' : 'lg:grid-cols-[380px_1fr]'} gap-8 items-start`}>

        {/* LEFT: Input Panel */}
        <section className={`${panelClass} p-6 flex flex-col gap-5`}>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 m-0">
            <BrainCircuit className="text-blue-500 w-5 h-5" /> Patient Data Input
          </h2>

          {/* Report Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">1. Upload Medical Report</label>
            <input type="file" id="reportUpload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
            <label htmlFor="reportUpload" className="w-full flex flex-col items-center justify-center p-5 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
              <UploadCloud className="w-7 h-7 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-slate-700">{reportFile ? reportFile.name : "Click to upload PDF or Text"}</span>
              <span className="text-xs text-slate-500 mt-1">AI analyzes report content to generate plan</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">2. Additional Notes</label>
              <button onClick={handleVoiceInput} disabled={recording}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-all ${recording ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>
                <Mic className="w-3 h-3" />{recording ? 'Listening...' : 'Dictate'}
              </button>
            </div>
            <textarea name="rawText" value={formData.rawText} onChange={handleInputChange} rows="3"
              className={`${inputClass} resize-none`} placeholder="Symptoms, history, or any additional context..." />
          </div>

          {/* Patient Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">3. Patient Details</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} className={`${inputClass} py-2 col-span-2`} placeholder="Patient Name" />
              <input type="text" name="age" value={formData.age} onChange={handleInputChange} className={`${inputClass} py-2`} placeholder="Age" />
              <input type="text" name="gender" value={formData.gender} onChange={handleInputChange} className={`${inputClass} py-2`} placeholder="Gender" />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 rounded-xl cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
            {loading ? 'AI Analyzing Report...' : 'Generate Discharge Summary'}
          </button>
        </section>

        {/* RIGHT: Output Panel */}
        <section>
          {!result ? (
            <div className={`${panelClass} p-6 sm:p-8 bg-white border border-slate-200`}>
              <h3 className="text-sm font-bold text-slate-900 m-0 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-600" /> AI Analysis Flow
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">Analyze Report</h4>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">Extract key medical information using AI</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">Generate Draft Summary</h4>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">Create discharge summary and care plan</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">Doctor Review</h4>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">Clinician reviews and edits the summary</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                    04
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">Finalize & Save</h4>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">Save to patient records & generate claims</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">

              {/* ACTION BAR: Quick Triggers for Claim Assistant & Multilingual Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="font-bold text-sm block">Advanced Clinical Operations</span>
                    <span className="text-indigo-200 text-xs">Generate TPA claims or patient cards in 8 languages</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Feature 2 Button: Insurance Claim Assistant */}
                  <button
                    onClick={handleOpenClaimModal}
                    disabled={loadingClaim}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {loadingClaim ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>Generate Insurance Claim</span>
                  </button>

                  {/* Feature 3 Button: Multilingual Discharge Card */}
                  <button
                    onClick={() => handleOpenCardModal(selectedCardLang)}
                    disabled={loadingCard}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {loadingCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                    <span>Printable Card (8 Languages)</span>
                  </button>
                </div>
              </div>

              {/* Top: Diagnosis Summary Banner with Clinical Approval Seal */}
              <div className={`${panelClass} p-5 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50/50`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Diagnosis</p>
                    <h2 className="text-2xl font-bold text-slate-900 m-0" style={{ fontSize: '22px' }}>{sd?.diagnosis || 'N/A'}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={sd?.severity} />
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${result.validation.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      {result.validation.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {result.validation.isValid ? 'Claims Ready' : `Missing: ${result.validation.missing.join(', ')}`}
                    </div>
                  </div>
                </div>

                {/* Verified Seal Badge if Approved */}
                {doctorApproval.approvalStatus === 'APPROVED' && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Clinically Verified & Approved by {doctorApproval.approvedBy}</span>
                      {doctorApproval.doctorModified && (
                        <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-semibold">
                          Modified by Doctor
                        </span>
                      )}
                    </div>
                    <span className="text-emerald-700 font-mono text-[11px]">
                      {new Date(doctorApproval.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <p className="text-sm text-slate-700 mt-3 leading-relaxed">{sd?.aiAnalysis}</p>
                <p className="text-xs text-slate-500 mt-2">Follow-up in <span className="text-indigo-600 font-semibold">{sd?.followUpDays || 7} days</span></p>
              </div>

              {/* Grid: Medical Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Next Steps */}
                <SectionCard icon={Zap} title="Next Steps" color="#f59e0b">
                  <BulletList items={sd?.nextSteps} color="#d97706" icon={ChevronRight} />
                </SectionCard>

                {/* Prescribed Medications */}
                <SectionCard icon={Pill} title="Prescribed Medications" color="#10b981">
                  <ul className="space-y-3">
                    {(sd?.meds || []).map((med, i) => {
                      const m = typeof med === 'object' ? med : { name: med };
                      return (
                        <li key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="font-semibold text-emerald-700 text-sm">{m.name} {m.dosage && `— ${m.dosage}`}</div>
                          {m.frequency && <div className="text-xs text-slate-500 mt-0.5">{m.frequency} · {m.duration}</div>}
                          {m.purpose && <div className="text-xs text-slate-400 mt-1 italic">{m.purpose}</div>}
                        </li>
                      );
                    })}
                  </ul>
                </SectionCard>

                {/* Treatment Plan */}
                <SectionCard icon={ListChecks} title="Recommended Treatment Plan" color="#6366f1">
                  {sd?.treatmentPlan ? (
                    <div className="space-y-4">
                      {sd.treatmentPlan.immediate?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-600 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Immediate</p>
                          <BulletList items={sd.treatmentPlan.immediate} color="#dc2626" />
                        </div>
                      )}
                      {sd.treatmentPlan.shortTerm?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-600 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Short Term (1–2 weeks)</p>
                          <BulletList items={sd.treatmentPlan.shortTerm} color="#d97706" />
                        </div>
                      )}
                      {sd.treatmentPlan.longTerm?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Long Term</p>
                          <BulletList items={sd.treatmentPlan.longTerm} color="#4f46e5" />
                        </div>
                      )}
                    </div>
                  ) : <BulletList items={sd?.furtherActions} color="#4f46e5" />}
                </SectionCard>

                {/* Diet */}
                <SectionCard icon={Apple} title="Diet Guidance" color="#ec4899">
                  <div className="space-y-4">
                    {sd?.diet?.recommended?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase mb-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Recommended Foods</p>
                        <BulletList items={sd.diet.recommended} color="#059669" icon={CheckCircle2} />
                      </div>
                    )}
                    {sd?.diet?.avoid?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase mb-1.5 flex items-center gap-1"><Ban className="w-3 h-3" /> Foods to Avoid</p>
                        <BulletList items={sd.diet.avoid} color="#dc2626" icon={Ban} />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* Lifestyle */}
                {sd?.lifestyle?.length > 0 && (
                  <SectionCard icon={Dumbbell} title="Lifestyle Advice" color="#8b5cf6">
                    <BulletList items={sd.lifestyle} color="#7c3aed" />
                  </SectionCard>
                )}

                {/* Further Tests */}
                {sd?.furtherTests?.length > 0 && (
                  <SectionCard icon={FlaskConical} title="Further Tests Required" color="#06b6d4">
                    <BulletList items={sd.furtherTests} color="#0891b2" />
                  </SectionCard>
                )}

                {/* Warning Signs */}
                {sd?.warnings?.length > 0 && (
                  <div className="md:col-span-2">
                    <SectionCard icon={ShieldAlert} title="Warning Signs — Seek Emergency Care If..." color="#ef4444">
                      <div className="flex flex-wrap gap-2">
                        {sd.warnings.map((w, i) => <Chip key={i} color="#dc2626">{w}</Chip>)}
                      </div>
                    </SectionCard>
                  </div>
                )}

                {/* CareFlow Hospital Network Transfer */}
                <div className="md:col-span-2">
                  <SectionCard icon={MapPin} title="CareFlow Hospital Network (Transfer Patient)" color="#0ea5e9">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockHospitals.map((h, i) => (
                        <div key={i} className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-sky-800 text-sm">{h.name}</h4>
                            <div className="text-xs text-sky-600 mt-1 flex items-center justify-between mb-3">
                              <span className="font-medium">{h.specialty}</span>
                              <span className="bg-sky-100 px-2 py-0.5 rounded-full">{h.distance}</span>
                            </div>
                          </div>
                          <button onClick={() => handleTransfer(h.email, h.name)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm cursor-pointer">
                            Refer this Hospital
                          </button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* Final Patient Instructions & WhatsApp Follow-up */}
              <SectionCard icon={FileText} title="Final Patient Instructions" color="#3b82f6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Simple language for patient to understand</p>
                  <div className="flex items-center gap-2">
                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                      className="bg-white border border-slate-200 text-xs text-slate-700 rounded px-2 py-1 outline-none">
                      <option value="Tamil">Tamil</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Telugu">Telugu</option>
                    </select>
                    <button onClick={handleTranslate} disabled={translating}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer">
                      {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                      Translate
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {translation || result.patientSummary}
                </div>
                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarCheck className="w-4 h-4" />
                    Follow-up in <span className="text-indigo-600 font-semibold ml-1">{sd?.followUpDays || 7} days</span>
                  </div>
                  <button onClick={handleFollowUp}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl py-2 px-4 flex items-center gap-2 transition-all cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Schedule WhatsApp Follow-up</span>
                  </button>
                </div>
              </SectionCard>

              {/* FEATURE 4: Doctor Approval Checklist */}
              <div className="rounded-3xl border-2 border-indigo-200 bg-white p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 m-0">Doctor Approval & Clinical Verification</h3>
                      <p className="text-xs text-slate-500 m-0">Mandatory 4-point safety confirmation before patient sign-off</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    allChecksConfirmed 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {checksCount} of 4 Confirmed
                  </span>
                </div>

                {/* 4 Confirmation Checkboxes */}
                <div className="space-y-3">
                  
                  {/* Check 1 */}
                  <label className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                    checklist.check1 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={checklist.check1}
                      onChange={(e) => setChecklist(p => ({ ...p, check1: e.target.checked }))}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-semibold">1. Diagnosis & Clinical Summary Verification</strong>
                      <span className="text-slate-500">I have verified the patient's primary diagnosis, severity rating, and clinical summary for medical accuracy.</span>
                    </div>
                  </label>

                  {/* Check 2 */}
                  <label className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                    checklist.check2 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={checklist.check2}
                      onChange={(e) => setChecklist(p => ({ ...p, check2: e.target.checked }))}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-semibold">2. Prescribed Medications & Safety Review</strong>
                      <span className="text-slate-500">I have reviewed all prescribed drug dosages, frequencies, and durations for clinical safety and contraindications.</span>
                    </div>
                  </label>

                  {/* Check 3 */}
                  <label className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                    checklist.check3 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={checklist.check3}
                      onChange={(e) => setChecklist(p => ({ ...p, check3: e.target.checked }))}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-semibold">3. Emergency Warning Signs & Timeline</strong>
                      <span className="text-slate-500">Emergency red-flag warning signs and the post-discharge follow-up schedule have been reviewed and documented.</span>
                    </div>
                  </label>

                  {/* Check 4 */}
                  <label className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                    checklist.check4 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={checklist.check4}
                      onChange={(e) => setChecklist(p => ({ ...p, check4: e.target.checked }))}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-semibold">4. Patient / Caregiver Comprehension</strong>
                      <span className="text-slate-500">Discharge criteria are met and instructions have been explained clearly to the patient or family caregiver.</span>
                    </div>
                  </label>

                </div>

                {/* Optional Clinical Modifications Field */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <label className="font-semibold text-slate-700 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                      Doctor Notes / Clinical Modifications (Optional)
                    </label>
                    {doctorModified && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded">
                        Will be flagged as Doctor Modified
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => {
                      setDoctorNotes(e.target.value);
                      if (e.target.value.trim().length > 0) setDoctorModified(true);
                    }}
                    placeholder="Enter any manual dosage adjustments, specialized dietary instructions, or clinical notes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Save & Approve Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    {!allChecksConfirmed ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Save button locked until all 4 checkpoints are checked</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Ready for Clinical Attestation</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleApproveDischarge}
                    disabled={!allChecksConfirmed || approving}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                      allChecksConfirmed && !approving
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{approving ? 'Attesting...' : 'Approve & Save Discharge'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* Feature 2: Health Insurance Claim Assistant Modal */}
      <InsuranceClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        claimData={claimData}
        patientInfo={{
          name: formData.patientName || 'Patient',
          age: formData.age,
          gender: formData.gender
        }}
        hospitalName={user?.hospitalName}
        doctorApproval={doctorApproval}
      />

      {/* Feature 3: Multilingual Discharge Card Modal */}
      <DischargeCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        cardData={cardData}
        onLanguageChange={(newLang) => handleOpenCardModal(newLang)}
        selectedLanguage={selectedCardLang}
        loadingLanguage={loadingCard}
        patientInfo={{
          name: formData.patientName || 'Patient',
          age: formData.age,
          gender: formData.gender
        }}
        hospitalName={user?.hospitalName}
        doctorApproval={doctorApproval}
      />

    </div>
  );
}

export default DischargeAI;
