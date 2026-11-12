/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentProfile,
  Scholarship,
  MatchResult,
  ApplicationTrackerItem,
  ApplicationTrackingStatus,
  AuthUser
} from './types';
import { Lock, User } from 'lucide-react';
import { SCHOLARSHIPS_DATABASE } from './data/scholarships';
import { matchAllScholarships, evaluateScholarship } from './services/matchingEngine';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredTracker,
  saveTrackerItem,
  getStoredBookmarks,
  toggleStoredBookmark,
  clearAllAuthSession
} from './services/storageService';
import { apiClient } from './services/apiClient';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentForm } from './components/StudentForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ExploreScholarships } from './components/ExploreScholarships';
import { ScholarshipDetailsModal } from './components/ScholarshipDetailsModal';
import { LoginPage } from './components/LoginPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModals';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'form' | 'results' | 'dashboard' | 'explore' | 'login' | 'reset-password'>('landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [applicationTracker, setApplicationTracker] = useState<Record<string, ApplicationTrackerItem>>({});
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [legalModalType, setLegalModalType] = useState<'disclaimer' | 'privacy' | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [loginNotice, setLoginNotice] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [resetPasswordToken, setResetPasswordToken] = useState<string>('');

  // Authenticate with real FastAPI backend on page load & refresh
  useEffect(() => {
    let isMounted = true;

    // Detect /reset-password?token=... in browser address bar
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    const isResetView = pathname.includes('/reset-password') || searchParams.get('view') === 'reset-password' || Boolean(urlToken);

    if (isResetView) {
      if (urlToken) {
        setResetPasswordToken(urlToken.trim());
      }
      setCurrentView('reset-password');
    }

    // Verify session with backend /auth/me (never rely solely on localStorage)
    apiClient.getMe().then((verifiedUser) => {
      if (!isMounted) return;
      if (verifiedUser) {
        setAuthUser(verifiedUser);
        const saved = getStoredProfile();
        if (saved && saved.fullName && saved.fullName.trim() !== '') {
          setStudentProfile(saved);
          apiClient.matchScholarships(saved).then((res) => {
            if (isMounted) {
              if (res && res.length > 0) {
                setMatchResults(res);
              } else {
                setMatchResults(matchAllScholarships(saved, SCHOLARSHIPS_DATABASE));
              }
            }
          });
        } else {
          setStudentProfile(null);
        }
      } else {
        setAuthUser(null);
        setStudentProfile(null);
      }
      setIsAuthChecking(false);
    }).catch(() => {
      if (isMounted) {
        setAuthUser(null);
        setStudentProfile(null);
        setIsAuthChecking(false);
      }
    });

    setBookmarkedIds(getStoredBookmarks());
    setApplicationTracker(getStoredTracker());

    apiClient.checkHealth().then((healthy) => {
      if (isMounted) setIsBackendHealthy(healthy);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected scholarship's match result (if student has profile)
  const selectedMatchResult: MatchResult | undefined = useMemo(() => {
    if (!selectedScholarship || !studentProfile) return undefined;
    const fromList = matchResults.find((m) => m.scholarship.id === selectedScholarship.id);
    if (fromList) return fromList;
    return evaluateScholarship(studentProfile, selectedScholarship);
  }, [selectedScholarship, studentProfile, matchResults]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setLoginNotice('');
    const saved = getStoredProfile();
    if (saved && saved.fullName && saved.fullName.trim() !== '') {
      setStudentProfile(saved);
      setCurrentView('dashboard');
    } else {
      setStudentProfile(null);
      setCurrentView('form');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      console.warn('Logout network notice:', e);
    } finally {
      clearAllAuthSession();
      setAuthUser(null);
      setStudentProfile(null);
      setMatchResults([]);
      setLoginNotice('');
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route protection navigation helper
  const handleProtectedNavigate = (targetView: 'dashboard' | 'form' | 'results' | 'landing' | 'explore' | 'login' | 'reset-password') => {
    if ((targetView === 'dashboard' || targetView === 'form' || targetView === 'results') && !authUser) {
      const notice = targetView === 'dashboard'
        ? 'Please log in to access your Student Portal.'
        : 'Please log in or register to access the Eligibility Matcher.';
      setLoginNotice(notice);
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Profile and Match Handlers
  const handleFormSubmit = async (profile: StudentProfile) => {
    setStudentProfile(profile);
    saveStoredProfile(profile);

    // Call FastAPI backend to register/update student
    try {
      const persisted = await apiClient.saveStudentProfile(profile);
      if (persisted.id) {
        profile.id = persisted.id;
      }
    } catch (e) {
      console.warn('Backend sync notice:', e);
    }

    // Call FastAPI Rule Engine
    try {
      const evaluated = await apiClient.matchScholarships(profile);
      setMatchResults(evaluated);
    } catch {
      setMatchResults(matchAllScholarships(profile, SCHOLARSHIPS_DATABASE));
    }

    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = async (scholarshipId: string) => {
    const updated = toggleStoredBookmark(scholarshipId);
    setBookmarkedIds(updated);

    if (studentProfile?.id) {
      if (updated.includes(scholarshipId)) {
        await apiClient.addBookmark(studentProfile.id, scholarshipId);
      } else {
        await apiClient.removeBookmark(studentProfile.id, scholarshipId);
      }
    }
  };

  const handleUpdateTrackingStatus = async (
    scholarshipId: string,
    status: ApplicationTrackingStatus
  ) => {
    const existing = applicationTracker[scholarshipId];
    const updatedItem: ApplicationTrackerItem = {
      scholarshipId,
      status,
      appliedDate: status === 'Applied' ? (existing?.appliedDate || new Date().toISOString().split('T')[0]) : undefined,
      applicationReferenceNumber: existing?.applicationReferenceNumber,
      notes: existing?.notes,
      updatedAt: new Date().toISOString()
    };

    const updatedTracker = saveTrackerItem(updatedItem);
    setApplicationTracker({ ...updatedTracker });

    if (studentProfile?.id) {
      await apiClient.saveApplication(studentProfile.id, updatedItem);
    }
  };

  const handleSaveTrackerNotes = async (item: ApplicationTrackerItem) => {
    const updatedTracker = saveTrackerItem(item);
    setApplicationTracker({ ...updatedTracker });

    if (studentProfile?.id) {
      await apiClient.saveApplication(studentProfile.id, item);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#202B38] selection:bg-[#159A80]/15 selection:text-[#142B4A]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleProtectedNavigate}
        studentProfile={studentProfile}
        savedCount={bookmarkedIds.length}
        authUser={authUser}
        onLogout={handleLogout}
        onSelectScholarship={(sch) => setSelectedScholarship(sch)}
      />

      {/* Main Viewport Routing */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            authUser={authUser}
            onLogin={() => {
              setLoginNotice('');
              setCurrentView('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewMatchedScholarships={() => {
              setCurrentView(studentProfile ? 'results' : 'form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExplore={() => {
              setCurrentView('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCheckEligibility={() => {
              if (authUser) {
                setCurrentView(studentProfile ? 'results' : 'form');
              } else {
                setLoginNotice('Please log in or register to check your scholarship eligibility.');
                setCurrentView('login');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectScholarship={(sch) => setSelectedScholarship(sch)}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            initialNotice={loginNotice}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => {
              setLoginNotice('');
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordPage
            tokenFromUrl={resetPasswordToken}
            onNavigateToLogin={() => {
              setLoginNotice('Password reset successfully. You can now log in.');
              setCurrentView('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'form' && (
          <>
            {!authUser ? (
              <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-[#159A80] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display text-[#142B4A] mb-2">
                  Authentication Required
                </h2>
                <p className="text-xs text-[#718096] mb-6 leading-relaxed">
                  Please sign in or register to access the Eligibility Matcher and save your academic profile.
                </p>
                <button
                  onClick={() => {
                    setLoginNotice('Please log in to access the Eligibility Matcher.');
                    setCurrentView('login');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl transition-colors cursor-pointer"
                >
                  Sign In to Continue
                </button>
              </div>
            ) : (
              <StudentForm
                initialProfile={studentProfile}
                authUser={authUser}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  if (studentProfile && studentProfile.fullName) {
                    setCurrentView('results');
                  } else {
                    setCurrentView('landing');
                  }
                }}
              />
            )}
          </>
        )}

        {currentView === 'results' && (
          <>
            {!authUser ? (
              <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-[#159A80] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display text-[#142B4A] mb-2">
                  Authentication Required
                </h2>
                <p className="text-xs text-[#718096] mb-6 leading-relaxed">
                  Please sign in to view your matched scholarship results.
                </p>
                <button
                  onClick={() => {
                    setLoginNotice('Please sign in to view your eligibility results.');
                    setCurrentView('login');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl transition-colors cursor-pointer"
                >
                  Sign In to View Results
                </button>
              </div>
            ) : studentProfile && studentProfile.fullName ? (
              <ResultsDashboard
                studentProfile={studentProfile}
                matchResults={matchResults.length > 0 ? matchResults : matchAllScholarships(studentProfile, SCHOLARSHIPS_DATABASE)}
                bookmarkedIds={bookmarkedIds}
                applicationTracker={applicationTracker}
                onEditProfile={() => setCurrentView('form')}
                onOpenDetails={(sch) => setSelectedScholarship(sch)}
                onToggleBookmark={handleToggleBookmark}
                onUpdateTrackingStatus={handleUpdateTrackingStatus}
              />
            ) : (
              <div className="max-w-md mx-auto px-4 py-20 text-center">
                <h2 className="text-xl font-bold font-display text-[#142B4A] mb-2">
                  No Student Profile Found
                </h2>
                <p className="text-xs text-[#718096] mb-6 leading-relaxed">
                  Please complete the student details form first to allow our deterministic rule engine to evaluate your eligibility.
                </p>
                <button
                  onClick={() => setCurrentView('form')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12836d] rounded-xl transition-colors cursor-pointer"
                >
                  Create Student Profile
                </button>
              </div>
            )}
          </>
        )}

        {currentView === 'dashboard' && (
          <>
            {authUser ? (
              studentProfile && studentProfile.fullName ? (
                <StudentDashboard
                  profile={studentProfile}
                  matchResults={matchResults.length > 0 ? matchResults : matchAllScholarships(studentProfile, SCHOLARSHIPS_DATABASE)}
                  bookmarkedIds={bookmarkedIds}
                  applicationTracker={applicationTracker}
                  onEditProfile={() => setCurrentView('form')}
                  onOpenDetails={(sch) => setSelectedScholarship(sch)}
                  onToggleBookmark={handleToggleBookmark}
                  onUpdateTrackingStatus={handleUpdateTrackingStatus}
                  onSaveTrackerNotes={handleSaveTrackerNotes}
                  onNavigateToResults={() => setCurrentView('results')}
                />
              ) : (
                <div className="max-w-md mx-auto px-4 py-20 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-[#159A80] flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold font-display text-[#142B4A] mb-2">
                    Complete Your Student Profile
                  </h2>
                  <p className="text-xs text-[#718096] mb-6 leading-relaxed">
                    Enter your academic credentials and financial background to unlock your personalized scholarship tracker.
                  </p>
                  <button
                    onClick={() => setCurrentView('form')}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-colors cursor-pointer"
                  >
                    Enter Profile
                  </button>
                </div>
              )
            ) : (
              <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-[#159A80] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display text-[#142B4A] mb-2">
                  Student Portal Access
                </h2>
                <p className="text-xs text-[#718096] mb-6 leading-relaxed">
                  Please log in to view your saved scholarships, application tracking status, and verification notes.
                </p>
                <button
                  onClick={() => {
                    setLoginNotice('Please log in to access the Student Portal.');
                    setCurrentView('login');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#244C74] rounded-xl transition-colors cursor-pointer"
                >
                  Log In to Access Portal
                </button>
              </div>
            )}
          </>
        )}

        {currentView === 'explore' && (
          <ExploreScholarships
            onSelectScholarship={(sch) => setSelectedScholarship(sch)}
            onMatchProfile={() => {
              if (authUser) {
                setCurrentView(studentProfile ? 'results' : 'form');
              } else {
                setLoginNotice('Please log in or register to match scholarships against your profile.');
                setCurrentView('login');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </main>

      {/* Scholarship Detailed View Modal */}
      {selectedScholarship && (
        <ScholarshipDetailsModal
          scholarship={selectedScholarship}
          studentProfile={studentProfile}
          matchResult={selectedMatchResult}
          onClose={() => setSelectedScholarship(null)}
        />
      )}

      {/* Regulatory & Disclaimer Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Global Footer */}
      <Footer
        onOpenDisclaimer={() => setLegalModalType('disclaimer')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
      />
    </div>
  );
}
