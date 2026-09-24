import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Clock, Plus, CheckCircle2, AlertCircle, TrendingUp, 
  Heart, Thermometer, Wind, Pill, User, Stethoscope, ChevronRight, 
  Sparkles, X, Loader2, ArrowUpRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recordProgressNote, fetchProgressNotes } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function RecoveryTrackerTimeline({ referralId, patientName, patientPhone }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ baseline: null, progressNotes: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Recording Follow-up Visit
  const [form, setForm] = useState({
    dayLabel: 'Day 7',
    visitDate: new Date().toISOString().split('T')[0],
    bp: '120/80',
    heartRate: '74',
    temp: '98.6',
    spo2: '99',
    weight: '',
    bloodSugar: '',
    currentSymptoms: '',
    adherence: 'Full (100%)',
    clinicalNotes: '',
    recordedBy: user?.hospitalName ? `Dr. on duty (${user.hospitalName})` : 'Attending Physician'
  });

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const res = await fetchProgressNotes(referralId);
      setData(res || { baseline: null, progressNotes: [] });
    } catch (err) {
      console.error('Failed to load recovery progress notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (referralId) {
      loadProgressData();
    }
  }, [referralId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentSymptoms && !form.clinicalNotes) {
      toast.error('Please enter current symptoms or clinical observations.');
      return;
    }

    try {
      setSubmitting(true);
      await recordProgressNote({
        referralId,
        dayLabel: form.dayLabel,
        visitDate: form.visitDate,
        vitals: {
          bp: form.bp,
          heartRate: form.heartRate,
          temp: form.temp,
          spo2: form.spo2,
          weight: form.weight,
          bloodSugar: form.bloodSugar
        },
        currentSymptoms: form.currentSymptoms,
        adherence: form.adherence,
        clinicalNotes: form.clinicalNotes,
        recordedBy: form.recordedBy
      });

      toast.success(`${form.dayLabel} recovery check-in analyzed and saved!`, { icon: '📈' });
      setIsModalOpen(false);
      setForm(prev => ({
        ...prev,
        dayLabel: 'Day 14',
        currentSymptoms: '',
        clinicalNotes: ''
      }));
      loadProgressData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record follow-up visit.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'improving':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      case 'stable':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'regressing':
      case 'concerning':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 m-0">Patient Recovery Tracker</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gemini comparative trajectory comparing Day 0 baseline against follow-up visits
          </p>
        </div>

        {/* Record Follow-up Visit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Follow-up Visit</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <span className="text-xs font-medium">Loading recovery timeline...</span>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-100">

          {/* NODE 1: Day 0 Baseline Discharge */}
          <div className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-indigo-50 shadow-sm">
              0
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    Day 0: Baseline Discharge
                  </span>
                  <span className="text-xs text-slate-400">
                    {data.baseline?.createdAt ? new Date(data.baseline.createdAt).toLocaleDateString() : 'Initial Admission'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                  Baseline Anchor
                </span>
              </div>

              <div className="mt-2 text-xs">
                <span className="font-bold text-slate-800 text-sm block">
                  {data.baseline?.diagnosis || 'Initial Inpatient Admission & Medical Evaluation'}
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {data.baseline?.clinicalSummary || 'Patient admitted and stabilized in hospital with prescribed medical care regimen.'}
                </p>

                {data.baseline?.meds?.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Pill className="w-3 h-3 text-indigo-500" /> Prescribed:
                    </span>
                    {data.baseline.meds.slice(0, 4).map((m, i) => (
                      <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                        {typeof m === 'object' ? m.name : m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOLLOW-UP CHECKPOINTS (Day 7, Day 21, etc.) */}
          {data.progressNotes.map((note, index) => {
            const statusConfig = getStatusBadge(note.recovery_status);
            const ai = note.ai_comparison || {};
            const vitals = note.vitals || {};

            return (
              <div key={note.id} className="relative group animate-fade-in">
                {/* Timeline Dot */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ring-4 shadow-sm ${
                  note.recovery_status?.toLowerCase() === 'improving' ? 'bg-emerald-600 text-white ring-emerald-50' :
                  note.recovery_status?.toLowerCase() === 'regressing' ? 'bg-red-600 text-white ring-red-50' :
                  'bg-amber-500 text-white ring-amber-50'
                }`}>
                  {note.day_label ? note.day_label.replace(/\D/g, '') || (index + 1) : (index + 1)}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-200 transition-all">
                  
                  {/* Note Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {note.day_label || `Visit ${index + 1}`} Check-in
                      </span>
                      <span className="text-xs text-slate-400">· {note.visit_date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ai.recoveryScore && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          Recovery Score: {ai.recoveryScore}%
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {note.recovery_status || 'Evaluating'}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Summary Pill Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs">
                    {vitals.bp && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>BP: <strong className="text-slate-800">{vitals.bp}</strong></span>
                      </div>
                    )}
                    {vitals.heartRate && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span>Pulse: <strong className="text-slate-800">{vitals.heartRate} bpm</strong></span>
                      </div>
                    )}
                    {vitals.temp && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        <span>Temp: <strong className="text-slate-800">{vitals.temp}°F</strong></span>
                      </div>
                    )}
                    {vitals.spo2 && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Wind className="w-3.5 h-3.5 text-sky-500" />
                        <span>SpO2: <strong className="text-slate-800">{vitals.spo2}%</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Patient Symptoms & Adherence */}
                  <div className="text-xs space-y-1.5 mb-3.5">
                    {note.current_symptoms && (
                      <div className="text-slate-700">
                        <strong className="text-slate-900">Current Symptoms:</strong> {note.current_symptoms}
                      </div>
                    )}
                    {note.adherence && (
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">Medication Adherence:</strong>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded text-[11px] font-semibold">
                          {note.adherence}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Comparative Insights Box */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Trajectory Analysis (vs Baseline)
                      </span>
                    </div>

                    {ai.progressNarrative && (
                      <p className="text-slate-700 leading-relaxed m-0 font-medium">
                        {ai.progressNarrative}
                      </p>
                    )}

                    {/* Comparison Highlights */}
                    {ai.comparisonHighlights?.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100/70 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ai.comparisonHighlights.map((hl, i) => (
                          <div key={i} className="p-2 bg-white/80 rounded-lg border border-indigo-100/60 text-[11px]">
                            <span className="font-bold text-slate-800 block">{hl.metric}</span>
                            <span className="text-slate-400 block line-through">{hl.baseline}</span>
                            <span className="text-emerald-700 font-semibold block">{hl.current}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Clinical Recommendations */}
                    {ai.recommendations?.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100/70">
                        <span className="font-bold text-indigo-900 block mb-1">Ongoing Care Recommendations:</span>
                        <ul className="space-y-1 pl-3 m-0 list-disc text-slate-600 text-[11px]">
                          {ai.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Recorded by: {note.recorded_by || 'Staff'}</span>
                    <span>Saved: {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {data.progressNotes.length === 0 && (
            <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 m-0">No Follow-up Visits Recorded Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Record the patient's Day 7, Day 14, or Day 21 visit. Gemini will analyze their recovery progress compared to the Day 0 baseline.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Record Day 7 Visit
              </button>
            </div>
          )}

        </div>
      )}

      {/* RECORD FOLLOW-UP VISIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Record Follow-up Visit</h3>
                  <p className="text-[11px] text-slate-500 m-0">{patientName || 'Patient'} · Referral #{referralId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRecordSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Day Label & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Checkpoint</label>
                  <select
                    name="dayLabel"
                    value={form.dayLabel}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Day 7">Day 7 Follow-up</option>
                    <option value="Day 14">Day 14 Follow-up</option>
                    <option value="Day 21">Day 21 Follow-up</option>
                    <option value="Day 30">Day 30 Review</option>
                    <option value="Day 60">Day 60 Milestone</option>
                    <option value="Day 90">Day 90 Final Review</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    name="visitDate"
                    value={form.visitDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Vitals Input Grid */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Current Vital Signs</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">BP (mmHg)</span>
                    <input
                      type="text"
                      name="bp"
                      placeholder="120/80"
                      value={form.bp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pulse (bpm)</span>
                    <input
                      type="text"
                      name="heartRate"
                      placeholder="72"
                      value={form.heartRate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Temp (°F)</span>
                    <input
                      type="text"
                      name="temp"
                      placeholder="98.6"
                      value={form.temp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                    <input
                      type="text"
                      name="spo2"
                      placeholder="99"
                      value={form.spo2}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Current Symptoms & Subjective Report */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Symptoms & Patient Feedback</label>
                <textarea
                  name="currentSymptoms"
                  rows={2}
                  placeholder="e.g. Cough reduced by 80%, no fever spikes, normal breathing, mild appetite improvement..."
                  value={form.currentSymptoms}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Medication Adherence */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medication Adherence</label>
                <select
                  name="adherence"
                  value={form.adherence}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full (100%)">Full (100%) — Took all doses as prescribed</option>
                  <option value="Partial (Missed 1-2 doses)">Partial — Missed 1 to 2 doses</option>
                  <option value="Poor / Stopped due to side effects">Poor / Stopped medication prematurely</option>
                </select>
              </div>

              {/* Doctor / Clinical Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Physician Observations / Instructions</label>
                <textarea
                  name="clinicalNotes"
                  rows={2}
                  placeholder="Physical exam findings, auscultation results, or instructions given..."
                  value={form.clinicalNotes}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{submitting ? 'Gemini Analyzing...' : 'Analyze & Save Visit'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
