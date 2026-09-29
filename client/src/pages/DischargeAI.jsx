import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, User, AlertCircle, CheckCircle2, MessageSquare, Activity,
  Send, Languages, Loader2, UploadCloud, BrainCircuit, ListChecks,
  Stethoscope, Pill, ShieldAlert, ChevronRight, Apple, Ban,
  Dumbbell, FlaskConical, Clock, Zap, CalendarCheck, FileText, MapPin,
  Shield, Printer, Lock, CheckCircle, Edit3, Sparkles, HeartHandshake, FileCheck,
  X, RotateCcw
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { generateInsuranceClaim, generateDischargeCard, approveDischarge } from '../api/client';
import InsuranceClaimModal from '../components/InsuranceClaimModal';
import DischargeCardModal from '../components/DischargeCardModal';

const API_URL = 'http://localhost:5000';

const MODE_CONFIG = {
  discharge: {
    id: 'discharge',
    title: 'Discharge AI',
    subtitle: 'Autonomous Clinical Intelligence & Discharge Engine',
    badgeText: 'Fully AI-Driven · Discharge Suite',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    icon: Activity,
    iconBg: 'from-blue-500 to-indigo-600',
    inputHeading: 'Patient & Discharge Data Input',
    uploadLabel: '1. Upload Medical Report or Discharge Summary',
    uploadSubtext: 'AI analyzes diagnoses, medications, and care plan',
    submitText: 'Generate Discharge Summary',
    analyzingText: 'AI Analyzing & Generating Plan...',
    themeColor: '#2563eb'
  },
  summary: {
    id: 'summary',
    title: 'Report Summarizer',
    subtitle: 'Autonomous Diagnostic Lab & Clinical Report Extraction',
    badgeText: 'Diagnostic AI · Multimodal Parser',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-100',
    icon: FileText,
    iconBg: 'from-purple-500 to-indigo-600',
    inputHeading: 'Diagnostic Report Input',
    uploadLabel: '1. Upload Medical Lab Report or Diagnostic PDF',
    uploadSubtext: 'AI extracts abnormal biomarkers, clinical impressions & observations',
    submitText: 'Summarize & Extract Clinical Report',
    analyzingText: 'AI Parsing & Summarizing Diagnostic Report...',
    themeColor: '#9333ea'
  },
  careplan: {
    id: 'careplan',
    title: 'Care Plan Assistant',
    subtitle: 'Personalized Recovery Pathways, Nutrition & Rehabilitation',
    badgeText: 'Recovery & Nutrition · Protocol Generator',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: HeartHandshake,
    iconBg: 'from-emerald-500 to-teal-600',
    inputHeading: 'Recovery & Rehabilitation Input',
    uploadLabel: '1. Upload Medical History or Doctor Orders (Optional)',
    uploadSubtext: 'AI constructs personalized diet, medication & recovery schedule',
    submitText: 'Generate Personalized Care Plan',
    analyzingText: 'AI Designing Personalized Care Plan...',
    themeColor: '#059669'
  }
};

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

