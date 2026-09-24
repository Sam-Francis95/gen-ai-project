import React, { useState } from 'react';
import { 
  X, Printer, Shield, CheckCircle2, AlertTriangle, FileText, 
  Copy, Check, Sparkles, Building2, User, Stethoscope, ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InsuranceClaimModal({ isOpen, onClose, claimData, patientInfo, hospitalName, doctorApproval }) {
  const [copied, setCopied] = useState(false);
  const [docsStatus, setDocsStatus] = useState(() => {
    const initial = {};
    (claimData?.requiredDocumentsChecklist || []).forEach(doc => {
      initial[doc.id] = doc.status === 'Ready';
    });
    return initial;
  });

  if (!isOpen || !claimData) return null;

  const handleCopyJustification = () => {
    if (claimData?.clinicalJustification) {
      navigator.clipboard.writeText(claimData.clinicalJustification);
      setCopied(true);
      toast.success('Clinical justification copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleDoc = (id) => {
    setDocsStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const primary = claimData?.primaryICD10 || {};
  const secondaries = claimData?.secondaryICD10 || [];
  const checklist = claimData?.requiredDocumentsChecklist || [];
  const risks = claimData?.rejectionRisks || [];
  const summary = claimData?.claimSummary || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 m-0">Health Insurance Claim Assistant</h2>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> TPA & Cashless Pre-Auth
                </span>
              </div>
              <p className="text-xs text-slate-500 m-0">Gemini-generated ICD-10 medical necessity dossier & rejection risk shield</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Claim Draft</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Claim Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 printable-area bg-white text-slate-800">

          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-700" />
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0">
                    {hospitalName || 'CareFlow Network Hospital'}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Department of Medical Records & TPA Insurance Billing Desk
                </p>
              </div>
              <div className="text-right sm:text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                  Claim Pre-Auth Dossier
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">Ref ID: CF-CLM-{(primary.code || 'GEN').replace('.', '')}-{Date.now().toString().slice(-5)}</p>
                <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Patient Demographics Bar */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{patientInfo?.name || 'Patient'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Age / Gender</span>
                <span className="font-bold text-slate-800">{patientInfo?.age || 'N/A'} yrs / {patientInfo?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Treatment Type</span>
                <span className="font-bold text-slate-800">{summary.treatmentType || 'Inpatient Medical Care'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Pre-Auth Eligibility</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                </span>
              </div>
            </div>

            {/* Doctor Clinical Approval Seal (if approved) */}
            {doctorApproval?.approvalStatus === 'APPROVED' && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified & Clinically Approved by {doctorApproval.approvedBy}</span>
                </div>
                <span className="text-emerald-600 font-mono text-[11px]">
                  {new Date(doctorApproval.approvedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 1: ICD-10 Coding */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" /> ICD-10 Diagnostic Classification
            </h3>

            {/* Primary ICD-10 */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl mb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-600 text-white font-mono font-bold text-sm px-3 py-1 rounded-lg">
                    {primary.code || 'ICD-10 Pending'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm m-0">{primary.description || 'Primary Diagnosis'}</h4>
                    <p className="text-xs text-blue-700 m-0">{primary.category || 'Clinical Classification'}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-100 px-2.5 py-1 rounded-md">
                  Primary Admitting Code
                </span>
              </div>
              {primary.clinicalRationale && (
                <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-blue-200/60 leading-relaxed">
                  <strong className="text-slate-700">Coding Rationale:</strong> {primary.clinicalRationale}
                </p>
              )}
            </div>

            {/* Secondary ICD-10s */}
            {secondaries.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 border-b border-slate-200">
                  Secondary Comorbidities & Risk Factor Codes (Secondary ICD-10)
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {secondaries.map((sec, idx) => (
                    <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50/50">
                      <span className="bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                        {sec.code}
                      </span>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">{sec.description}</span>
                        {sec.rationale && <p className="text-slate-500 text-[11px] mt-0.5">{sec.rationale}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Clinical Justification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Formal Inpatient Medical Necessity Justification
              </h3>
              <button
                onClick={handleCopyJustification}
                className="no-print text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Paragraph'}
              </button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs leading-relaxed font-serif">
              "{claimData.clinicalJustification}"
            </div>

            {/* Criteria */}
            {claimData.admissionNecessityCriteria?.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {claimData.admissionNecessityCriteria.map((c, i) => (
                  <div key={i} className="p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Required Documents Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mandatory Claim Documents Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {checklist.map((doc) => {
                const isReady = docsStatus[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer select-none ${
                      isReady ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(isReady)}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{doc.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isReady ? 'Ready' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Rejection Risks & Mitigations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Claim Audit & Rejection Risk Prevention
            </h3>
            <div className="space-y-2.5">
              {risks.map((risk, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/30 border border-amber-200/70 rounded-2xl text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {risk.riskFactor}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      risk.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                      risk.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {risk.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px]">{risk.reason}</p>
                  <div className="mt-2 pt-2 border-t border-amber-200/50 text-[11px] text-emerald-800 font-medium">
                    <strong className="text-emerald-900">Pre-emptive Mitigation:</strong> {risk.mitigationTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attestation & Signatures */}
          <div className="pt-6 border-t-2 border-slate-200 mt-6 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 mb-8">Attending Physician Attestation:</p>
              <div className="border-t border-slate-400 pt-1.5 font-mono text-[11px]">
                {doctorApproval?.approvedBy || 'Dr. Attending Physician, MD'}
                <br />
                <span className="text-slate-400 text-[10px]">Medical License & Reg. No. Verified</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 mb-8">Authorized TPA / Hospital Seal:</p>
              <div className="border-t border-slate-400 pt-1.5 font-mono text-[11px]">
                CareFlow Claims Desk
                <br />
                <span className="text-slate-400 text-[10px]">Hospital IRDAI Reg. Verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="no-print px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 m-0">Generated by CareFlow AI Claims Intelligence Engine</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Dossier</span>
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
