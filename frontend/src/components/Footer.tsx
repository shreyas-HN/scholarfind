import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onOpenDisclaimer?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDisclaimer, onOpenPrivacy }) => {
  return (
    <footer className="bg-[#142B4A] text-slate-300 border-t border-[#244C74] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#244C74] border border-[#159A80]/30 flex items-center justify-center text-[#159A80]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Scholar<span className="text-[#159A80]">Find</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300/80 mb-4">
              Empowering students across India with an intelligent, 100% deterministic rule-based scholarship discovery platform. Connecting students with verified government and philanthropic opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#159A80]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-slate-300">Verified Portals Only · No Intermediary Fees</span>
            </div>
          </div>

          {/* Col 2: Official Indian Portals */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">
              Official Indian Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  National Scholarship Portal (NSP)
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://ssp.postmatric.karnataka.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  State Scholarship Portal (SSP Karnataka)
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  AICTE Pragati & Saksham
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://online-inspire.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  DST INSPIRE SHE Portal
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://ongcscholar.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  ONGC Foundation Portal
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Essential Help & Guides */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">
              Student Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-300/80">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Aadhaar NPCI Bank Account Seeding Guide</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Revenue Income Certificate Validity Rules</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Caste Certificate RD Number Verification</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Bonafide Certificate Formats & Attestation</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">Preventing Common Application Rejections</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Transparency */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">
              Transparency & Contact
            </h4>
            <p className="text-xs text-slate-300/80 mb-3 leading-relaxed">
              ScholarFind is a free informational matching tool for students. We never solicit passwords, OTPs, or payments.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#159A80]" />
                <span>support@scholarfind.gov.in.assist</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#159A80]" />
                <span>NSP Helpline: 0120-6619540</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#244C74] text-[11px] text-slate-400">
              <p>Disclaimers: Scheme criteria and guidelines are sourced from official publications and Gazette notifications.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#244C74] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 ScholarFind. Built with dedication for higher education access across India.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenDisclaimer}
              className="hover:text-white transition-colors"
            >
              Government Portal Disclaimer
            </button>
            <span className="text-[#159A80] font-mono">v2.4 Production Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
