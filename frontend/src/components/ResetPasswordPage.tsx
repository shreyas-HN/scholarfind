import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface ResetPasswordPageProps {
  tokenFromUrl?: string;
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  tokenFromUrl,
  onNavigateToLogin,
  onNavigateHome
}) => {
  const [token, setToken] = useState<string>(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Extract token from URL query params if not provided via props
  useEffect(() => {
    if (!token) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token');
      if (urlToken) {
        setToken(urlToken.trim());
      }
    }
  }, [token]);

  // Password Strength Validations
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasLetter && hasNumberOrSymbol && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      setErrorMessage('Missing password reset token. Please request a new link from the login page.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.resetPassword(token.trim(), newPassword);
      setSuccessMessage(res.message || 'Password reset successfully! You can now log in with your new password.');
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The link may have expired or already been used.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-[#F7F8F5]">
      <div className="max-w-md w-full space-y-6">
        {/* Back navigation */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#718096] hover:text-[#142B4A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#142B4A] text-[#159A80] border border-[#244C74] shadow-sm mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#142B4A] tracking-tight">
            Reset Account Password
          </h1>
          <p className="text-xs text-[#718096] max-w-sm mx-auto leading-relaxed">
            Create a secure new password for your ScholarFind student account.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#E5EAE8] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#159A80] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#142B4A] font-display">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-[#718096] max-w-xs mx-auto leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-3 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Token Missing Warning */}
              {!token && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="font-semibold">Reset token missing from URL</p>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Please use the link sent to your registered email address or enter the reset token manually below.
                  </p>
                  <div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.trim())}
                      placeholder="Paste reset token here"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-[#202B38]"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* New Password */}
                <div>
                  <label className="block font-semibold text-[#142B4A] uppercase tracking-wider mb-1 text-[11px]">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-sm text-[#202B38] placeholder-[#718096]/60 focus:outline-none focus:border-[#159A80] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#142B4A] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block font-semibold text-[#142B4A] uppercase tracking-wider mb-1 text-[11px]">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-sm text-[#202B38] placeholder-[#718096]/60 focus:outline-none focus:border-[#159A80] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#142B4A] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Password Requirements Checklist */}
                <div className="p-3 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl space-y-1.5 text-[11px]">
                  <p className="font-semibold text-[#142B4A] uppercase tracking-wider text-[10px] mb-1">
                    Password Requirements:
                  </p>
                  <div className="flex items-center gap-2">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-[#718096]'}>
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasLetter ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={hasLetter ? 'text-emerald-700 font-medium' : 'text-[#718096]'}>
                      Contains letter (a-z, A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasNumberOrSymbol ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={hasNumberOrSymbol ? 'text-emerald-700 font-medium' : 'text-[#718096]'}>
                      Contains number or special character
                    </span>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5EAE8]">
                      {passwordsMatch ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600'}>
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid || !token}
                  className="w-full py-3 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Updating password securely...</span>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-[#E5EAE8] text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs font-semibold text-[#159A80] hover:text-[#142B4A] cursor-pointer"
                >
                  Remember your password? Sign In instead
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
