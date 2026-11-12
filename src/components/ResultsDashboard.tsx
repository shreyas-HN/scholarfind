import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  User,
  ExternalLink,
  Info,
  Calendar,
  IndianRupee,
  SlidersHorizontal,
  Bookmark,
  ShieldCheck
} from 'lucide-react';
import {
  MatchResult,
  StudentProfile,
  Scholarship,
  ProviderType,
  SchemeType,
  MatchStatus,
  ApplicationTrackingStatus,
  ApplicationTrackerItem
} from '../types';
import { ScholarshipCard } from './ScholarshipCard';

interface ResultsDashboardProps {
  studentProfile: StudentProfile;
  matchResults: MatchResult[];
  bookmarkedIds: string[];
  applicationTracker: Record<string, ApplicationTrackerItem>;
  onEditProfile: () => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onToggleBookmark: (scholarshipId: string) => void;
  onUpdateTrackingStatus: (scholarshipId: string, status: ApplicationTrackingStatus) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  studentProfile,
  matchResults,
  bookmarkedIds,
  applicationTracker,
  onEditProfile,
  onOpenDetails,
  onToggleBookmark,
  onUpdateTrackingStatus
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | MatchStatus>('ALL');
  const [selectedProviderType, setSelectedProviderType] = useState<'ALL' | ProviderType>('ALL');
  const [selectedSchemeType, setSelectedSchemeType] = useState<'ALL' | SchemeType>('ALL');
  const [onlyGovernment, setOnlyGovernment] = useState<boolean>(false);
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'amount_desc' | 'amount_asc' | 'deadline_soonest'>('relevance');

  // Metrics
  const eligibleCount = useMemo(
    () => matchResults.filter((m) => m.status === 'ELIGIBLE').length,
    [matchResults]
  );
  const possiblyEligibleCount = useMemo(
    () => matchResults.filter((m) => m.status === 'POSSIBLY_ELIGIBLE').length,
    [matchResults]
  );
  const notEligibleCount = useMemo(
    () => matchResults.filter((m) => m.status === 'NOT_ELIGIBLE').length,
    [matchResults]
  );
  const totalVerifiedAidPotential = useMemo(() => {
    return matchResults
      .filter((m) => m.status === 'ELIGIBLE' || m.status === 'POSSIBLY_ELIGIBLE')
      .reduce((sum, m) => sum + m.scholarship.amountValue, 0);
  }, [matchResults]);

