import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Building2,
  ChevronRight,
  BookOpen,
  Award,
  Landmark,
  LogIn
} from 'lucide-react';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';
import { Scholarship, AuthUser } from '../types';

interface LandingPageProps {
  authUser?: AuthUser | null;
  onLogin?: () => void;
  onViewMatchedScholarships?: () => void;
  onCheckEligibility?: () => void;
  onExplore: () => void;
  onSelectScholarship: (scholarship: Scholarship) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  authUser,
  onLogin,
  onViewMatchedScholarships,
  onCheckEligibility,
  onExplore,
  onSelectScholarship
}) => {
  const featuredScholarships = SCHOLARSHIPS_DATABASE.slice(0, 4);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 lg:pt-20 lg:pb-16 bg-[#F7F8F5] border-b border-[#E5EAE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#159A80] bg-[#159A80]/10 border border-[#159A80]/20 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-[#159A80]" />
                <span>Deterministic Rule Matching · 100% Free for Indian Students</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#142B4A] font-display leading-[1.12]">
                Find Scholarships <span className="text-[#159A80]">You Deserve.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#718096] leading-relaxed max-w-2xl">
                One profile. Multiple opportunities. Discover scholarships that match your eligibility.
              </p>

              <div className="flex flex-col items-stretch sm:items-start gap-3 pt-2 w-full sm:w-fit">
                {authUser ? (
                  <button
                    onClick={onViewMatchedScholarships || onCheckEligibility}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>View My Matched Scholarships</span>
                  </button>
                ) : (
                  <button
                    onClick={onLogin}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-white" />
                    <span>Log In to Find Scholarships</span>
                  </button>
                )}

                <button
                  onClick={onExplore}
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-[#142B4A] bg-white hover:bg-slate-50 border border-[#E5EAE8] hover:border-[#142B4A]/30 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#718096]" />
                  <span>Explore Scholarships</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-[#E5EAE8] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#142B4A] block text-sm tabular-nums">16+ Verified</span>
                  <span className="text-[#718096]">Central & State Portals</span>
                </div>
                <div>
                  <span className="font-bold text-[#142B4A] block text-sm tabular-nums">Zero Fabrication</span>
                  <span className="text-[#718096]">Official Gazette Criteria</span>
                </div>
                <div>
                  <span className="font-bold text-[#142B4A] block text-sm tabular-nums">Direct Link</span>
                  <span className="text-[#718096]">Apply on Official Sites</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#E5EAE8] bg-white aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3]">
                <img
                  src="/images/hero_indian_students_1793626287446.jpg"
                  alt="Indian college students studying on campus"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B4A]/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300 font-mono">
                      Higher Education In India
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 mt-0.5">
                      Over ₹2,500 Crores in central and state educational grants go unawarded annually due to discovery gaps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#159A80] uppercase tracking-wider font-mono block mb-1">
            Verification Protocol
          </span>
          <h2 className="text-3xl font-bold text-[#142B4A] font-display">
            How ScholarFind Works in 3 Steps
          </h2>
          <p className="text-[#718096] text-sm mt-2">
            No confusion or duplicate applications. Discover all central, state, and institutional scholarships you qualify for in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl border border-[#E5EAE8] p-7 shadow-xs hover:border-[#159A80]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold text-sm mb-5 font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2 font-display">
              Build Your Profile Once
            </h3>
            <p className="text-xs text-[#718096] leading-relaxed mb-4">
              Enter your personal, educational, category (SC/ST/OBC/EWS/Gen), and family financial data into our streamlined 5-step form.
            </p>
            <ul className="text-xs text-[#718096] space-y-2 border-t border-[#E5EAE8] pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>Takes less than 3 minutes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>Strictly private · Encrypted in browser & SQLite</span>
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl border border-[#E5EAE8] p-7 shadow-xs hover:border-[#159A80]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#244C74] text-white flex items-center justify-center font-bold text-sm mb-5 font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2 font-display">
              Deterministic Matching
            </h3>
            <p className="text-xs text-[#718096] leading-relaxed mb-4">
              Our rule engine cross-checks your credentials against official Gazette limits, percentile cut-offs, state domiciles, and income slabs.
            </p>
            <ul className="text-xs text-[#718096] space-y-2 border-t border-[#E5EAE8] pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>Classified as Eligible or Needs Verification</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>Transparent "Why am I eligible?" explanations</span>
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl border border-[#E5EAE8] p-7 shadow-xs hover:border-[#159A80]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#159A80] text-white flex items-center justify-center font-bold text-sm mb-5 font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-[#142B4A] mb-2 font-display">
              Official Portal Application
            </h3>
            <p className="text-xs text-[#718096] leading-relaxed mb-4">
              Receive the exact checklist of required documents and click directly to official government portals (NSP, SSP, AICTE) to submit.
            </p>
            <ul className="text-xs text-[#718096] space-y-2 border-t border-[#E5EAE8] pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>100% genuine verified government portal links</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80] shrink-0" />
                <span>Track applied status on your student portal</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SCHOLARSHIPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#159A80] uppercase tracking-wider font-mono block mb-1">
              Top Schemes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#142B4A] font-display">
              Featured Indian Scholarships
            </h2>
          </div>
          <button
            onClick={onExplore}
            className="text-xs font-semibold text-[#159A80] hover:text-[#12826C] flex items-center gap-1 group cursor-pointer"
          >
            <span>View all {SCHOLARSHIPS_DATABASE.length} verified schemes</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredScholarships.map((sch) => (
            <div
              key={sch.id}
              onClick={() => onSelectScholarship(sch)}
              className="bg-white rounded-xl border border-[#E5EAE8] p-6 shadow-xs hover:border-[#159A80]/60 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <h3 className="text-base font-bold text-[#142B4A] font-display group-hover:text-[#159A80] transition-colors leading-snug">
                    {sch.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#F7F8F5] text-[#142B4A] border border-[#E5EAE8] shrink-0">
                    {sch.providerType}
                  </span>
                </div>

                <p className="text-xs text-[#718096] mb-3">{sch.provider}</p>

                <div className="flex items-center gap-2 text-xs text-[#718096] mb-3.5">
                  <span className="font-bold text-[#159A80] tabular-nums text-sm">
                    {sch.amountDisplay}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-[#718096]">Deadline: {sch.deadline}</span>
                </div>

                <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed mb-4">
                  {sch.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5EAE8] flex items-center justify-between text-xs">
                <span className="text-[#159A80] font-semibold flex items-center gap-1 group-hover:underline">
                  View full criteria & procedures
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[#718096] font-mono text-[11px]">
                  {sch.portalName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. STUDENT SUCCESS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142B4A] rounded-2xl overflow-hidden text-white shadow-sm border border-[#244C74]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px]">
              <img
                src="images/scholarship_success_indian_1793626288221.jpg"
                alt="Smiling student holding acceptance letter"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#142B4A]/90 via-transparent to-transparent" />
            </div>

            <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
              <span className="text-[11px] font-bold text-[#159A80] uppercase tracking-widest font-mono">
                Student Testimonial
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                "ScholarFind verified my eligibility for ₹50,000/yr under AICTE Pragati."
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                "I was about to take a high-interest private loan for my second year of Engineering. ScholarFind matched my academic percentage, income bracket, and AICTE institution status instantly and provided the exact document checklist for the National Scholarship Portal."
              </p>
              <div className="pt-2 text-xs">
                <p className="font-semibold text-white">Engineering Scholar · B.Tech Student</p>
                <p className="text-slate-400">State University · Awarded Technical Education Grant</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onCheckEligibility || onExplore}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Check Your Eligibility Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
