import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, User, Phone, Mail, Building2, MapPin, ArrowRight, 
  Activity, CalendarClock, TrendingUp, Sparkles, FileText, Send, 
  Edit, CheckCircle2, Clock, Stethoscope, ChevronRight, Plus,
  Calendar, Pill, ShieldAlert, AlertCircle, FileCheck, Check,
  X, Download, ExternalLink, RefreshCw, HeartPulse, Save
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import DischargeAI from './DischargeAI';
import RecoveryTrackerTimeline from '../components/RecoveryTrackerTimeline';
import { fetchReferralById, updateReferral, updateReferralStatus } from '../api/client';
import axios from 'axios';

export default function ReferralDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Demographic state per referral
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: '',
    phone: '',
    age: '',
    gender: '',
    department: '',
    doctor: '',
    priority: 'routine',
    status: 'CREATED',
    notes: ''
  });

  // Dynamic Tabs State (Per-Referral)
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [medications, setMedications] = useState([]);

  // Quick Modals for adding items
  const [addConditionOpen, setAddConditionOpen] = useState(false);
  const [newCondition, setNewCondition] = useState({ condition: '', status: 'Active', since: 'Current Intake', notes: '' });
  const [addAllergyOpen, setAddAllergyOpen] = useState(false);
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: 'Moderate', reaction: '' });
  const [addAppOpen, setAddAppOpen] = useState(false);
  const [newApp, setNewApp] = useState({ date: '', time: '10:00 AM', type: 'Follow-up Consultation', room: 'Consultation Suite 101' });
  const [addMedOpen, setAddMedOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '1 tab', frequency: 'Twice daily', timing: 'After Food', indication: '', duration: '7 days' });

  // Load and isolate data specifically for this referral ID
  const loadData = async () => {
    try {
      setLoading(true);
      const [refData, histData] = await Promise.all([
        fetchReferralById(id),
        axios.get(`http://localhost:5000/discharge/transfer-history/${id}`).then(res => res.data).catch(() => [])
      ]);

      setReferral(refData);
      setTransferHistory(histData || []);
      setError(null);

      // Load or set Age & Gender for this patient
      const savedAge = localStorage.getItem(`careflow_age_${id}`) || (refData.id === 8 ? '46' : '32');
      const savedGender = localStorage.getItem(`careflow_gender_${id}`) || (refData.id === 8 ? 'Male' : (refData.patient?.name?.toLowerCase().includes('mahathi') ? 'Female' : 'Unspecified'));
      setPatientAge(savedAge);
      setPatientGender(savedGender);

      // 1. Isolated Medical History for this Referral
      const savedHistory = localStorage.getItem(`careflow_medhistory_${id}`);
      if (savedHistory) {
        try { setMedicalHistory(JSON.parse(savedHistory)); } catch (_) {}
      } else {
        // Referral 8 is the baseline cardiac case; other referrals get their own tailored data
        if (refData.id === 8) {
          const defaultRef8 = [
            { id: 1, condition: 'Community-Acquired Pneumonia', status: 'Managed', since: '2026', notes: 'Right lower lobe consolidation treated with IV antibiotic regimen' },
            { id: 2, condition: 'Type 2 Diabetes Mellitus', status: 'Active', since: '2021', notes: 'Monitored with regular insulin sliding scale' },
            { id: 3, condition: 'Essential Hypertension', status: 'Managed', since: '2022', notes: 'Blood pressure stable on prescribed oral therapy' }
          ];
          setMedicalHistory(defaultRef8);
          localStorage.setItem(`careflow_medhistory_${id}`, JSON.stringify(defaultRef8));
        } else {
          const dynamicInitial = refData.notes 
            ? [{ id: 1, condition: refData.notes, status: 'Active', since: 'Presenting Intake', notes: `Presenting complaint documented upon referral to ${refData.department}` }]
            : [{ id: 1, condition: `${refData.department} Clinical Assessment`, status: 'Active', since: 'Current Intake', notes: `Specialized evaluation under ${refData.doctor || refData.specialist || 'specialist'}` }];
          setMedicalHistory(dynamicInitial);
        }
      }

      // 2. Isolated Allergies for this Referral
      const savedAllergies = localStorage.getItem(`careflow_allergies_${id}`);
      if (savedAllergies) {
        try { setAllergies(JSON.parse(savedAllergies)); } catch (_) {}
      } else {
        if (refData.id === 8) {
          const defaultAllergies = [
            { id: 1, allergen: 'Penicillin', severity: 'Moderate', reaction: 'Cutaneous skin rash' },
            { id: 2, allergen: 'Sulfa Drugs', severity: 'Mild', reaction: 'Mild nausea' }
          ];
          setAllergies(defaultAllergies);
        } else {
          setAllergies([
            { id: 1, allergen: 'No Known Drug Allergies (NKDA)', severity: 'Screened Negative', reaction: 'Screened at intake; no adverse drug reactions reported' }
          ]);
        }
      }

      // 3. Isolated Appointments for this Referral
      const savedApps = localStorage.getItem(`careflow_appointments_${id}`);
      if (savedApps) {
        try { setAppointments(JSON.parse(savedApps)); } catch (_) {}
      } else {
        const appDate = new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setAppointments([
          {
            id: 1,
            date: appDate,
            time: '10:30 AM',
            department: refData.department || 'Specialty Care',
            doctor: refData.doctor || refData.specialist || 'Attending Physician',
            type: `${refData.department} Specialist Consultation`,
            status: refData.status === 'VISITED' ? 'Completed' : (refData.status === 'BOOKED' ? 'Confirmed' : 'Scheduled'),
            room: `${refData.department || 'Clinical'} Suite 204`
          }
        ]);
      }

      // 4. Isolated Diagnostic Reports for this Referral
      const savedReports = localStorage.getItem(`careflow_reports_${id}`);
      if (savedReports) {
        try { setReports(JSON.parse(savedReports)); } catch (_) {}
      } else {
        const repDate = new Date(refData.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setReports([
          { id: 'rep_1', name: `${refData.department} Referral Order & Clinical Intake`, date: repDate, category: 'Clinical Intake', status: 'Verified', size: '1.2 MB' }
        ]);
      }

      // 5. Isolated Medications for this Referral
      const savedMeds = localStorage.getItem(`careflow_meds_${id}`);
      if (savedMeds) {
        try { setMedications(JSON.parse(savedMeds)); } catch (_) {}
      } else {
        if (refData.id === 8) {
          setMedications([
            { id: 1, name: 'Oral Antibiotic (Amoxicillin 500mg)', dosage: '1 Capsule', frequency: 'Twice daily (1-0-1)', timing: 'After Food', indication: 'Pneumonia resolution', status: 'Active', duration: '7 days' },
            { id: 2, name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'Every 6 hours as needed', timing: 'After Food', indication: 'Fever & body ache', status: 'Active', duration: '5 days' },
            { id: 3, name: 'Pantoprazole 40mg', dosage: '1 Tablet', frequency: 'Once daily in morning', timing: 'Before Food', indication: 'Gastric protection', status: 'Active', duration: '14 days' }
          ]);
        } else {
          setMedications([]);
        }
      }

    } catch (err) {
      setError('Unable to load referral details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const patientName = referral?.patient?.name || 'Patient';
  const patientPhone = referral?.patient?.phone || 'Not available';
  const department = referral?.department || 'Specialty Care';
  const doctor = referral?.doctor || referral?.specialist || 'Attending Physician';
  const mrn = `CF-${10200 + Number(id || 1)}`;

  // Handle Edit Referral Modal Open
  const handleOpenEdit = () => {
    setEditForm({
      patientName: referral?.patient?.name || '',
      phone: referral?.patient?.phone || '',
      age: patientAge || '',
      gender: patientGender || '',
      department: referral?.department || '',
      doctor: referral?.doctor || referral?.specialist || '',
      priority: referral?.priority || 'routine',
      status: referral?.status || 'CREATED',
      notes: referral?.notes || ''
    });
    setEditModalOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await updateReferral(id, editForm);
      setReferral(res.data || res);
      
      // Update Age and Gender
      if (editForm.age) {
        setPatientAge(editForm.age);
        localStorage.setItem(`careflow_age_${id}`, editForm.age);
      }
      if (editForm.gender) {
        setPatientGender(editForm.gender);
        localStorage.setItem(`careflow_gender_${id}`, editForm.gender);
      }

      toast.success('Patient referral updated successfully!', { icon: '✅' });
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to update referral');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Status Update directly from Referrals Tab
  const handleStatusTransition = async (newStatus) => {
    try {
      await updateReferralStatus(id, {
        status: newStatus,
        note: `Status updated to ${newStatus} by attending clinician`
      });
      setReferral(prev => ({
        ...prev,
        status: newStatus,
        events: [
          ...(prev?.events || []),
          {
            id: Date.now(),
            referralId: id,
            status: newStatus,
            note: `Status updated to ${newStatus}`,
            createdAt: new Date().toISOString()
          }
        ]
      }));
      toast.success(`Referral marked as ${newStatus}!`, { icon: '🔄' });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Add condition handler with per-referral storage
  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.condition.trim()) return;
    const updated = [...medicalHistory, { ...newCondition, id: Date.now() }];
    setMedicalHistory(updated);
    localStorage.setItem(`careflow_medhistory_${id}`, JSON.stringify(updated));
    setNewCondition({ condition: '', status: 'Active', since: 'Current Intake', notes: '' });
    setAddConditionOpen(false);
    toast.success('Medical diagnosis added to patient history!', { icon: '📋' });
  };

  // Add allergy handler with per-referral storage
  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (!newAllergy.allergen.trim()) return;
    const filtered = allergies.filter(a => !a.allergen.includes('NKDA'));
    const updated = [...filtered, { ...newAllergy, id: Date.now() }];
    setAllergies(updated);
    localStorage.setItem(`careflow_allergies_${id}`, JSON.stringify(updated));
    setNewAllergy({ allergen: '', severity: 'Moderate', reaction: '' });
    setAddAllergyOpen(false);
    toast.success('Allergy documented in patient chart!', { icon: '🛡️' });
  };

  // Add appointment handler with per-referral storage
  const handleAddAppointment = (e) => {
    e.preventDefault();
    const appItem = {
      id: Date.now(),
      date: newApp.date || new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: newApp.time,
      department: department,
      doctor: doctor,
      type: newApp.type,
      status: 'Scheduled',
      room: newApp.room
    };
    const updated = [appItem, ...appointments];
    setAppointments(updated);
    localStorage.setItem(`careflow_appointments_${id}`, JSON.stringify(updated));
    setAddAppOpen(false);
    toast.success('Consultation appointment booked!', { icon: '📅' });
  };

  // Add medication handler with per-referral storage
  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;
    const updated = [...medications, { ...newMed, id: Date.now(), status: 'Active' }];
    setMedications(updated);
    localStorage.setItem(`careflow_meds_${id}`, JSON.stringify(updated));
    setNewMed({ name: '', dosage: '1 tab', frequency: 'Twice daily', timing: 'After Food', indication: '', duration: '7 days' });
    setAddMedOpen(false);
    toast.success('Prescription added to patient chart!', { icon: '💊' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-medium text-slate-600">Loading patient profile...</span>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3">{error || 'Patient referral not found'}</h2>
        <Link to="/referrals" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Back to Referrals Hub
        </Link>
      </div>
    );
  }

  // Dynamic Timeline derived from actual referral events & dates
  const createdDate = referral.createdAt 
    ? new Date(referral.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently';
  const updatedDate = referral.updatedAt 
    ? new Date(referral.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : createdDate;

  const dynamicTimelineSteps = [
    {
      date: createdDate,
      title: 'Referral Registered',
      desc: `${department} (Priority: ${(referral.priority || 'Routine').toUpperCase()})`,
      status: 'completed'
    },
    {
      date: createdDate,
      title: 'Clinical Assignment',
      desc: `Assigned to ${doctor} for clinical consultation`,
      status: 'completed'
    },
    {
      date: updatedDate,
      title: `Current Status: ${referral.status || 'CREATED'}`,
      desc: referral.notes ? `Clinical Notes: ${referral.notes}` : `Workflow active under ${department}`,
      status: referral.status === 'VISITED' ? 'completed' : 'active'
    }
  ];

  if (referral.status === 'VISITED') {
    dynamicTimelineSteps.push({
      date: updatedDate,
      title: 'Specialist Consultation Completed',
      desc: 'Patient evaluation completed and clinical orders recorded',
      status: 'completed'
    });
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      <Toaster position="top-right" />
      
      {/* ── Top Patient Header Card ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Avatar & Patient Summary */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 m-0">{patientName}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {referral.status || 'Active'}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  referral.priority === 'emergency' ? 'bg-red-50 text-red-700 border-red-200' :
                  referral.priority === 'urgent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {referral.priority || 'Routine'} Priority
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="font-semibold text-slate-700">{department}</span>
                <span className="text-slate-300">•</span>
                <span>{patientGender ? `${patientGender} • ` : ''}{patientAge ? `${patientAge} years` : 'Age Unspecified'}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {patientPhone}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px]">MRN: {mrn}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-medium">Physician: {doctor}</span>
              </div>
            </div>
          </div>

          {/* Right Action: Working Edit Button */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 border-t border-slate-100 mt-5 pt-3 overflow-x-auto text-xs font-semibold">
          {[
            'Overview',
            'Medical History',
            'Referrals',
            'Appointments',
            'Reports',
            'Medications',
            'Recovery Tracker'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: OVERVIEW */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Patient Details Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">
              Patient Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Name</span>
                  <span className="font-bold text-slate-800 text-xs">{patientName}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Specialist</span>
                  <span className="font-bold text-slate-800 text-xs">{doctor} ({department})</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                  <span className="font-bold text-slate-800 text-xs">{patientPhone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient ID (MRN)</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">{mrn}</span>
                </div>
              </div>

              {referral.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Referral Notes</span>
                  <p className="text-slate-700 m-0 leading-relaxed text-[11px]">{referral.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setActiveTab('Recovery Tracker')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Open Recovery Tracker</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clinical Timeline */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">
              Clinical Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {dynamicTimelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  </div>
                  <div className="w-28 shrink-0 text-[11px] text-slate-400 font-medium pt-0.5">
                    {step.date}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 m-0">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 m-0">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Discharge Operations */}
            <div className="pt-4 border-t border-slate-100">
              <DischargeAI embedded={true} initialData={{ patientName, notes: referral?.notes || '', referralId: id }} />
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: MEDICAL HISTORY */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Medical History' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Patient Medical History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Documented clinical conditions, past surgeries, and allergies specifically for {patientName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddAllergyOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl cursor-pointer border border-red-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Allergy</span>
              </button>
              <button
                onClick={() => setAddConditionOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chronic Conditions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Diagnosed Conditions</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{medicalHistory.length} Conditions</span>
              </div>

              {medicalHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No medical conditions documented yet for {patientName}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {medicalHistory.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.condition}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${item.status === 'Managed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 m-0">{item.notes}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Timeline: {item.since}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies & Intolerances */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Allergies & Adverse Drug Reactions</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">{allergies.length} Flagged</span>
              </div>

              <div className="space-y-2.5">
                {allergies.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-red-50/40 border border-red-100 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-red-900">{item.allergen}</span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-100 text-red-700">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-red-700 mt-1 m-0">Reaction: {item.reaction}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Past Interventions */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-800 block mb-2">Clinical Intake Summary</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800">{department} Specialist Consultation</span>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                    {referral.notes ? `Reason for referral: "${referral.notes}"` : `Referred under priority: ${(referral.priority || 'routine').toUpperCase()}`}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: REFERRALS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Referrals' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Referral Management & Workflow Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Current referral record #{id} status workflow for {patientName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatusTransition('CONTACTED')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                📞 Mark Contacted
              </button>
              <button
                onClick={() => handleStatusTransition('BOOKED')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                📅 Confirm Booked
              </button>
              <button
                onClick={() => handleStatusTransition('VISITED')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                ✅ Mark Visited
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Referral Target</span>
              <h4 className="text-sm font-bold text-slate-900 m-0">{department}</h4>
              <p className="text-xs text-slate-600 m-0">Assigned Doctor: <span className="font-semibold text-slate-900">{doctor}</span></p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Priority: </span>
                <span className="font-bold text-slate-900 uppercase">{referral.priority || 'Routine'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Referral Status</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-base font-bold text-slate-900">{referral.status || 'ACTIVE'}</span>
              </div>
              <p className="text-xs text-slate-500 m-0">Last updated: {new Date(referral.updatedAt || Date.now()).toLocaleDateString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Hospital Facility</span>
              <h4 className="text-sm font-bold text-slate-900 m-0">CareFlow Inpatient Hub</h4>
              <p className="text-xs text-slate-500 m-0">MRN: {mrn} • Phone: {patientPhone}</p>
            </div>

          </div>

          {/* Referral Events History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">
              Referral Event Trail
            </h3>

            <div className="space-y-3">
              {(referral.events && referral.events.length > 0 ? referral.events : [
                { id: 1, status: 'CREATED', note: 'Referral created and logged in CareFlow', createdAt: referral.createdAt },
                { id: 2, status: referral.status || 'ACTIVE', note: 'Referral actively handled by clinical team', createdAt: referral.updatedAt }
              ]).map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-slate-800">{ev.status}</span>
                    <span className="text-slate-500">{ev.note}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: APPOINTMENTS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Appointments' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Scheduled Consultations & Visits</h2>
              <p className="text-xs text-slate-500 mt-0.5">Doctor appointment schedules specifically for {patientName}</p>
            </div>
            <button
              onClick={() => setAddAppOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 m-0">{app.type}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 m-0">With <span className="font-semibold text-slate-900">{app.doctor}</span> ({app.department})</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">Location: {app.room}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span>{app.date}</span>
                  <span className="text-slate-300">•</span>
                  <span>{app.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: REPORTS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Reports' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Diagnostic Reports & Clinical Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Clinical files, blood work, ECG, and pathology records for {patientName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/report-summarizer')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in Report Summarizer</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reports.map(rep => (
              <div key={rep.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {rep.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{rep.size}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 m-0 leading-snug">{rep.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-1">Uploaded: {rep.date}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {rep.status}
                  </span>
                  <button
                    onClick={() => navigate('/report-summarizer')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Extract Biomarkers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: MEDICATIONS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Medications' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Prescription & Medication Reconciliation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active pharmacological regimen for {patientName}</p>
            </div>
            <button
              onClick={() => setAddMedOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>

          {medications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 m-0">No Prescriptions Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto m-0">
                No active medications have been prescribed yet for {patientName}. You can add prescriptions manually or generate a medication plan via Discharge AI.
              </p>
              <button
                onClick={() => setAddMedOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prescribe Medication</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Medication & Strength</th>
                      <th className="py-3 px-4">Dosage & Frequency</th>
                      <th className="py-3 px-4">Relation to Food</th>
                      <th className="py-3 px-4">Clinical Indication</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medications.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-900">{med.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{med.dosage} • {med.frequency}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${med.timing.includes('Before') ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                            {med.timing}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{med.indication}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{med.duration}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {med.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 7: RECOVERY TRACKER */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Recovery Tracker' && (
        <RecoveryTrackerTimeline
          referralId={id}
          patientName={patientName}
          patientPhone={patientPhone}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* EDIT REFERRAL MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 m-0">Edit Patient Referral Details</h3>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={editForm.patientName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 32"
                    value={editForm.age}
                    onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Doctor</label>
                  <input
                    type="text"
                    value={editForm.doctor}
                    onChange={(e) => setEditForm(prev => ({ ...prev, doctor: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="CREATED">CREATED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="VISITED">VISITED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referral Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ADD CONDITION MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {addConditionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 m-0">Add Medical Diagnosis for {patientName}</h3>
              <button onClick={() => setAddConditionOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCondition} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Condition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migraine with aura, Vertigo, Lumbar strain"
                  value={newCondition.condition}
                  onChange={e => setNewCondition(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={newCondition.status}
                    onChange={e => setNewCondition(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Managed">Managed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Since / Intake</label>
                  <input
                    type="text"
                    value={newCondition.since}
                    onChange={e => setNewCondition(prev => ({ ...prev, since: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Under active specialist observation"
                  value={newCondition.notes}
                  onChange={e => setNewCondition(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddConditionOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">Add Diagnosis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ADD ALLERGY MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {addAllergyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 m-0">Add Drug or Food Allergy</h3>
              <button onClick={() => setAddAllergyOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddAllergy} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Allergen Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penicillin, NSAIDs, Peanuts"
                  value={newAllergy.allergen}
                  onChange={e => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Severity</label>
                <select
                  value={newAllergy.severity}
                  onChange={e => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-semibold"
                >
                  <option value="Severe">Severe (Anaphylaxis risk)</option>
                  <option value="Moderate">Moderate (Urticaria/Rash)</option>
                  <option value="Mild">Mild (GI upset)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reaction Symptoms</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skin rashes, swelling, respiratory difficulty"
                  value={newAllergy.reaction}
                  onChange={e => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddAllergyOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-xl">Save Allergy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BOOK APPOINTMENT MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {addAppOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 m-0">Schedule Consultation for {patientName}</h3>
              <button onClick={() => setAddAppOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consultation Date</label>
                  <input
                    type="date"
                    required
                    value={newApp.date}
                    onChange={e => setNewApp(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={newApp.time}
                    onChange={e => setNewApp(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Appointment Type</label>
                <input
                  type="text"
                  value={newApp.type}
                  onChange={e => setNewApp(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinic / Suite Location</label>
                <input
                  type="text"
                  value={newApp.room}
                  onChange={e => setNewApp(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddAppOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ADD MEDICATION MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {addMedOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 m-0">Prescribe Medication for {patientName}</h3>
              <button onClick={() => setAddMedOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMed} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Drug Name & Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Levetiracetam 500mg, Sumatriptan 50mg"
                  value={newMed.name}
                  onChange={e => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily"
                    value={newMed.frequency}
                    onChange={e => setNewMed(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Timing</label>
                  <select
                    value={newMed.timing}
                    onChange={e => setNewMed(prev => ({ ...prev, timing: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-semibold"
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Neuro-stabilization, Migraine relief"
                  value={newMed.indication}
                  onChange={e => setNewMed(prev => ({ ...prev, indication: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddMedOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">Add Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
