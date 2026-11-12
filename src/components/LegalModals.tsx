import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'disclaimer' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#142B4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E5EAE8] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#159A80]" />
            <h3 className="text-lg font-bold text-[#142B4A] font-display">
              {type === 'disclaimer' ? 'Official Government Portal Disclaimer' : 'Privacy & Data Protection Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#718096] hover:text-[#142B4A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#202B38] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          {type === 'disclaimer' ? (
            <>
              <p>
                <strong>1. Informational Service Only:</strong> ScholarFind ("The Platform") is an independent discovery and matching engine developed exclusively for informational and educational guidance purposes.
              </p>
              <p>
                <strong>2. No Government Affiliation:</strong> ScholarFind is not operated by, affiliated with, endorsed by, or authorized by the National Scholarship Portal (NSP), Ministry of Education, State Government of Karnataka, or any other central or state governmental authority.
              </p>
              <p>
                <strong>3. No Disbursement or Intermediary Fees:</strong> We do NOT collect application processing fees, provide loan guarantees, or disburse funds. All scholarship funds are processed exclusively by respective government ministries through Direct Benefit Transfer (DBT) directly into beneficiary bank accounts.
              </p>
              <p>
                <strong>4. Official Verification:</strong> While every effort is made to maintain verified guidelines from official gazettes and notifications, students are advised to confirm specific dates and criteria on official portals (e.g., scholarships.gov.in, ssp.postmatric.karnataka.gov.in) before submitting final documentation.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Localized Profile Storage:</strong> Your student profile, academic marks, and financial estimates are stored locally in your web browser session and local storage. ScholarFind never sells, trades, or commercializes your personal records.
              </p>
              <p>
                <strong>2. No Sensitive Banking Data:</strong> ScholarFind does not request, store, or process bank account numbers, passwords, UPI pins, or Aadhaar biometric tokens.
              </p>
              <p>
                <strong>3. Deterministic Matching:</strong> All eligibility calculations are executed on your device using verified rule-based algorithms.
              </p>
              <p>
                <strong>4. Student Control:</strong> You can edit or purge your profile records at any time by clearing your browser cache or clicking "Update Details".
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-[#E5EAE8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#159A80] rounded-lg hover:bg-[#12836d] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
