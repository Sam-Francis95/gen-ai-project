import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, User, Phone, Mail, Building2, MapPin, ArrowRight, 
  Activity, CalendarClock, TrendingUp, Sparkles, FileText, Send, 
  Edit, CheckCircle2, Clock, Stethoscope, ChevronRight 
} from 'lucide-react';
import DischargeAI from './DischargeAI';
import RecoveryTrackerTimeline from '../components/RecoveryTrackerTimeline';
import { fetchReferralById } from '../api/client';
import axios from 'axios';

export default function ReferralDetails() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [refData, histData] = await Promise.all([
          fetchReferralById(id),
          axios.get(`http://localhost:5000/discharge/transfer-history/${id}`).then(res => res.data).catch(() => [])
        ]);

        if (isActive) {
          setReferral(refData);
          setTransferHistory(histData || []);
          setError(null);
        }
      } catch (err) {
        if (isActive) setError('Unable to load referral details.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadData();
    return () => { isActive = false; };
  }, [id]);

  const patientName = referral?.patient?.name || 'Arjun Kumar';
  const patientPhone = referral?.patient?.phone || '8977669978';
  const department = referral?.department || 'Cardiology';
  const doctor = referral?.doctor || 'Dr. Mehta';
  const mrn = `CF-${10200 + Number(id || 1)}`;

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
    {
      date: '23 Sep 2026',
      title: 'Referral Created',
      desc: department,
      status: 'completed'
    },
    {
      date: '23 Sep 2026',
      title: 'AI Summary Generated',
      desc: 'Draft summary ready for review',
      status: 'completed'
    },
    {
      date: '24 Sep 2026',
      title: 'Appointment Scheduled',
      desc: `With ${doctor} (${department})`,
      status: 'completed'
    },
    {
      date: '24 Sep 2026',
      title: 'Specialist Consultation',
      desc: 'Completed',
      status: 'completed'
    },
    {
      date: '26 Sep 2026',
      title: 'Discharge Summary Generated',
      desc: 'Pending doctor review',
      status: 'pending'
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      
      {/* ── Top Patient Header Card (Exactly matching Screen 3 in Reference Image) ── */}
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
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.2 rounded-full">
                  Active
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Male • 42 years</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {patientPhone}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px]">MRN: {mrn}</span>
              </div>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer">
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

      {/* ── Tab Content ── */}
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
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Age / Gender</span>
                  <span className="font-bold text-slate-800 text-xs">42 years • Male</span>
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
                  {/* Step Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  </div>

                  {/* Date Column */}
                  <div className="w-24 shrink-0 text-[11px] text-slate-400 font-medium pt-0.5">
                    {step.date}
                  </div>

                  {/* Step Details */}
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

      {/* ── Recovery Tracker Tab ── */}
      {activeTab === 'Recovery Tracker' && (
        <RecoveryTrackerTimeline
          referralId={id}
          patientName={patientName}
          patientPhone={patientPhone}
        />
      )}

      {/* ── Other Standard Tabs ── */}
      {activeTab !== 'Overview' && activeTab !== 'Recovery Tracker' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 m-0">{activeTab}</h3>
          <p className="text-xs text-slate-500 mt-1">Detailed {activeTab.toLowerCase()} records for {patientName}.</p>
        </div>
      )}

    </div>
  );
}