function DischargeAI({ embedded = false, initialData = {}, defaultTab = 'discharge' }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialMode = () => {
    if (location.pathname.includes('report-summarizer') || searchParams.get('tab') === 'summary') return 'summary';
    if (location.pathname.includes('care-plan') || searchParams.get('tab') === 'careplan') return 'careplan';
    if (defaultTab && defaultTab !== 'discharge') return defaultTab;
    return 'discharge';
  };

  const [activeMode, setActiveMode] = useState(getInitialMode);

  useEffect(() => {
    setActiveMode(getInitialMode());
  }, [location.pathname, searchParams, defaultTab]);

  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setResult(null);
    setReportFile(null);
    const fileInput = document.getElementById('reportUpload');
    if (fileInput) fileInput.value = '';
    if (embedded) return;
    if (mode === 'discharge') navigate('/discharge');
    else if (mode === 'summary') navigate('/report-summarizer');
    else if (mode === 'careplan') navigate('/care-plan');
  };

  const currentConfig = MODE_CONFIG[activeMode] || MODE_CONFIG.discharge;
  const CurrentIcon = currentConfig.icon;

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

  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setReportFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setReportFile(null);
    const fileInput = document.getElementById('reportUpload');
    if (fileInput) fileInput.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setReportFile(e.dataTransfer.files[0]);
    }
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
      data.append('mode', activeMode);
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

  const renderReportSummarizer = () => (
    <div className="space-y-6">
      {/* Top Diagnostic Impression Banner */}
      <div className={`${panelClass} p-5 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50/60`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider m-0">Diagnostic Pathology & Lab Extraction</p>
              {(result.reportFileName || reportFile?.name) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <FileText className="w-3 h-3 text-purple-600" />
                  <span className="max-w-[200px] truncate">{result.reportFileName || reportFile?.name}</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 m-0" style={{ fontSize: '22px' }}>{sd?.diagnosis || 'Diagnostic Lab Report'}</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setReportFile(null);
                const fileInput = document.getElementById('reportUpload');
                if (fileInput) fileInput.value = '';
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>New Report</span>
            </button>
            <SeverityBadge severity={sd?.severity} />
            <span className="px-3 py-1 bg-purple-100/80 border border-purple-200 text-purple-800 rounded-full text-xs font-bold">
              Lab Extracted
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-700 mt-3 leading-relaxed">{sd?.aiAnalysis || sd?.clinicalImpression}</p>
      </div>

      {/* Biomarkers Table */}
      <div className={`${panelClass} overflow-hidden border-purple-100`}>
        <div className="px-5 py-3.5 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-800">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <span>Extracted Biomarkers & Quantitative Parameters</span>
          </div>
          <span className="text-[11px] text-purple-600 font-medium">
            {(sd?.biomarkers || []).length} Diagnostic Metrics Extracted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Test Description</th>
                <th className="py-3 px-4">Observed Value</th>
                <th className="py-3 px-4">Reference Range</th>
                <th className="py-3 px-4">Status Flag</th>
                <th className="py-3 px-4">Clinical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(sd?.biomarkers || []).map((bio, i) => {
                const isCrit = bio.flag?.includes('CRITICAL');
                const isHigh = bio.flag === 'HIGH';
                const isLow = bio.flag === 'LOW';
                const flagClass = isCrit
                  ? 'bg-red-50 text-red-700 border-red-200 font-bold animate-pulse'
                  : isHigh
                    ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                    : isLow
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{bio.test}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono text-xs">{bio.value}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{bio.normalRange || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] border ${flagClass}`}>
                        {bio.flag || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xs">{bio.significance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Diagnostic Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard icon={Activity} title="ECG & Imaging Observations" color="#6366f1">
          <BulletList items={sd?.imagingFindings} color="#4f46e5" icon={ChevronRight} />
        </SectionCard>

        <SectionCard icon={HeartHandshake} title="Patient Friendly Explanation" color="#059669">
          <p className="text-xs text-slate-700 leading-relaxed m-0 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            {sd?.patientExplanation || result?.patientSummary || "All diagnostic biomarkers have been compiled and verified."}
          </p>
        </SectionCard>
      </div>

      {/* Critical Alerts & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard icon={ShieldAlert} title="Critical Diagnostic Alerts" color="#dc2626">
          <BulletList items={sd?.criticalAlerts} color="#dc2626" icon={AlertCircle} />
        </SectionCard>

        <SectionCard icon={Stethoscope} title="Recommended Specialist Follow-up" color="#2563eb">
          <BulletList items={sd?.recommendedConsultations} color="#2563eb" icon={ChevronRight} />
        </SectionCard>
      </div>
    </div>
  );

  const renderCarePlan = () => (
    <div className="space-y-6">
      {/* Top Care Plan Banner */}
      <div className={`${panelClass} p-5 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/50`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider m-0">Personalized Rehabilitation & Recovery</p>
              {(result.reportFileName || reportFile?.name) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span className="max-w-[200px] truncate">{result.reportFileName || reportFile?.name}</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 m-0" style={{ fontSize: '22px' }}>{sd?.diagnosis || 'Rehabilitation Care Pathway'}</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setReportFile(null);
                const fileInput = document.getElementById('reportUpload');
                if (fileInput) fileInput.value = '';
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>New Plan</span>
            </button>
            <SeverityBadge severity={sd?.severity} />
            <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
              Horizon: ~{sd?.targetRecoveryDays || 42} Days
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-700 mt-3 leading-relaxed">{sd?.aiAnalysis}</p>
      </div>

      {/* Phased Rehabilitation Timeline */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Phased Rehabilitation Pathway</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(sd?.recoveryPhases || []).map((phase, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {phase.timeframe}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {phase.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">{phase.phaseName}</h4>
                
                <div className="mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Clinical Goals:</span>
                  <ul className="space-y-1">
                    {(phase.goals || []).map((g, gi) => (
                      <li key={gi} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Instructions:</span>
                <ul className="space-y-1">
                  {(phase.instructions || []).map((inst, ii) => (
                    <li key={ii} className="text-[11px] text-slate-500 flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Therapy Protocols */}
      <div className={`${panelClass} p-5 border-teal-100`}>
        <div className="flex items-center gap-2 mb-4 font-bold text-xs uppercase tracking-wider text-teal-800">
          <Dumbbell className="w-4 h-4 text-teal-600" />
          <span>Physical Therapy & Mobility Protocols</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(sd?.physicalTherapy || []).map((pt, i) => (
            <div key={i} className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 text-xs">{pt.exercise}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                  {pt.frequency}
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">{pt.instructions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Therapeutic Nutrition Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard icon={Apple} title="Foods to Accelerate Healing" color="#059669">
          <BulletList items={sd?.diet?.recommended} color="#059669" icon={CheckCircle2} />
        </SectionCard>

        <SectionCard icon={Ban} title="Foods & Substances to Strictly Avoid" color="#dc2626">
          <BulletList items={sd?.diet?.avoid} color="#dc2626" icon={Ban} />
        </SectionCard>
      </div>

      {/* Wound Care & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard icon={ShieldAlert} title="Wound Care & DVT Prevention" color="#2563eb">
          <BulletList items={sd?.woundAndDvtCare} color="#2563eb" icon={ChevronRight} />
        </SectionCard>

        <SectionCard icon={CalendarCheck} title="Patient Recovery Milestones" color="#7c3aed">
          <BulletList items={sd?.dailyMilestones} color="#7c3aed" icon={CheckCircle2} />
        </SectionCard>
      </div>
    </div>
  );

  return (
    <div className={embedded ? "w-full" : "min-h-screen p-4 md:p-8 bg-[#fcfcfd]"}>
      <Toaster position="top-right" />

      {/* Header */}
      {!embedded && (
        <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentConfig.iconBg} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
              <CurrentIcon className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ margin: 0, fontSize: '26px' }}>{currentConfig.title}</h1>
              <p className="text-slate-500 text-sm">{currentConfig.subtitle}</p>
            </div>
          </div>
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full ${panelClass} ${currentConfig.badgeClass} text-sm font-medium`}>
            <CheckCircle2 className="w-4 h-4" /> {currentConfig.badgeText}
          </div>
        </header>
      )}

      {/* AI Tool Switcher Tabs */}
      {!embedded && (
        <div className="max-w-7xl mx-auto mb-8 flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => handleSwitchMode('discharge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'discharge'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Discharge AI</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'summary'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report Summarizer</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('careplan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'careplan'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Care Plan Assistant</span>
          </button>
        </div>
      )}

      <main className={`max-w-7xl mx-auto grid grid-cols-1 ${embedded ? 'lg:grid-cols-1' : 'lg:grid-cols-[380px_1fr]'} gap-8 items-start`}>

        {/* LEFT: Input Panel */}
        <section className={`${panelClass} p-6 flex flex-col gap-5`}>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 m-0">
            <BrainCircuit className="text-blue-500 w-5 h-5" /> {currentConfig.inputHeading}
          </h2>

          {/* Report Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{currentConfig.uploadLabel}</label>
            <input 
              type="file" 
              id="reportUpload" 
              className="hidden" 
              onChange={handleFileChange} 
              onClick={(e) => { e.target.value = null; }}
              accept=".pdf,.txt" 
            />
            <label 
              htmlFor="reportUpload" 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
                  : reportFile 
                    ? 'border-indigo-400 bg-indigo-50/70' 
                    : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
              }`}
            >
              <UploadCloud className="w-7 h-7 text-indigo-500 mb-2" />
              {reportFile ? (
                <div className="w-full flex items-center justify-between gap-2 p-2 bg-white/90 border border-indigo-200 rounded-lg shadow-2xs">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">{reportFile.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">({(reportFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveFile}
                    className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-700">Click to upload or drag & drop PDF / Text</span>
              )}
              <span className="text-xs text-slate-500 mt-1">{currentConfig.uploadSubtext}</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {activeMode === 'summary' ? '2. Clinical Notes or Lab Observations' : (activeMode === 'careplan' ? '2. Recovery Goals & Patient Condition' : '2. Additional Notes')}
              </label>
              <button onClick={handleVoiceInput} disabled={recording}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-all ${recording ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>
                <Mic className="w-3 h-3" />{recording ? 'Listening...' : 'Dictate'}
              </button>
            </div>
            <textarea name="rawText" value={formData.rawText} onChange={handleInputChange} rows="3"
              className={`${inputClass} resize-none`} placeholder={
                activeMode === 'summary' 
                  ? "Paste lab findings, abnormal biomarkers, or doctor notes..."
                  : (activeMode === 'careplan' 
                      ? "Specify recovery goals, mobility constraints, dietary preferences..."
                      : "Symptoms, history, or any additional context...")
              } />
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
            {loading ? currentConfig.analyzingText : currentConfig.submitText}
          </button>
        </section>

        {/* RIGHT: Output Panel */}
        <section>
          {!result ? (
            <div className={`${panelClass} p-6 sm:p-8 bg-white border border-slate-200`}>
              <h3 className="text-sm font-bold text-slate-900 m-0 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-600" /> 
                {activeMode === 'summary' ? 'Report Summarizer Diagnostic Workflow' : (activeMode === 'careplan' ? 'Care Plan Recovery Protocol' : 'AI Analysis Flow')}
              </h3>

              <div className="space-y-4">
                {activeMode === 'summary' ? (
                  <>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">01</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Multimodal Report Ingestion</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Upload blood tests, imaging summaries, or diagnostic reports</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">02</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Biomarker & Abnormality Extraction</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Flags critical diagnostic values, primary diagnoses, and severity ratings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">03</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Layperson Translation</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Converts complex medical jargon into easy-to-understand explanations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">04</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Actionable Diagnostics & Tests</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Recommends necessary follow-up panels and clinical consultations</p>
                      </div>
                    </div>
                  </>
                ) : activeMode === 'careplan' ? (
                  <>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">01</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Phased Recovery Pathway</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Designs immediate, short-term (1-2 weeks), and long-term milestones</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">02</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Therapeutic Nutrition Guide</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Categorizes vital recommended foods vs strictly forbidden items</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">03</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Lifestyle & Medication Synchronization</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Integrates dosage schedules with rest, hydration, and gentle activity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">04</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Follow-up WhatsApp Integration</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Automates patient reminders for return visits and clinical reviews</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">01</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Analyze Report</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Extract key medical information using AI</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">02</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Generate Draft Summary</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Create discharge summary and care plan</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">03</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 m-0">Doctor Review</h4>
                        <p className="text-[11px] text-slate-500 m-0 mt-0.5">Clinician reviews and edits the summary</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">04</div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 m-0">Finalize & Save</h4>
                      <p className="text-[11px] text-slate-500 m-0 mt-0.5">Save to patient records & generate claims</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {(activeMode === 'summary' || sd?.mode === 'summary') ? (
                renderReportSummarizer()
              ) : (activeMode === 'careplan' || sd?.mode === 'careplan') ? (
                renderCarePlan()
              ) : (
                <div className="space-y-6">
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">AI Diagnosis</p>
                      {(result.reportFileName || reportFile?.name) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100/80 text-blue-800 border border-blue-200/60">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span className="max-w-[180px] truncate">{result.reportFileName || reportFile?.name}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 m-0" style={{ fontSize: '22px' }}>{sd?.diagnosis || 'N/A'}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setReportFile(null);
                        const fileInput = document.getElementById('reportUpload');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      title="Upload and analyze another report"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>New Analysis</span>
                    </button>
                    <SeverityBadge severity={sd?.severity} />
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${result.validation?.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      {result.validation?.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {result.validation?.isValid ? 'Claims Ready' : `Missing: ${(result.validation?.missing || []).join(', ')}`}
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
