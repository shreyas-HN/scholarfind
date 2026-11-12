import React, { useState, useMemo } from 'react';
import {
  Search,
  Building,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  Bookmark
} from 'lucide-react';
import { Scholarship, ProviderType, SchemeType } from '../types';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';

interface ExploreScholarshipsProps {
  onSelectScholarship: (scholarship: Scholarship) => void;
  onMatchProfile: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (scholarshipId: string) => void;
}

export const ExploreScholarships: React.FC<ExploreScholarshipsProps> = ({
  onSelectScholarship,
  onMatchProfile,
  bookmarkedIds,
  onToggleBookmark
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'ALL' | ProviderType>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<'ALL' | SchemeType>('ALL');

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATABASE.filter((sch) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = sch.name.toLowerCase().includes(q);
        const matchProvider = sch.provider.toLowerCase().includes(q);
        const matchDesc = sch.description.toLowerCase().includes(q);
        if (!matchTitle && !matchProvider && !matchDesc) return false;
      }

      if (selectedProvider !== 'ALL' && sch.providerType !== selectedProvider) {
        return false;
      }

      if (selectedScheme !== 'ALL' && sch.schemeType !== selectedScheme) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedProvider, selectedScheme]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#142B4A] rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border border-[#244C74]">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold text-[#159A80] uppercase tracking-wider font-mono">
            Official Indian Schemes Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Explore All Government & Trust Scholarships
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse through verified central ministries, state welfare departments, and corporate philanthropy schemes. Run deterministic matching against your profile to verify requirements.
          </p>
        </div>

        <button
          onClick={onMatchProfile}
          className="px-5 py-3 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Match Against My Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, ministry, or degree..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] font-medium"
            >
              <option value="ALL">All Providers</option>
              <option value="Central Government">Central Government</option>
              <option value="State Government">State Government</option>
              <option value="Private">Private Companies</option>
              <option value="Trust/Foundation">Trusts & Foundations</option>
            </select>

            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#E5EAE8] rounded-lg text-[#202B38] font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Merit-based">Merit-based</option>
              <option value="Need-based">Need-based</option>
              <option value="Category-based">Category-based</option>
              <option value="Gender-specific">Gender-specific</option>
              <option value="Disability-specific">Disability-specific</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Scholarships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredScholarships.map((sch) => {
          const isBookmarked = bookmarkedIds.includes(sch.id);
          return (
            <div
              key={sch.id}
              className="bg-white rounded-xl border border-[#E5EAE8] p-6 shadow-xs hover:border-[#159A80]/60 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F7F8F5] text-[#142B4A] border border-[#E5EAE8]">
                      {sch.providerType}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-[#718096]">{sch.schemeType}</span>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(sch.id)}
                    className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Scheme'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <h3
                  onClick={() => onSelectScholarship(sch)}
                  className="text-lg font-bold text-[#142B4A] font-display group-hover:text-[#159A80] cursor-pointer mb-1 leading-snug transition-colors"
                >
                  {sch.name}
                </h3>
                <p className="text-xs text-[#718096] mb-3">{sch.provider}</p>

                <div className="flex items-center gap-3 text-xs text-[#202B38] mb-4 bg-[#F7F8F5] p-2.5 rounded-lg border border-[#E5EAE8]">
                  <span className="font-bold text-[#159A80] text-sm tabular-nums font-mono">
                    {sch.amountDisplay}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-[#718096]">Deadline: {sch.deadline}</span>
                </div>

                <p className="text-xs text-[#718096] line-clamp-3 leading-relaxed mb-4">
                  {sch.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5EAE8] flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectScholarship(sch)}
                  className="text-[#159A80] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={sch.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 font-semibold text-[#142B4A] bg-[#F7F8F5] hover:bg-slate-100 border border-[#E5EAE8] rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{sch.portalName.split(' ')[0]}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
