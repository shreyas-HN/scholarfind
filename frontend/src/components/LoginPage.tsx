import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';
import { AuthUser } from '../types';
import { apiClient } from '../services/apiClient';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onCancel: () => void;
  initialMode?: 'signin' | 'signup';
  initialNotice?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  initialMode = 'signin',
  initialNotice = ''
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>(initialNotice);

  // Form states
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (mode === 'signin') {
      if (!identifier.trim()) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await apiClient.login(identifier.trim(), password);
        setSuccessNotice('Login successful! Redirecting to student portal...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 300);
      } catch (err: any) {
        setErrorMessage(err.message || 'Invalid email or password.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!identifier.trim() || !identifier.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await apiClient.register(name.trim(), identifier.trim(), password);
        setSuccessNotice('Registration successful! Setting up your student account...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 400);
      } catch (err: any) {
        setErrorMessage(err.message || 'Account registration failed.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetDevLink, setResetDevLink] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setResetDevLink(null);

    const emailToReset = identifier.trim();
    if (!emailToReset || !emailToReset.includes('@')) {
      setErrorMessage('Please enter your registered email address in the Email field above, then click Forgot Password.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiClient.forgotPassword(emailToReset);
      let notice = res.message || 'If an account exists with this email, a password reset link has been sent.';
      if (res.emailSent) {
        notice += ' Please check your email inbox (valid for 20 minutes).';
      } else if (res.configInstructions) {
        notice += ` Note: ${res.configInstructions}`;
      }
      setSuccessNotice(notice);
      if (res.resetLink) {
        setResetDevLink(res.resetLink);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-[#F7F8F5]">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#718096] hover:text-[#142B4A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#142B4A] text-[#159A80] border border-[#244C74] shadow-sm mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#142B4A] tracking-tight">
            {mode === 'signin' ? 'Welcome Back, Student' : 'Create Student Account'}
          </h1>
          <p className="text-xs text-[#718096] max-w-sm mx-auto leading-relaxed">
            {mode === 'signin'
              ? 'Sign in to access your matched scholarships, saved applications, and verification checklist.'
              : 'Register your student profile to discover all eligible government & private scholarships.'}
          </p>
        </div>

        {/* Main Box */}
        <div className="bg-white rounded-2xl border border-[#E5EAE8] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#142B4A] shadow-xs border border-[#E5EAE8]'
                  : 'text-[#718096] hover:text-[#142B4A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#142B4A] shadow-xs border border-[#E5EAE8]'
                  : 'text-[#718096] hover:text-[#142B4A]'
              }`}
            >
              Register New
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success / Status Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A80] shrink-0" />
                <span>{successNotice}</span>
              </div>
              {resetDevLink && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#718096]">Reset Link:</span>
                  <a
                    href={resetDevLink}
                    className="font-semibold text-[#159A80] hover:underline"
                  >
                    Open Password Reset Page →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-[#142B4A] uppercase tracking-wider mb-1 text-[11px]">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your official student name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-sm text-[#202B38] placeholder-[#718096]/60 focus:outline-none focus:border-[#159A80] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#142B4A] uppercase tracking-wider mb-1 text-[11px]">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F8F5] border border-[#E5EAE8] rounded-xl text-sm text-[#202B38] placeholder-[#718096]/60 focus:outline-none focus:border-[#159A80] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#142B4A] uppercase tracking-wider text-[11px]">
                  Password *
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-[11px] font-medium text-[#159A80] hover:text-[#142B4A] cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Sending Reset Link...' : 'Forgot Password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Min 6 characters'}
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
              {mode === 'signup' && (
                <p className="text-[10px] text-[#718096] mt-1">
                  Password will be hashed using Argon2id. Never stored in plaintext.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[#718096]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E5EAE8] text-[#159A80] focus:ring-[#159A80]"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-[#718096] font-mono">100% Free Service</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying credentials with database...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Portal' : 'Register Student Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#E5EAE8] text-center">
            <p className="text-[11px] text-[#718096]">
              Protected under Digital India Data Guidelines. Passwords encrypted using Argon2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
