import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  Building,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { Scholarship, StudentProfile, MatchResult } from '../types';
import { generateScholarshipAdvice } from '../services/geminiService';

interface ScholarshipDetailsModalProps {
  scholarship: Scholarship;
  studentProfile: StudentProfile | null;
  matchResult?: MatchResult;
  onClose: () => void;
}

export const ScholarshipDetailsModal: React.FC<ScholarshipDetailsModalProps> = ({
  scholarship,
  studentProfile,
  matchResult,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents' | 'procedure' | 'rejections' | 'aiAdvice'>('overview');
  const [aiAdviceText, setAiAdviceText] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fetchAiAdvice = async () => {
    if (!studentProfile || !matchResult) return;
    setIsLoadingAdvice(true);
    try {
      const advice = await generateScholarshipAdvice(studentProfile, matchResult);
      setAiAdviceText(advice);
    } catch {
      setAiAdviceText('Unable to retrieve personalized AI advice at this moment.');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(scholarship.officialLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#E5EAE8] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-[#E5EAE8] bg-[#F7F8F5] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#142B4A]/10 text-[#142B4A]">
                {scholarship.providerType}
              </span>
              <span aria-hidden="true" className="text-[#E5EAE8]">·</span>
              <span className="text-xs font-medium text-[#718096]">
                {scholarship.schemeType}
              </span>
              {scholarship.verified && (
                <>
                  <span aria-hidden="true" className="text-[#E5EAE8]">·</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#159A80]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#159A80]" />
                    Verified Official Scheme
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142B4A] font-display">
              {scholarship.name}
            </h2>
            <p className="text-xs text-[#718096] mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#718096] shrink-0" />
              <span>{scholarship.provider}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#718096] hover:text-[#142B4A] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5EAE8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Zero-pill segmented buttons) */}
        <div className="px-6 pt-3 border-b border-[#E5EAE8] bg-white overflow-x-auto flex gap-1">
          {[
            { id: 'overview', label: 'Overview & Benefit' },
            { id: 'eligibility', label: 'Eligibility Conditions' },
            { id: 'documents', label: 'Required Documents' },
            { id: 'procedure', label: 'Step-by-Step Procedure' },
            { id: 'rejections', label: 'Common Rejection Traps' },
            ...(studentProfile && matchResult ? [{ id: 'aiAdvice', label: 'AI Strategy Advisor' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'aiAdvice' && !aiAdviceText) {
                  fetchAiAdvice();
                }
              }}
              className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#159A80] text-[#142B4A] font-semibold'
                  : 'border-transparent text-[#718096] hover:text-[#142B4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#202B38] text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Highlight Banner */}
              <div className="bg-[#142B4A] text-white border border-[#244C74] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-white/70 block uppercase tracking-wider font-mono">
                    Financial Benefit
                  </span>
                  <span className="text-xl font-bold text-white font-display tabular-nums mt-0.5 block">
                    {scholarship.amountDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-white/70 block uppercase tracking-wider font-mono">
                    Official Portal
                  </span>
                  <span className="text-sm font-semibold text-white/90 mt-0.5 block">
                    {scholarship.portalName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-white/70 block uppercase tracking-wider font-mono">
                    Target Deadline
                  </span>
                  <span className="text-xs font-semibold text-[#159A80] bg-white/10 px-2 py-1 rounded mt-0.5 inline-flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#159A80]" />
                    <span>{scholarship.deadline}</span>
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-2">
                  Scheme Description
                </h4>
                <p className="text-sm text-[#202B38]/85 leading-relaxed">
                  {scholarship.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-2">
                  Important Timeline Notes
                </h4>
                <div className="p-3.5 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-xs text-[#202B38]">
                  <p>{scholarship.importantDatesNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY CONDITIONS */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-3">
                  Official Mandatory Conditions
                </h4>
                <div className="space-y-2.5">
                  {scholarship.eligibilityCriteriaSummary.map((crit, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-[#159A80] mt-0.5 shrink-0" />
                      <span className="text-xs text-[#202B38] leading-relaxed">{crit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Rule Limits Matrix */}
              <div className="border border-[#E5EAE8] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#142B4A] text-white uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Parameter</th>
                      <th className="px-4 py-2.5">Mandatory Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE8]">
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#718096]">Max Family Income</td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-[#142B4A] font-medium">
                        {scholarship.rules.maxIncome
                          ? `₹${scholarship.rules.maxIncome.toLocaleString('en-IN')} / year`
                          : 'No strict ceiling specified'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#718096]">Minimum Qualifying Marks</td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-[#142B4A] font-medium">
                        {scholarship.rules.minPercentage ? `${scholarship.rules.minPercentage}% marks` : 'Pass percentage'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#718096]">Allowed Education Level</td>
                      <td className="px-4 py-2.5 text-[#202B38]">
                        {scholarship.rules.allowedEducationLevels?.join(', ') || 'All levels'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#718096]">Eligible Categories</td>
                      <td className="px-4 py-2.5 text-[#202B38]">
                        {scholarship.rules.allowedCategories?.join(', ') || 'All Categories (General / OBC / SC / ST / EWS)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-[#718096]">State Domicile</td>
                      <td className="px-4 py-2.5 text-[#202B38]">
                        {scholarship.rules.allowedStates?.join(', ') || 'All Indian States & UTs (Pan-India)'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REQUIRED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-2">
                  Mandatory Verification Checklist
                </h4>
                <p className="text-xs text-[#718096] mb-4">
                  Keep high-resolution scanned PDF copies (under 200KB each) of these official certificates ready before starting your portal application.
                </p>

                <div className="space-y-2">
                  {scholarship.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#E5EAE8] rounded-xl">
                      <FileText className="w-4 h-4 text-[#159A80] shrink-0" />
                      <span className="text-xs font-medium text-[#202B38]">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Bank Account Seeding Notice:
                </p>
                <p className="leading-relaxed">
                  Direct Benefit Transfer (DBT) is mandated by the Government of India. The student’s savings bank account MUST be mapped with their Aadhaar in the NPCI central mapper, or funds will bounce.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATION PROCEDURE */}
          {activeTab === 'procedure' && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-2">
                Official Step-by-Step Filing Guide
              </h4>

              <div className="space-y-4">
                {scholarship.applicationProcedure.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-md bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-xs font-semibold text-[#142B4A]">Step {idx + 1}</p>
                      <p className="text-xs text-[#202B38]/80 mt-0.5 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMMON REJECTION REASONS */}
          {activeTab === 'rejections' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono mb-2">
                  Common Reasons for Rejection & How to Avoid Them
                </h4>
                <p className="text-xs text-[#718096] mb-4">
                  Official audit statistics indicate that over 35% of scholarship applications are rejected at the institutional or district verification stage due to avoidable procedural errors.
                </p>

                <div className="space-y-2.5">
                  {scholarship.rejectionReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <span className="text-xs text-rose-950 leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI ADVISOR */}
          {activeTab === 'aiAdvice' && studentProfile && matchResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#159A80]" />
                  <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider font-mono">
                    Personalized Application Strategy
                  </span>
                </div>
                <button
                  onClick={fetchAiAdvice}
                  disabled={isLoadingAdvice}
                  className="text-xs text-[#159A80] hover:text-[#142B4A] font-semibold disabled:opacity-50"
                >
                  {isLoadingAdvice ? 'Generating guidance...' : 'Regenerate Analysis'}
                </button>
              </div>

              {isLoadingAdvice ? (
                <div className="p-8 text-center bg-[#F7F8F5] rounded-xl border border-[#E5EAE8] space-y-3">
                  <Sparkles className="w-6 h-6 text-[#159A80] animate-spin mx-auto" />
                  <p className="text-xs text-[#718096] font-medium">
                    Analyzing profile details and matching criteria against {scholarship.name}...
                  </p>
                </div>
              ) : (
                <div className="bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl p-5 text-xs text-[#202B38] leading-relaxed whitespace-pre-line space-y-2">
                  {aiAdviceText || 'Click Regenerate Analysis to formulate your tailored application plan.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E5EAE8] bg-[#F7F8F5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="px-3 py-2 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#159A80]" /> : <Copy className="w-3.5 h-3.5 text-[#718096]" />}
              <span>{isCopied ? 'Portal Link Copied' : 'Copy Official URL'}</span>
            </button>
            <span className="text-[11px] text-[#718096] font-mono hidden sm:inline">
              {scholarship.portalName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#718096] hover:text-[#142B4A] font-medium"
            >
              Close
            </button>

            <a
              href={scholarship.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
