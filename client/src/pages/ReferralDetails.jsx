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

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: '',
    phone: '',
    department: '',
    doctor: '',
    priority: 'routine',
    status: 'CREATED',
    notes: ''
  });

  // Dynamic Tabs State
  const [medicalHistory, setMedicalHistory] = useState([
    { id: 1, condition: 'Essential Hypertension', status: 'Managed', since: '2022', notes: 'Well controlled on Lisinopril 10mg daily' },
    { id: 2, condition: 'Type 2 Diabetes Mellitus', status: 'Active', since: '2021', notes: 'Diet and Metformin 500mg, last HbA1c 7.2%' },
    { id: 3, condition: 'Mild Dyslipidemia', status: 'Active', since: '2023', notes: 'Atorvastatin 20mg at bedtime' }
  ]);
  const [allergies, setAllergies] = useState([
    { id: 1, allergen: 'Penicillin', severity: 'Moderate', reaction: 'Maculopapular cutaneous rash' },
    { id: 2, allergen: 'Sulfa Drugs', severity: 'Mild', reaction: 'Mild nausea and pruritus' }
  ]);
  const [appointments, setAppointments] = useState([
    { id: 1, date: '02 Oct 2026', time: '10:30 AM', department: 'Cardiology', doctor: 'Dr. Mehta', type: 'Specialist Consultation', status: 'Confirmed', room: 'OPD Suite 204' },
    { id: 2, date: '24 Sep 2026', time: '02:00 PM', department: 'General Medicine', doctor: 'Dr. Sarah Jenkins', type: 'Initial Triage & Admission', status: 'Completed', room: 'Emergency Room' }
  ]);
  const [reports, setReports] = useState([
    { id: 'rep_1', name: 'Comprehensive Blood Panel & Cardiac Biomarkers', date: '29 Sep 2026', category: 'Hematology', status: 'Verified', size: '2.4 MB' },
    { id: 'rep_2', name: '12-Lead Electrocardiogram (ECG) Report', date: '29 Sep 2026', category: 'Cardiology', status: 'Verified', size: '1.1 MB' },
    { id: 'rep_3', name: 'Hospital Inpatient Discharge Summary', date: '30 Sep 2026', category: 'Clinical', status: 'Attested', size: '1.8 MB' }
  ]);
  const [medications, setMedications] = useState([
    { id: 1, name: 'Amoxicillin 500mg', dosage: '1 Capsule', frequency: 'Twice daily (1-0-1)', timing: 'After Food', indication: 'Infection resolution', status: 'Active', duration: '7 days' },
    { id: 2, name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'As needed (every 6h)', timing: 'After Food', indication: 'Pain & fever control', status: 'Active', duration: '5 days' },
    { id: 3, name: 'Pantoprazole 40mg', dosage: '1 Tablet', frequency: 'Once daily morning', timing: 'Before Food', indication: 'Gastric mucosal protection', status: 'Active', duration: '14 days' },
    { id: 4, name: 'Atorvastatin 20mg', dosage: '1 Tablet', frequency: 'Once daily bedtime', timing: 'After Food', indication: 'Lipid stabilization', status: 'Active', duration: 'Ongoing' }
  ]);

  // Quick Modals for adding items
  const [addConditionOpen, setAddConditionOpen] = useState(false);
  const [newCondition, setNewCondition] = useState({ condition: '', status: 'Active', since: '2026', notes: '' });
  const [addMedOpen, setAddMedOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '1 tab', frequency: 'Twice daily', timing: 'After Food', indication: '', duration: '7 days' });

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
    } catch (err) {
      setError('Unable to load referral details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const patientName = referral?.patient?.name || 'Rahul Kumar';
  const patientPhone = referral?.patient?.phone || '9876543210';
  const department = referral?.department || 'Cardiology';
  const doctor = referral?.doctor || referral?.specialist || 'Dr. Mehta';
  const mrn = `CF-${10200 + Number(id || 1)}`;

  // Handle Edit Referral Modal Open
  const handleOpenEdit = () => {
    setEditForm({
      patientName: referral?.patient?.name || '',
      phone: referral?.patient?.phone || '',
      department: referral?.department || 'Cardiology',
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

  // Add condition handler
  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.condition.trim()) return;
    setMedicalHistory(prev => [...prev, { ...newCondition, id: Date.now() }]);
    setNewCondition({ condition: '', status: 'Active', since: '2026', notes: '' });
    setAddConditionOpen(false);
    toast.success('Medical diagnosis added to patient history!', { icon: '📋' });
  };

  // Add medication handler
  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;
    setMedications(prev => [...prev, { ...newMed, id: Date.now(), status: 'Active' }]);
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

  const timelineSteps = [
    { date: '23 Sep 2026', title: 'Referral Created', desc: `${department} (Priority: ${referral.priority || 'Routine'})`, status: 'completed' },
    { date: '23 Sep 2026', title: 'AI Summary Generated', desc: 'Draft clinical summary ready for review', status: 'completed' },
    { date: '24 Sep 2026', title: 'Appointment Scheduled', desc: `With ${doctor} (${department})`, status: 'completed' },
    { date: '24 Sep 2026', title: 'Specialist Consultation', desc: `Status: ${referral.status || 'ACTIVE'}`, status: 'completed' },
    { date: '26 Sep 2026', title: 'Discharge Summary Generated', desc: 'Attested by attending clinician', status: 'pending' }
  ];

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
                <span>{referral.department || 'Specialty Care'}</span>
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
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  </div>
                  <div className="w-24 shrink-0 text-[11px] text-slate-400 font-medium pt-0.5">
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
              <p className="text-xs text-slate-500 mt-0.5">Documented chronic conditions, past surgeries, and allergies for {patientName}</p>
            </div>
            <button
              onClick={() => setAddConditionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition</span>
            </button>
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
                      <span className="text-[10px] text-slate-400 mt-1 block">Diagnosed: {item.since}</span>
                    </div>
                  </div>
                ))}
              </div>
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

              {/* Surgical History */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-800 block mb-2">Past Surgical Interventions</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800">Laparoscopic Appendectomy (2021)</span>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">Uncomplicated surgical recovery at City General Hospital</p>
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
              <h2 className="text-base font-bold text-slate-900 m-0">Referral & Network Transfer Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Current referral record #{id} status workflow and audit history</p>
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
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Transfer Facility</span>
              <h4 className="text-sm font-bold text-slate-900 m-0">CareFlow Inpatient Hub</h4>
              <p className="text-xs text-slate-500 m-0">Electronic Medical Record linked to MRN: {mrn}</p>
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
              <p className="text-xs text-slate-500 mt-0.5">Doctor appointment schedules for {patientName}</p>
            </div>
            <button
              onClick={() => {
                setAppointments(prev => [
                  { id: Date.now(), date: '08 Oct 2026', time: '11:00 AM', department: department, doctor: doctor, type: 'Follow-up Review', status: 'Scheduled', room: 'OPD Suite 204' },
                  ...prev
                ]);
                toast.success('Follow-up consultation appointment booked!', { icon: '📅' });
              }}
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
              <h2 className="text-base font-bold text-slate-900 m-0">Diagnostic Reports & Laboratory Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Clinical files, blood work, ECG, and pathology records</p>
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
                <h3 className="text-base font-bold text-slate-900 m-0">Edit Patient Referral</h3>
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
              <h3 className="text-base font-bold text-slate-900 m-0">Add Diagnosed Condition</h3>
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
                  placeholder="e.g. Asthma, Hyperlipidemia, Osteoarthritis"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Managed">Managed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosed Year</label>
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
                  placeholder="e.g. Under medication control"
                  value={newCondition.notes}
                  onChange={e => setNewCondition(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddConditionOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">Add Condition</button>
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
              <h3 className="text-base font-bold text-slate-900 m-0">Add Prescription</h3>
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
                  placeholder="e.g. Lisinopril 10mg"
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
                    placeholder="e.g. Once daily"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Blood pressure regulation"
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
