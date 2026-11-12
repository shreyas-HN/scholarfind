import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bookmark,
  Calendar,
  IndianRupee,
  FileText,
  ShieldCheck,
  Building,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { MatchResult, Scholarship, StudentProfile, ApplicationTrackingStatus } from '../types';

interface ScholarshipCardProps {
  matchResult: MatchResult;
  studentProfile: StudentProfile | null;
  isBookmarked: boolean;
  trackingStatus?: ApplicationTrackingStatus;
  onToggleBookmark: (scholarshipId: string) => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onUpdateTrackingStatus: (scholarshipId: string, status: ApplicationTrackingStatus) => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  matchResult,
  studentProfile,
  isBookmarked,
  trackingStatus = 'Not Applied',
  onToggleBookmark,
  onOpenDetails,
  onUpdateTrackingStatus
}) => {
  const { scholarship, status, matchedReasons, missingOrPendingVerifications, exclusionReasons } = matchResult;

  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);
  const [isDocsExpanded, setIsDocsExpanded] = useState<boolean>(false);

  // Status Badge Rendering
  const renderStatusBadge = () => {
    switch (status) {
      case 'ELIGIBLE':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#159A80]/10 text-[#159A80] border border-[#159A80]/25 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
            <span>Eligible</span>
          </div>
        );
      case 'POSSIBLY_ELIGIBLE':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Possibly Eligible</span>
          </div>
        );
      case 'NOT_ELIGIBLE':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-[#E5EAE8] text-xs font-medium">
            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Not Eligible</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm ${
        status === 'ELIGIBLE'
          ? 'border-[#159A80]/30 hover:border-[#159A80]/60'
          : status === 'POSSIBLY_ELIGIBLE'
          ? 'border-amber-200/80 hover:border-amber-300'
          : 'border-[#E5EAE8] opacity-90'
      }`}
    >
      <div className="p-6">
        {/* Top Header: Badge + Provider + Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge()}
            <span className="text-xs text-[#718096] font-medium">
              {scholarship.providerType}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-[#718096] font-medium">
              {scholarship.schemeType}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleBookmark(scholarship.id)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Scholarship'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-[#E5EAE8] text-slate-400 hover:text-[#142B4A] hover:bg-[#F7F8F5]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scholarship Name */}
        <h3
          onClick={() => onOpenDetails(scholarship)}
          className="text-lg font-bold text-[#142B4A] font-display hover:text-[#159A80] cursor-pointer transition-colors mb-1.5 leading-snug"
        >
          {scholarship.name}
        </h3>

        {/* Provider */}
        <div className="flex items-center gap-1.5 text-xs text-[#718096] mb-4">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{scholarship.provider}</span>
        </div>

        {/* Financial & Deadline Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F8F5] rounded-lg border border-[#E5EAE8] mb-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#718096] tracking-wider block">
              Grant Amount
            </span>
            <span className="text-sm font-bold text-[#159A80] font-mono tabular-nums block">
              {scholarship.amountDisplay}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#718096] tracking-wider block">
              Deadline
            </span>
            <div className="flex items-center gap-1 text-xs text-[#202B38] font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{scholarship.deadline}</span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed mb-4">
          {scholarship.description}
        </p>

        {/* Transparent Rule Explanation Accordion */}
        <div className="space-y-2 pt-2 border-t border-[#E5EAE8]">
          {studentProfile && (
            <div className="text-xs">
              <button
                type="button"
                onClick={() => setIsWhyExpanded(!isWhyExpanded)}
                className="w-full flex items-center justify-between py-1 text-xs font-semibold text-[#142B4A] hover:text-[#159A80] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#159A80]" />
                  Why am I {status === 'ELIGIBLE' ? 'Eligible' : status === 'POSSIBLY_ELIGIBLE' ? 'Possibly Eligible' : 'Not Eligible'}?
                </span>
                {isWhyExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {isWhyExpanded && (
                <div className="mt-2 p-3 bg-[#F7F8F5] rounded-lg border border-[#E5EAE8] space-y-2 text-xs">
                  {matchedReasons.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-[#159A80] uppercase tracking-wider mb-1">
                        Satisfied Criteria:
                      </p>
                      <ul className="space-y-1 text-slate-700">
                        {matchedReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missingOrPendingVerifications.length > 0 && (
                    <div className="pt-2 border-t border-[#E5EAE8]">
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                        Verification Required:
                      </p>
                      <ul className="space-y-1 text-slate-700">
                        {missingOrPendingVerifications.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exclusionReasons.length > 0 && (
                    <div className="pt-2 border-t border-[#E5EAE8]">
                      <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">
                        Ineligibility Factors:
                      </p>
                      <ul className="space-y-1 text-slate-700">
                        {exclusionReasons.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Required Documents Toggle */}
          <div className="text-xs">
            <button
              type="button"
              onClick={() => setIsDocsExpanded(!isDocsExpanded)}
              className="w-full flex items-center justify-between py-1 text-xs font-semibold text-[#142B4A] hover:text-[#159A80] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                What documents do I need? ({scholarship.requiredDocuments.length})
              </span>
              {isDocsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {isDocsExpanded && (
              <div className="mt-2 p-3 bg-[#F7F8F5] rounded-lg border border-[#E5EAE8]">
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {scholarship.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A80]" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Tracking & Actions */}
      <div className="p-4 bg-[#F7F8F5] border-t border-[#E5EAE8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tracking Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-medium text-[#718096]">
            Status:
          </label>
          <select
            value={trackingStatus}
            onChange={(e) => onUpdateTrackingStatus(scholarship.id, e.target.value as ApplicationTrackingStatus)}
            className="text-xs bg-white border border-[#E5EAE8] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38]"
          >
            <option value="Not Applied">Not Applied</option>
            <option value="Interested">Shortlisted</option>
            <option value="Applied">Applied on Portal</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onOpenDetails(scholarship)}
            className="px-3 py-1.5 text-xs font-semibold text-[#142B4A] hover:bg-white border border-[#E5EAE8] rounded-lg transition-colors cursor-pointer"
          >
            Details
          </button>

          <a
            href={scholarship.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
