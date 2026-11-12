import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  IndianRupee,
  Building,
  Calendar,
  CheckCircle2,
  Bookmark,
  FileCheck2,
  ExternalLink,
  Edit3,
  Search,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Bell,
  Mail,
  Send,
  RefreshCw,
  CheckCheck,
  AlertCircle,
  Sliders,
  Check
} from 'lucide-react';
import {
  StudentProfile,
  Scholarship,
  MatchResult,
  ApplicationTrackerItem,
  ApplicationTrackingStatus,
  NotificationItem,
  NotificationPreferenceItem
} from '../types';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';
import { apiClient } from '../services/apiClient';

interface StudentDashboardProps {
  profile: StudentProfile;
  matchResults: MatchResult[];
  bookmarkedIds: string[];
  applicationTracker: Record<string, ApplicationTrackerItem>;
  onEditProfile: () => void;
  onOpenDetails: (scholarship: Scholarship) => void;
  onToggleBookmark: (scholarshipId: string) => void;
  onUpdateTrackingStatus: (scholarshipId: string, status: ApplicationTrackingStatus) => void;
  onSaveTrackerNotes: (item: ApplicationTrackerItem) => void;
  onNavigateToResults: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  matchResults,
  bookmarkedIds,
  applicationTracker,
  onEditProfile,
  onOpenDetails,
  onToggleBookmark,
  onUpdateTrackingStatus,
  onSaveTrackerNotes,
  onNavigateToResults
}) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'bookmarks' | 'profileView' | 'alerts'>('tracker');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [tempRefNo, setTempRefNo] = useState<string>('');

  // Notifications & Email Alert States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferenceItem>({
    emailAlertsEnabled: true,
    minAmountThreshold: 0,
    notifyEligibleOnly: false,
    alertEmail: 'shreyashn899@gmail.com'
  });
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load preferences and notifications
  const loadAlertData = async () => {
    try {
      setIsLoadingAlerts(true);
      const [notifsRes, prefsRes] = await Promise.all([
        apiClient.getNotifications(),
        apiClient.getNotificationPreferences()
      ]);
      setNotifications(notifsRes.items);
      if (prefsRes) {
        setPreferences({
          emailAlertsEnabled: prefsRes.emailAlertsEnabled ?? true,
          minAmountThreshold: prefsRes.minAmountThreshold ?? 0,
          notifyEligibleOnly: prefsRes.notifyEligibleOnly ?? false,
          alertEmail: prefsRes.alertEmail || 'shreyashn899@gmail.com'
        });
      }
    } catch {
      // Quiet fail
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    loadAlertData();
  }, []);

  const handleSavePreferences = async () => {
    try {
      setIsSavingPrefs(true);
      setAlertFeedback(null);
      const updated = await apiClient.updateNotificationPreferences(preferences);
      if (updated) {
        setPreferences(updated);
        setAlertFeedback({
          type: 'success',
          text: 'Alert preferences saved successfully! You will receive email alerts for new matching schemes.'
        });
      }
    } catch (e: any) {
      setAlertFeedback({
        type: 'error',
        text: e.message || 'Failed to save alert preferences.'
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setIsSendingTestEmail(true);
      setAlertFeedback(null);
      const res = await apiClient.sendTestEmail(preferences.alertEmail || undefined);
      setAlertFeedback({
        type: 'success',
        text: `✓ ${res.message}`
      });
      // Refresh notifications list to show the test alert entry
      const notifsRes = await apiClient.getNotifications();
      setNotifications(notifsRes.items);
    } catch (e: any) {
      setAlertFeedback({
        type: 'error',
        text: e.message || 'Failed to dispatch test email alert.'
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleScanMatches = async () => {
    try {
      setIsScanning(true);
      setAlertFeedback(null);
      const res = await apiClient.scanMatchingAlerts();
      setAlertFeedback({
        type: 'success',
        text: `✓ ${res.message}`
      });
      // Refresh notifications
      const notifsRes = await apiClient.getNotifications();
      setNotifications(notifsRes.items);
    } catch (e: any) {
      setAlertFeedback({
        type: 'error',
        text: e.message || 'Failed to scan matching scholarships.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    await apiClient.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Get applied or interested scholarships
  const trackedScholarships = Object.values(applicationTracker).filter(
    (item) => item.status !== 'Not Applied'
  );

  const bookmarkedScholarships = SCHOLARSHIPS_DATABASE.filter((sch) =>
    bookmarkedIds.includes(sch.id)
  );

  const handleStartEditNotes = (item: ApplicationTrackerItem) => {
    setEditingNotesId(item.scholarshipId);
    setTempNotes(item.notes || '');
    setTempRefNo(item.applicationReferenceNumber || '');
  };

  const handleSaveNotes = (scholarshipId: string) => {
    const existing = applicationTracker[scholarshipId] || {
      scholarshipId,
      status: 'Interested',
      updatedAt: new Date().toISOString()
    };
    onSaveTrackerNotes({
      ...existing,
      notes: tempNotes,
      applicationReferenceNumber: tempRefNo,
      updatedAt: new Date().toISOString()
    });
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Welcome & Profile Quick Card */}
      <div className="bg-white rounded-xl border border-[#E5EAE8] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#142B4A] flex items-center justify-center text-white text-xl font-bold font-display shadow-xs">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#142B4A] font-display">
                {profile.fullName}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#159A80]/10 text-[#159A80] border border-[#159A80]/20">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-[#718096] mt-1">
              {profile.educationLevel} · {profile.course} at {profile.institutionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToResults}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View All {matchResults.length} Matched Schemes</span>
          </button>
          <button
            onClick={onEditProfile}
            className="px-3.5 py-2.5 text-xs font-semibold text-[#142B4A] bg-[#F7F8F5] hover:bg-slate-100 border border-[#E5EAE8] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Details</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAE8]">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracker'
              ? 'border-[#159A80] text-[#142B4A]'
              : 'border-transparent text-[#718096] hover:text-[#142B4A]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Application Tracker ({trackedScholarships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-[#159A80] text-[#142B4A]'
              : 'border-transparent text-[#718096] hover:text-[#142B4A]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Scholarships ({bookmarkedScholarships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profileView')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'profileView'
              ? 'border-[#159A80] text-[#142B4A]'
              : 'border-transparent text-[#718096] hover:text-[#142B4A]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Full Academic & Category Dossier</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('alerts');
            loadAlertData();
          }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'alerts'
              ? 'border-[#159A80] text-[#142B4A]'
              : 'border-transparent text-[#718096] hover:text-[#142B4A]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Email Alerts & Notifications</span>
          {notifications.some((n) => !n.isRead) && (
            <span className="w-2 h-2 rounded-full bg-[#159A80]" />
          )}
        </button>
      </div>

      {/* TAB 1: APPLICATION TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#142B4A] font-display">
                Active Scholarship Applications
              </h2>
              <p className="text-xs text-[#718096]">
                Record your application submission reference numbers and monitor progress across state and national portals.
              </p>
            </div>
          </div>

          {trackedScholarships.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5EAE8] p-12 text-center max-w-md mx-auto">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#142B4A] font-display mb-1">
                No Tracked Applications Yet
              </h3>
              <p className="text-xs text-[#718096] mb-4">
                Explore your matched scholarships and set their status to "Interested" or "Applied" to track them here.
              </p>
              <button
                onClick={onNavigateToResults}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg cursor-pointer"
              >
                Explore Matched Scholarships
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedScholarships.map((trackerItem) => {
                const scholarship = SCHOLARSHIPS_DATABASE.find(
                  (s) => s.id === trackerItem.scholarshipId
                );
                if (!scholarship) return null;

                const isEditing = editingNotesId === trackerItem.scholarshipId;

                return (
                  <div
                    key={trackerItem.scholarshipId}
                    className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              trackerItem.status === 'Applied'
                                ? 'bg-[#159A80]/10 text-[#159A80] border border-[#159A80]/20'
                                : 'bg-[#142B4A]/10 text-[#142B4A] border border-[#142B4A]/20'
                            }`}
                          >
                            {trackerItem.status}
                          </span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-[#718096] font-mono">
                            {scholarship.portalName}
                          </span>
                        </div>

                        <h3
                          onClick={() => onOpenDetails(scholarship)}
                          className="text-base font-bold text-[#142B4A] font-display hover:text-[#159A80] cursor-pointer"
                        >
                          {scholarship.name}
                        </h3>
                        <p className="text-xs text-[#718096]">{scholarship.provider}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={trackerItem.status}
                          onChange={(e) =>
                            onUpdateTrackingStatus(
                              scholarship.id,
                              e.target.value as ApplicationTrackingStatus
                            )
                          }
                          className="px-3 py-1.5 text-xs bg-[#F7F8F5] border border-[#E5EAE8] rounded-lg font-medium text-[#202B38]"
                        >
                          <option value="Interested">Interested</option>
                          <option value="Applied">Applied (Submitted)</option>
                          <option value="Not Applied">Remove from Tracker</option>
                        </select>

                        <a
                          href={scholarship.officialLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-semibold text-[#159A80] hover:text-[#12826C] bg-[#159A80]/10 rounded-lg inline-flex items-center gap-1"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Reference number and notes display or edit */}
                    <div className="pt-3 border-t border-[#E5EAE8] text-xs text-[#718096]">
                      {isEditing ? (
                        <div className="space-y-3 p-3 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#142B4A] uppercase mb-1">
                              Application Reference / Acknowledgment Number
                            </label>
                            <input
                              type="text"
                              value={tempRefNo}
                              onChange={(e) => setTempRefNo(e.target.value)}
                              placeholder="e.g. NSP2026/KA/192837 or SSP-RD-98213"
                              className="w-full px-3 py-1.5 text-xs border border-[#E5EAE8] rounded-lg bg-white text-[#202B38]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#142B4A] uppercase mb-1">
                              Personal Notes / Verification Milestones
                            </label>
                            <textarea
                              rows={2}
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="e.g. Submitted bonafide to college nodal officer on Oct 12th; pending tehsildar sign."
                              className="w-full px-3 py-1.5 text-xs border border-[#E5EAE8] rounded-lg bg-white text-[#202B38]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveNotes(scholarship.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg cursor-pointer"
                            >
                              Save Tracker Details
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-3 py-1.5 text-xs text-[#718096] hover:text-[#142B4A] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            {trackerItem.applicationReferenceNumber ? (
                              <p className="font-mono text-[#202B38] text-xs">
                                Ref Number:{' '}
                                <span className="font-semibold text-[#159A80]">
                                  {trackerItem.applicationReferenceNumber}
                                </span>
                              </p>
                            ) : (
                              <p className="text-slate-400 italic">No application reference number added.</p>
                            )}
                            {trackerItem.notes && (
                              <p className="text-[#718096] text-xs mt-0.5">{trackerItem.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleStartEditNotes(trackerItem)}
                            className="text-xs text-[#159A80] hover:text-[#12826C] font-semibold cursor-pointer"
                          >
                            Edit notes & reference
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#142B4A] font-display">
            Bookmarked Opportunities
          </h2>

          {bookmarkedScholarships.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5EAE8] p-12 text-center max-w-md mx-auto">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#142B4A] font-display mb-1">
                No Bookmarked Scholarships
              </h3>
              <p className="text-xs text-[#718096] mb-4">
                Click the bookmark icon on any scholarship card to save it for quick reference here.
              </p>
              <button
                onClick={onNavigateToResults}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg cursor-pointer"
              >
                Browse Scholarships
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedScholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        onClick={() => onOpenDetails(sch)}
                        className="text-base font-bold text-[#142B4A] font-display hover:text-[#159A80] cursor-pointer"
                      >
                        {sch.name}
                      </h3>
                      <button
                        onClick={() => onToggleBookmark(sch.id)}
                        className="p-1.5 text-amber-500 hover:text-amber-600 cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Bookmark className="w-4 h-4 fill-amber-500" />
                      </button>
                    </div>

                    <p className="text-xs text-[#718096] mb-2">{sch.provider}</p>

                    <div className="flex items-center gap-2 text-xs text-[#718096] mb-3">
                      <span className="font-bold text-[#159A80] tabular-nums">
                        {sch.amountDisplay}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Deadline: {sch.deadline}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5EAE8] flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenDetails(sch)}
                      className="text-[#142B4A] font-medium hover:text-[#159A80] cursor-pointer"
                    >
                      View Details
                    </button>
                    <a
                      href={sch.officialLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FULL PROFILE VIEW */}
      {activeTab === 'profileView' && (
        <div className="bg-white rounded-xl border border-[#E5EAE8] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#142B4A] font-display">
                Registered Student Profile
              </h2>
              <p className="text-xs text-[#718096]">
                This verified profile is continuously used by the matching engine to test eligibility.
              </p>
            </div>
            <button
              onClick={onEditProfile}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* Personal */}
            <div className="p-4 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8] space-y-2">
              <h3 className="font-bold text-[#142B4A] uppercase font-mono tracking-wider text-[11px] mb-2">
                Personal Information
              </h3>
              <p><strong className="text-[#718096]">Full Name:</strong> <span className="text-[#202B38] font-medium">{profile.fullName}</span></p>
              <p><strong className="text-[#718096]">Age:</strong> <span className="text-[#202B38] font-medium">{profile.age} years</span></p>
              <p><strong className="text-[#718096]">Gender:</strong> <span className="text-[#202B38] font-medium capitalize">{profile.gender}</span></p>
              <p><strong className="text-[#718096]">State of Domicile:</strong> <span className="text-[#202B38] font-medium">{profile.state}</span></p>
              <p><strong className="text-[#718096]">District:</strong> <span className="text-[#202B38] font-medium">{profile.district}</span></p>
              <p><strong className="text-[#718096]">Area:</strong> <span className="text-[#202B38] font-medium">{profile.residence}</span></p>
              <p><strong className="text-[#718096]">Disability Status:</strong> <span className="text-[#202B38] font-medium">{profile.hasDisability ? `Yes (${profile.disabilityPercentage}%)` : 'None'}</span></p>
            </div>

            {/* Educational */}
            <div className="p-4 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8] space-y-2">
              <h3 className="font-bold text-[#142B4A] uppercase font-mono tracking-wider text-[11px] mb-2">
                Educational Record
              </h3>
              <p><strong className="text-[#718096]">Current Level:</strong> <span className="text-[#202B38] font-medium">{profile.educationLevel}</span></p>
              <p><strong className="text-[#718096]">Course & Branch:</strong> <span className="text-[#202B38] font-medium">{profile.course}</span></p>
              <p><strong className="text-[#718096]">Institution:</strong> <span className="text-[#202B38] font-medium">{profile.institutionName}</span></p>
              <p><strong className="text-[#718096]">Institution Type:</strong> <span className="text-[#202B38] font-medium">{profile.institutionType}</span></p>
              <p><strong className="text-[#718096]">Year of Study:</strong> <span className="text-[#202B38] font-medium">Year {profile.currentYear}</span></p>
              <p><strong className="text-[#718096]">Previous Exam %:</strong> <span className="font-mono font-medium text-[#202B38]">{profile.prevExamPercentage}%</span></p>
              <p><strong className="text-[#718096]">Current CGPA / %:</strong> <span className="font-mono font-medium text-[#202B38]">{profile.currentCgpaOrPercentage || '—'}</span></p>
            </div>

            {/* Financial & Category */}
            <div className="p-4 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8] space-y-2">
              <h3 className="font-bold text-[#142B4A] uppercase font-mono tracking-wider text-[11px] mb-2">
                Financial & Category
              </h3>
              <p><strong className="text-[#718096]">Social Category:</strong> <span className="text-[#202B38] font-medium">{profile.category}</span></p>
              <p><strong className="text-[#718096]">Minority:</strong> <span className="text-[#202B38] font-medium">{profile.isMinority ? `Yes (${profile.minorityCommunity})` : 'No'}</span></p>
              <p><strong className="text-[#718096]">Annual Income:</strong> <span className="font-mono font-bold text-[#159A80]">₹{profile.annualFamilyIncome.toLocaleString('en-IN')}</span></p>
              <p><strong className="text-[#718096]">Parent Occupation:</strong> <span className="text-[#202B38] font-medium">{profile.parentOccupation}</span></p>
              <p><strong className="text-[#718096]">Income Certificate:</strong> <span className="text-[#202B38] font-medium">{profile.hasIncomeCertificate ? 'Available (Valid)' : 'In Progress'}</span></p>
              <p><strong className="text-[#718096]">Accommodation:</strong> <span className="text-[#202B38] font-medium">{profile.scholarType}</span></p>
              <p><strong className="text-[#718096]">Other Scholarships:</strong> <span className="text-[#202B38] font-medium">{profile.alreadyReceivesScholarship ? `Yes (${profile.existingScholarshipName})` : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL ALERTS & NOTIFICATIONS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#142B4A] font-display flex items-center gap-2">
                <span>Email Alerts & Match Notifications</span>
                <span className="px-2 py-0.5 rounded-full bg-[#159A80]/15 text-[#159A80] text-xs font-semibold font-mono">
                  Active Service
                </span>
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Automated notification service monitors verified state, central, and private scholarship additions against your profile.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleScanMatches}
                disabled={isScanning}
                className="px-3.5 py-2 text-xs font-semibold text-[#142B4A] bg-white hover:bg-slate-50 border border-[#E5EAE8] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning Schemes...' : 'Run Match Scan'}</span>
              </button>

              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-pulse' : ''}`} />
                <span>{isSendingTestEmail ? 'Dispatching...' : 'Send Test Alert Email'}</span>
              </button>
            </div>
          </div>

          {/* Alert feedback banner */}
          {alertFeedback && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                alertFeedback.type === 'success'
                  ? 'bg-emerald-50/80 border-[#159A80]/30 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  alertFeedback.type === 'success' ? 'bg-[#159A80] text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {alertFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{alertFeedback.text}</p>
              </div>
              <button
                onClick={() => setAlertFeedback(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Preferences Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E5EAE8] pb-3">
                  <Sliders className="w-4 h-4 text-[#159A80]" />
                  <h3 className="font-bold text-sm text-[#142B4A] font-display">
                    Alert Preferences & Dispatch Rules
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Destination Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#142B4A] uppercase mb-1">
                      Recipient Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={preferences.alertEmail || ''}
                        onChange={(e) =>
                          setPreferences({ ...preferences, alertEmail: e.target.value })
                        }
                        placeholder="shreyashn899@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5EAE8] rounded-lg bg-white text-[#202B38] focus:border-[#159A80] focus:ring-1 focus:ring-[#159A80]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <p className="text-[10px] text-[#718096] mt-1">
                      Email alerts with matched scholarship summaries and direct portal links are dispatched here.
                    </p>
                  </div>

                  {/* Enable Switch */}
                  <div className="flex items-start gap-3 p-3 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                    <input
                      type="checkbox"
                      id="emailAlertsEnabled"
                      checked={preferences.emailAlertsEnabled}
                      onChange={(e) =>
                        setPreferences({ ...preferences, emailAlertsEnabled: e.target.checked })
                      }
                      className="mt-0.5 rounded border-slate-300 text-[#159A80] focus:ring-[#159A80]"
                    />
                    <label htmlFor="emailAlertsEnabled" className="cursor-pointer">
                      <span className="font-bold text-[#142B4A] block">
                        Enable Automated Email Alerts
                      </span>
                      <span className="text-[11px] text-[#718096] block mt-0.5">
                        Immediately trigger an email notification whenever a new scholarship is added matching your criteria.
                      </span>
                    </label>
                  </div>

                  {/* Minimum Amount Threshold */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#142B4A] uppercase mb-1">
                      Minimum Scholarship Amount Filter
                    </label>
                    <select
                      value={preferences.minAmountThreshold}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          minAmountThreshold: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-[#E5EAE8] rounded-lg bg-white text-[#202B38]"
                    >
                      <option value={0}>Any Amount (All matching scholarships)</option>
                      <option value={15000}>At least ₹15,000 / year</option>
                      <option value={25000}>At least ₹25,000 / year</option>
                      <option value={50000}>At least ₹50,000 / year</option>
                      <option value={100000}>At least ₹1,00,000 / year</option>
                    </select>
                  </div>

                  {/* Eligible Only Checkbox */}
                  <div className="flex items-start gap-3 p-3 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                    <input
                      type="checkbox"
                      id="notifyEligibleOnly"
                      checked={preferences.notifyEligibleOnly}
                      onChange={(e) =>
                        setPreferences({ ...preferences, notifyEligibleOnly: e.target.checked })
                      }
                      className="mt-0.5 rounded border-slate-300 text-[#159A80] focus:ring-[#159A80]"
                    />
                    <label htmlFor="notifyEligibleOnly" className="cursor-pointer">
                      <span className="font-bold text-[#142B4A] block">
                        100% Eligible Schemes Only
                      </span>
                      <span className="text-[11px] text-[#718096] block mt-0.5">
                        Exclude "Possibly Eligible" schemes where specific course verifications are still pending.
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    disabled={isSavingPrefs}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#244C74] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isSavingPrefs ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#159A80]" />
                    )}
                    <span>{isSavingPrefs ? 'Saving Settings...' : 'Save Alert Preferences'}</span>
                  </button>
                </div>
              </div>

              {/* Service Architecture Status Card */}
              <div className="bg-[#142B4A] text-white rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
                    Engine Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#159A80]/20 text-[#159A80] text-[10px] font-semibold border border-[#159A80]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#159A80] animate-ping" />
                    Real-time Matching
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When administrators or automated crawlers import newly verified schemes into ScholarFind, the Python rule engine evaluates academic criteria (<span className="text-white font-mono">{profile.educationLevel}</span>), category (<span className="text-white font-mono">{profile.category}</span>), state (<span className="text-white font-mono">{profile.state}</span>), and income limit (<span className="text-white font-mono">₹{profile.annualFamilyIncome.toLocaleString('en-IN')}</span>).
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Alerts Dispatch Host:</span>
                  <span className="font-mono text-[#159A80]">SMTP / FastMail Engine</span>
                </div>
              </div>
            </div>

            {/* Notification History Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-[#E5EAE8] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5EAE8] pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#159A80]" />
                    <h3 className="font-bold text-sm text-[#142B4A] font-display">
                      Dispatched Alerts History ({notifications.length})
                    </h3>
                  </div>

                  {notifications.some((n) => !n.isRead) && (
                    <button
                      onClick={handleMarkAllAlertsRead}
                      className="text-xs font-semibold text-[#159A80] hover:text-[#12826C] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                {isLoadingAlerts ? (
                  <div className="p-12 text-center text-[#718096]">
                    <div className="w-6 h-6 border-2 border-[#159A80] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading alert history...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-[#718096]">
                    <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-[#142B4A] font-display mb-1">
                      No Alerts Triggered Yet
                    </h4>
                    <p className="text-xs text-[#718096] max-w-sm mx-auto mb-4">
                      Click "Run Match Scan" above to evaluate all {SCHOLARSHIPS_DATABASE.length} verified scholarships against your profile or click "Send Test Alert Email" to test email dispatch.
                    </p>
                    <button
                      onClick={handleScanMatches}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan All Scholarships Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((item) => {
                      const scholarship = SCHOLARSHIPS_DATABASE.find(
                        (s) => s.id === item.scholarshipId
                      );

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all ${
                            !item.isRead
                              ? 'bg-emerald-50/30 border-[#159A80]/30 shadow-xs'
                              : 'bg-white border-[#E5EAE8]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono ${
                                  item.matchStatus === 'ELIGIBLE'
                                    ? 'bg-[#159A80]/15 text-[#159A80] border border-[#159A80]/20'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {item.matchStatus === 'ELIGIBLE' ? '100% Qualified' : 'Possibly Eligible'}
                              </span>

                              <span className="text-[10px] text-[#718096]">
                                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <span className="font-bold text-xs text-[#159A80] tabular-nums">
                              {item.amountDisplay || 'Verified Govt Scheme'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#142B4A] font-display mb-1">
                            {item.title}
                          </h4>

                          <p className="text-xs text-[#718096] mb-3 leading-relaxed">
                            {item.message}
                          </p>

                          <div className="pt-3 border-t border-[#E5EAE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#159A80]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#159A80]" />
                              <span>
                                Alert delivered to{' '}
                                <strong className="font-mono text-[#202B38]">
                                  {item.emailSentTo || preferences.alertEmail}
                                </strong>{' '}
                                ({item.deliveryStatus})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {scholarship && (
                                <button
                                  onClick={() => onOpenDetails(scholarship)}
                                  className="text-xs font-semibold text-[#142B4A] hover:text-[#159A80] cursor-pointer"
                                >
                                  View Scheme Details
                                </button>
                              )}
                              {item.officialLink && (
                                <a
                                  href={item.officialLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Portal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