  // Filtered & Sorted List
  const filteredResults = useMemo(() => {
    return matchResults
      .filter((result) => {
        const { scholarship, status } = result;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = scholarship.name.toLowerCase().includes(q);
          const matchProvider = scholarship.provider.toLowerCase().includes(q);
          const matchDesc = scholarship.description.toLowerCase().includes(q);
          if (!matchTitle && !matchProvider && !matchDesc) return false;
        }

        // Status Tab
        if (selectedStatusTab !== 'ALL' && status !== selectedStatusTab) {
          return false;
        }

        // Provider Filter
        if (selectedProviderType !== 'ALL' && scholarship.providerType !== selectedProviderType) {
          return false;
        }

        // Govt / Private toggles
        if (onlyGovernment && !scholarship.providerType.includes('Government')) {
          return false;
        }
        if (onlyPrivate && scholarship.providerType.includes('Government')) {
          return false;
        }

        // Scheme Type Filter
        if (selectedSchemeType !== 'ALL' && scholarship.schemeType !== selectedSchemeType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') {
          return b.scholarship.amountValue - a.scholarship.amountValue;
        }
        if (sortBy === 'amount_asc') {
          return a.scholarship.amountValue - b.scholarship.amountValue;
        }
        if (sortBy === 'deadline_soonest') {
          return new Date(a.scholarship.deadlineDate).getTime() - new Date(b.scholarship.deadlineDate).getTime();
        }
        // Default relevance: ELIGIBLE first, then POSSIBLY, then amount
        const priority: Record<MatchStatus, number> = {
          ELIGIBLE: 1,
          POSSIBLY_ELIGIBLE: 2,
          NOT_ELIGIBLE: 3
        };
        const pDiff = priority[a.status] - priority[b.status];
        if (pDiff !== 0) return pDiff;
        return b.scholarship.amountValue - a.scholarship.amountValue;
      });
  }, [
    matchResults,
    searchQuery,
    selectedStatusTab,
    selectedProviderType,
    selectedSchemeType,
    onlyGovernment,
    onlyPrivate,
    sortBy
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatusTab('ALL');
    setSelectedProviderType('ALL');
    setSelectedSchemeType('ALL');
    setOnlyGovernment(false);
    setOnlyPrivate(false);
    setSortBy('relevance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner: Student Profile Quick Strip & Overview */}
      <div className="bg-white rounded-xl border border-[#E5EAE8] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-[#159A80] bg-[#159A80]/10 px-2.5 py-0.5 rounded-md border border-[#159A80]/20">
              Evaluated Profile
            </span>
            <span className="text-xs text-[#718096]">·</span>
            <span className="text-xs text-[#718096] font-medium">
              {studentProfile.educationLevel} ({studentProfile.course})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A] font-display">
            Personalized Scholarship Matches for {studentProfile.fullName}
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            Category: <strong className="text-[#202B38]">{studentProfile.category}</strong> ·
            Income: <strong className="text-[#202B38] font-mono">₹{studentProfile.annualFamilyIncome.toLocaleString('en-IN')}/yr</strong> ·
            State: <strong className="text-[#202B38]">{studentProfile.state}</strong> ·
            Marks: <strong className="text-[#202B38] font-mono">{studentProfile.prevExamPercentage}%</strong>
          </p>
        </div>

        <button
          onClick={onEditProfile}
          className="px-4 py-2 text-xs font-semibold text-[#142B4A] bg-[#F7F8F5] hover:bg-slate-100 border border-[#E5EAE8] rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          <span>Edit Profile & Recalculate</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matched */}
        <div className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#718096] block">Total Schemes Evaluated</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#142B4A] font-display mt-1 tabular-nums">
            {matchResults.length}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">Full database cross-checked</p>
        </div>

        {/* Fully Eligible */}
        <div className="bg-white rounded-xl border border-[#159A80]/30 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#159A80] block">Fully Eligible</span>
            <CheckCircle2 className="w-4 h-4 text-[#159A80]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#159A80] font-display mt-1 tabular-nums">
            {eligibleCount}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">Satisfies all verified conditions</p>
        </div>

        {/* Needs Verification */}
        <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 block">Needs Verification</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-display mt-1 tabular-nums">
            {possiblyEligibleCount}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">Pending document verification</p>
        </div>

        {/* Potential Aid Value */}
        <div className="bg-white rounded-xl border border-[#244C74]/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#142B4A] block">Eligible Grant Potential</span>
            <IndianRupee className="w-4 h-4 text-[#159A80]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#142B4A] font-display mt-1 tabular-nums font-mono">
            ₹{totalVerifiedAidPotential.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">Calculated per annum aid</p>
        </div>
      </div>

      {/* Interactive Filters & Controls Bar */}
      <div className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs space-y-4">
        {/* Row 1: Search + Status Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship title, ministry, or keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs (Segmented interactive buttons) */}
          <div className="flex items-center gap-1 p-1 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl overflow-x-auto">
            <button
              onClick={() => setSelectedStatusTab('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatusTab === 'ALL'
                  ? 'bg-[#142B4A] text-white shadow-xs font-semibold'
                  : 'text-[#718096] hover:text-[#142B4A]'
              }`}
            >
              All ({matchResults.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('ELIGIBLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedStatusTab === 'ELIGIBLE'
                  ? 'bg-[#159A80] text-white shadow-xs font-semibold'
                  : 'text-[#159A80] hover:text-[#12826C]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Eligible ({eligibleCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('POSSIBLY_ELIGIBLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedStatusTab === 'POSSIBLY_ELIGIBLE'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Needs Verification ({possiblyEligibleCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('NOT_ELIGIBLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedStatusTab === 'NOT_ELIGIBLE'
                  ? 'bg-[#244C74] text-white shadow-xs font-semibold'
                  : 'text-[#718096] hover:text-[#142B4A]'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Not Eligible ({notEligibleCount})
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5EAE8] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Provider Filter */}
            <select
              value={selectedProviderType}
              onChange={(e) => setSelectedProviderType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] font-medium"
            >
              <option value="ALL">All Providers</option>
              <option value="Central Government">Central Government</option>
              <option value="State Government">State Government</option>
              <option value="Private">Private / Corporate</option>
              <option value="Trust/Foundation">Trust & Foundations</option>
            </select>

            {/* Scheme Type */}
            <select
              value={selectedSchemeType}
              onChange={(e) => setSelectedSchemeType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] font-medium"
            >
              <option value="ALL">All Scheme Types</option>
              <option value="Merit-based">Merit-based</option>
              <option value="Need-based">Need-based</option>
              <option value="Category-based">Category-based</option>
              <option value="Gender-specific">Gender-specific</option>
              <option value="Disability-specific">Disability-specific</option>
            </select>

            {/* Quick Toggle: Govt Schemes Only */}
            <button
              onClick={() => {
                setOnlyGovernment(!onlyGovernment);
                if (!onlyGovernment) setOnlyPrivate(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                onlyGovernment
                  ? 'bg-[#159A80]/10 border-[#159A80] text-[#159A80]'
                  : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
              }`}
            >
              Government Only
            </button>

            {/* Quick Toggle: Private Only */}
            <button
              onClick={() => {
                setOnlyPrivate(!onlyPrivate);
                if (!onlyPrivate) setOnlyGovernment(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                onlyPrivate
                  ? 'bg-[#159A80]/10 border-[#159A80] text-[#159A80]'
                  : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
              }`}
            >
              Private Foundations Only
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-[#718096] flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] font-medium"
            >
              <option value="relevance">Best Match (Relevance)</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="deadline_soonest">Application Deadline Soonest</option>
            </select>

            {(searchQuery || selectedStatusTab !== 'ALL' || selectedProviderType !== 'ALL' || selectedSchemeType !== 'ALL' || onlyGovernment || onlyPrivate) && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs text-[#718096] hover:text-[#142B4A] transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#718096]">
        <span>
          Showing <strong>{filteredResults.length}</strong> of {matchResults.length} scholarships
        </span>
        <span className="text-[11px] font-mono">
          Last verified: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Scholarship Cards Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResults.map((result) => (
            <ScholarshipCard
              key={result.scholarship.id}
              matchResult={result}
              studentProfile={studentProfile}
              isBookmarked={bookmarkedIds.includes(result.scholarship.id)}
              trackingStatus={applicationTracker[result.scholarship.id]?.status}
              onToggleBookmark={onToggleBookmark}
              onOpenDetails={onOpenDetails}
              onUpdateTrackingStatus={onUpdateTrackingStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5EAE8] p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#F7F8F5] border border-[#E5EAE8] flex items-center justify-center mx-auto mb-4 text-[#718096]">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#142B4A] font-display mb-1">
            No Scholarships Match These Filters
          </h3>
          <p className="text-xs text-[#718096] mb-5 leading-relaxed">
            Try adjusting your search criteria or reset filters to view all matched government and private schemes.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
