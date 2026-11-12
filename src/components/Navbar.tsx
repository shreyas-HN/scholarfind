import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Bookmark,
  ChevronDown,
  ShieldCheck,
  Bell,
  Mail,
  Check,
  CheckCheck,
  ExternalLink,
  Clock,
  Sparkle
} from 'lucide-react';
import { StudentProfile, AuthUser, Scholarship, NotificationItem } from '../types';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';
import { apiClient } from '../services/apiClient';

interface NavbarProps {
  currentView: 'landing' | 'form' | 'results' | 'dashboard' | 'explore' | 'login' | 'reset-password';
  onNavigate: (view: 'landing' | 'form' | 'results' | 'dashboard' | 'explore' | 'login') => void;
  studentProfile: StudentProfile | null;
  savedCount: number;
  authUser: AuthUser | null;
  onLogout: () => void;
  onSelectScholarship?: (scholarship: Scholarship) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  studentProfile,
  savedCount,
  authUser,
  onLogout,
  onSelectScholarship
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications for authenticated user
  const fetchNotifications = async () => {
    if (!authUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setIsLoadingNotifications(true);
      const res = await apiClient.getNotifications();
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch {
      // Quiet fail
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (!authUser) return;

    // Periodic check every 45s
    const timer = setInterval(() => {
      fetchNotifications();
    }, 45000);

    return () => clearInterval(timer);
  }, [authUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavClick = (view: 'landing' | 'form' | 'results' | 'dashboard' | 'explore' | 'login') => {
    // Protected routes: redirect unauthenticated users to login
    if (view === 'dashboard' && !authUser) {
      onNavigate('login');
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
      setIsNotificationsOpen(false);
      return;
    }

    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await apiClient.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await apiClient.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    setIsNotificationsOpen(false);

    // If scholarship exists in database, open modal
    const sch = SCHOLARSHIPS_DATABASE.find((s) => s.id === notif.scholarshipId);
    if (sch && onSelectScholarship) {
      onSelectScholarship(sch);
    } else if (notif.officialLink) {
      window.open(notif.officialLink, '_blank', 'noopener,noreferrer');
    }
  };

  const displayName = authUser?.name || (studentProfile?.fullName ? studentProfile.fullName.split(' ')[0] : 'Student');

  return (
    <header className="sticky top-0 z-40 bg-[#142B4A] text-white border-b border-[#244C74] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159A80] rounded-lg py-1 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#159A80] flex items-center justify-center text-white shadow-xs group-hover:bg-[#12826C] transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-display block leading-none">
                Scholar<span className="text-[#159A80]">Find</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-300 block mt-0.5 tracking-wider uppercase font-mono">
                National Scholarship Engine
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => handleNavClick('landing')}
              className={`transition-colors whitespace-nowrap py-1.5 relative ${
                currentView === 'landing'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#159A80]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`transition-colors whitespace-nowrap py-1.5 relative ${
                currentView === 'explore'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#159A80]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Scholarships
            </button>
            <button
              onClick={() => {
                if (studentProfile) {
                  handleNavClick('results');
                } else {
                  handleNavClick('form');
                }
              }}
              className={`transition-colors whitespace-nowrap py-1.5 flex items-center gap-1.5 relative ${
                currentView === 'results' || currentView === 'form'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#159A80]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A80]" />
              <span>Eligibility Matcher</span>
            </button>

            {/* Authenticated Only: Student Portal Link */}
            {authUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`transition-colors whitespace-nowrap py-1.5 flex items-center gap-1.5 relative ${
                  currentView === 'dashboard'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#159A80]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Student Portal</span>
                {savedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#244C74] text-emerald-200 text-xs rounded-md font-mono font-semibold">
                    {savedCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Actions (Bell + Profile Dropdown for authenticated, strictly Log In for unauthenticated) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {authUser ? (
              <div className="flex items-center gap-2.5">
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsUserDropdownOpen(false);
                      if (!isNotificationsOpen) {
                        fetchNotifications();
                      }
                    }}
                    className={`relative p-2 rounded-xl transition-all border ${
                      isNotificationsOpen
                        ? 'bg-[#159A80] text-white border-[#159A80]'
                        : 'bg-[#244C74] text-slate-200 hover:text-white hover:bg-[#1B395E] border-white/10'
                    }`}
                    title="Scholarship Alerts & Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white border border-[#E5EAE8] rounded-2xl shadow-2xl py-0 z-50 text-xs text-[#202B38] overflow-hidden animate-fadeIn">
                      <div className="p-3.5 bg-[#142B4A] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#159A80]" />
                          <span className="font-bold text-sm font-display">Scholarship Alerts</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#159A80] text-white text-[10px] font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-[#E5EAE8]">
                        {isLoadingNotifications ? (
                          <div className="p-6 text-center text-[#718096]">
                            <div className="w-5 h-5 border-2 border-[#159A80] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs">Checking scholarship alerts...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-[#718096]">
                            <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-[#142B4A] text-xs">No alerts yet</p>
                            <p className="text-[11px] text-[#718096] mt-1 max-w-[240px] mx-auto">
                              When new scholarships matching your academic & income profile are added, you'll receive immediate email and portal alerts.
                            </p>
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleNotificationClick(item)}
                              className={`p-3.5 hover:bg-[#F7F8F5] transition-colors cursor-pointer text-left ${
                                !item.isRead ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                      item.matchStatus === 'ELIGIBLE'
                                        ? 'bg-[#159A80]/15 text-[#159A80]'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {item.matchStatus === 'ELIGIBLE' ? '100% Eligible' : 'Possibly Eligible'}
                                  </span>
                                  {!item.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-[#159A80]" />
                                  )}
                                </div>
                                <span className="text-[10px] text-[#718096]">
                                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>

                              <h4 className="font-bold text-[#142B4A] text-xs leading-snug line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-[#718096] mt-0.5 line-clamp-2">
                                {item.message}
                              </p>

                              {/* Email alert sent status indicator */}
                              <div className="mt-2 pt-2 border-t border-[#E5EAE8]/60 flex items-center justify-between text-[10px] text-[#718096]">
                                <div className="flex items-center gap-1 text-[#159A80] font-medium">
                                  <Mail className="w-3 h-3" />
                                  <span>Alert sent to {item.emailSentTo || authUser.email}</span>
                                </div>
                                <span className="font-semibold text-[#142B4A]">
                                  {item.amountDisplay || 'Verified Scheme'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2.5 bg-[#F7F8F5] border-t border-[#E5EAE8] flex items-center justify-between">
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className="text-[11px] font-semibold text-[#159A80] hover:text-[#12826C] transition-colors"
                        >
                          Alert Preferences & Settings →
                        </button>
                        <span className="text-[10px] text-[#718096]">
                          Targeted to your profile
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#244C74] hover:bg-[#1B395E] rounded-xl transition-all border border-white/10"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#159A80] text-white flex items-center justify-center text-xs font-bold font-display">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5EAE8] rounded-xl shadow-xl py-2 z-50 text-xs text-[#202B38] animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-[#E5EAE8]">
                        <p className="font-semibold text-[#142B4A] truncate">{displayName}</p>
                        <p className="text-[11px] text-[#718096] truncate">{authUser.email}</p>
                      </div>

                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8F5] transition-colors flex items-center gap-2 text-[#202B38]"
                      >
                        <User className="w-3.5 h-3.5 text-[#159A80]" />
                        <span>Student Portal</span>
                      </button>

                      {studentProfile && (
                        <button
                          onClick={() => handleNavClick('results')}
                          className="w-full text-left px-4 py-2 hover:bg-[#F7F8F5] transition-colors flex items-center gap-2 text-[#202B38]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#159A80]" />
                          <span>Matched Scholarships</span>
                        </button>
                      )}

                      <div className="border-t border-[#E5EAE8] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Strictly Log In Button only */
              <button
                onClick={() => handleNavClick('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!authUser && (
              <button
                onClick={() => handleNavClick('login')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg"
              >
                Log In
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white hover:bg-[#244C74] rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#244C74] py-4 px-2 space-y-2 bg-[#142B4A] text-sm font-medium">
            <button
              onClick={() => handleNavClick('landing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'landing' ? 'bg-[#244C74] text-white font-semibold' : 'text-slate-300 hover:bg-[#244C74]/50 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                currentView === 'explore' ? 'bg-[#244C74] text-white font-semibold' : 'text-slate-300 hover:bg-[#244C74]/50 hover:text-white'
              }`}
            >
              All Scholarships
            </button>
            <button
              onClick={() => {
                if (studentProfile) {
                  handleNavClick('results');
                } else {
                  handleNavClick('form');
                }
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                currentView === 'results' || currentView === 'form'
                  ? 'bg-[#244C74] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#244C74]/50 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#159A80]" />
              <span>Eligibility Matcher</span>
            </button>

            {authUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-[#244C74] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#244C74]/50 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-slate-300" />
                <span>Student Portal</span>
                {savedCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-[#244C74] text-emerald-200 text-xs rounded-md font-mono">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            <div className="pt-2 border-t border-[#244C74] mt-2 space-y-2">
              {authUser ? (
                <div className="flex items-center justify-between px-3 py-2 bg-[#244C74]/60 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#159A80] text-white flex items-center justify-center text-xs font-bold font-display">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-white">{displayName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-colors"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
