import {
  StudentProfile,
  Scholarship,
  MatchResult,
  ApplicationTrackerItem,
  ApplicationTrackingStatus,
  AuthUser,
  NotificationItem,
  NotificationPreferenceItem
} from '../types';
import { matchAllScholarships } from './matchingEngine';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';
import { getStoredToken, saveStoredToken, clearAllAuthSession, saveStoredAuthUser } from './storageService';

const API_BASE_URL = '/api';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Transform Frontend Profile to Backend Snake Case Format
function toBackendStudent(profile: StudentProfile) {
  return {
    id: profile.id,
    full_name: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    state: profile.state,
    district: profile.district,
    nationality: profile.nationality,
    residence: profile.residence,
    has_disability: profile.hasDisability,
    disability_percentage: profile.disabilityPercentage,
    education_level: profile.educationLevel,
    course: profile.course,
    institution_name: profile.institutionName,
    current_year: profile.currentYear,
    prev_exam_percentage: profile.prevExamPercentage,
    current_cgpa: profile.currentCgpaOrPercentage,
    institution_type: profile.institutionType,
    category: profile.category,
    is_minority: profile.isMinority,
    minority_community: profile.minorityCommunity,
    annual_family_income: profile.annualFamilyIncome,
    parent_occupation: profile.parentOccupation,
    family_members_count: profile.familyMembersCount,
    siblings_studying_count: profile.siblingsStudyingCount,
    has_income_certificate: profile.hasIncomeCertificate,
    scholar_type: profile.scholarType,
    already_receives_scholarship: profile.alreadyReceivesScholarship,
    existing_scholarship_name: profile.existingScholarshipName,
    sports_achievements: profile.sportsAchievements,
    academic_achievements: profile.academicAchievements,
  };
}

// Transform Backend Student to Frontend Camel Case Format
function toFrontendStudent(data: any): StudentProfile {
  return {
    id: data.id,
    fullName: data.full_name,
    age: data.age,
    gender: data.gender,
    state: data.state,
    district: data.district,
    nationality: data.nationality,
    residence: data.residence,
    hasDisability: data.has_disability,
    disabilityPercentage: data.disability_percentage,
    educationLevel: data.education_level,
    course: data.course,
    institutionName: data.institution_name,
    currentYear: data.current_year,
    prevExamPercentage: data.prev_exam_percentage,
    currentCgpaOrPercentage: data.current_cgpa,
    institutionType: data.institution_type,
    category: data.category,
    isMinority: data.is_minority,
    minorityCommunity: data.minority_community,
    annualFamilyIncome: data.annual_family_income,
    parentOccupation: data.parent_occupation,
    familyMembersCount: data.family_members_count,
    siblingsStudyingCount: data.siblings_studying_count,
    hasIncomeCertificate: data.has_income_certificate,
    scholarType: data.scholar_type,
    alreadyReceivesScholarship: data.already_receives_scholarship,
    existingScholarshipName: data.existing_scholarship_name,
    sportsAchievements: data.sports_achievements,
    academicAchievements: data.academic_achievements,
  };
}

// Transform Backend Match Result to Frontend Format
function toFrontendMatchResult(data: any): MatchResult {
  const sch = data.scholarship;
  const frontendScholarship: Scholarship = {
    id: sch.id,
    name: sch.name,
    provider: sch.provider,
    providerType: sch.provider_type,
    schemeType: sch.scheme_type,
    amountDisplay: sch.amount_display,
    amountValue: sch.amount_value,
    deadline: sch.deadline,
    deadlineDate: sch.deadline_date,
    officialLink: sch.official_link,
    portalName: sch.portal_name,
    verified: sch.verified,
    description: sch.description,
    eligibilityCriteriaSummary: sch.eligibility_criteria_summary || [],
    requiredDocuments: sch.required_documents || [],
    applicationProcedure: sch.application_procedure || [],
    rejectionReasons: sch.rejection_reasons || [],
    importantDatesNotes: sch.important_dates_notes || '',
    rules: sch.rules ? {
      maxIncome: sch.rules.max_income,
      minPercentage: sch.rules.min_percentage,
      allowedEducationLevels: sch.rules.allowed_education_levels,
      allowedCategories: sch.rules.allowed_categories,
      allowedGenders: sch.rules.allowed_genders,
      allowedStates: sch.rules.allowed_states,
      allowedInstitutionTypes: sch.rules.allowed_institution_types,
      requiresMinority: sch.rules.requires_minority,
      requiresDisability: sch.rules.requires_disability,
      minDisabilityPercentage: sch.rules.min_disability_percentage,
      disallowOtherScholarships: sch.rules.disallow_other_scholarships,
      courseKeywordMatch: sch.rules.course_keywords
    } : {}
  };

  return {
    scholarship: frontendScholarship,
    status: data.status,
    matchedReasons: data.reasons || [],
    missingOrPendingVerifications: data.missing_requirements || [],
    exclusionReasons: data.next_steps || []
  };
}

export const apiClient = {
  // ==================== AUTHENTICATION APIS ====================

  async register(fullName: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed. Please check your inputs.');
    }

    const authUser: AuthUser = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
      createdAt: data.user.created_at
    };

    saveStoredToken(data.access_token);
    saveStoredAuthUser(authUser);

    return { user: authUser, token: data.access_token };
  },

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid email or password.');
    }

    const authUser: AuthUser = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
      createdAt: data.user.created_at
    };

    saveStoredToken(data.access_token);
    saveStoredAuthUser(authUser);

    return { user: authUser, token: data.access_token };
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!res.ok) {
        clearAllAuthSession();
        return null;
      }

      const data = await res.json();
      const authUser: AuthUser = {
        id: data.id,
        name: data.full_name,
        email: data.email,
        createdAt: data.created_at
      };
      saveStoredAuthUser(authUser);
      return authUser;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAllAuthSession();
    }
  },

  async forgotPassword(email: string): Promise<{
    message: string;
    emailSent: boolean;
    deliveryStatus?: string;
    configInstructions?: string;
    resetLink?: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to request password reset.');
    }

    return {
      message: data.message,
      emailSent: data.email_sent,
      deliveryStatus: data.delivery_status,
      configInstructions: data.config_instructions,
      resetLink: data.reset_link
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.trim(),
        new_password: newPassword
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Password reset failed. The link may have expired or already been used.');
    }

    return {
      message: data.message || 'Password reset successfully. You can now log in with your new password.'
    };
  },


  // ==================== HEALTH CHECK ====================
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==================== STUDENT PROFILE APIS ====================
  async saveStudentProfile(profile: StudentProfile): Promise<StudentProfile> {
    try {
      const payload = toBackendStudent(profile);
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required. Please log in first.');
        }
        throw new Error('Failed to save profile to database');
      }

      const data = await res.json();
      return toFrontendStudent(data);
    } catch (e: any) {
      if (e?.message?.includes('Authentication required')) {
        throw e;
      }
      return profile;
    }
  },

  async registerOrUpdateStudent(profile: StudentProfile): Promise<StudentProfile> {
    return this.saveStudentProfile(profile);
  },

  async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return toFrontendStudent(data);
    } catch {
      return null;
    }
  },

  // ==================== SCHOLARSHIPS DIRECTORY ====================
  async getScholarships(query?: string, providerType?: string, schemeType?: string): Promise<Scholarship[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (providerType && providerType !== 'ALL') params.append('provider_type', providerType);
      if (schemeType && schemeType !== 'ALL') params.append('scheme_type', schemeType);

      const res = await fetch(`${API_BASE_URL}/scholarships?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load scholarships');
      const list = await res.json();
      return list.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          provider: item.provider,
          providerType: item.provider_type,
          schemeType: item.scheme_type,
          amountDisplay: item.amount_display,
          amountValue: item.amount_value,
          deadline: item.deadline,
          deadlineDate: item.deadline_date,
          officialLink: item.official_link,
          portalName: item.portal_name,
          verified: item.verified,
          description: item.description,
          eligibilityCriteriaSummary: item.eligibility_criteria_summary || [],
          requiredDocuments: item.required_documents || [],
          applicationProcedure: item.application_procedure || [],
          rejectionReasons: item.rejection_reasons || [],
          importantDatesNotes: item.important_dates_notes || '',
          rules: item.rules ? {
            maxIncome: item.rules.max_income,
            minPercentage: item.rules.min_percentage,
            allowedEducationLevels: item.rules.allowed_education_levels,
            allowedCategories: item.rules.allowed_categories,
            allowedGenders: item.rules.allowed_genders,
            allowedStates: item.rules.allowed_states,
            allowedInstitutionTypes: item.rules.allowed_institution_types,
            requiresMinority: item.rules.requires_minority,
            requiresDisability: item.rules.requires_disability,
            minDisabilityPercentage: item.rules.min_disability_percentage,
            disallowOtherScholarships: item.rules.disallow_other_scholarships,
            courseKeywordMatch: item.rules.course_keywords
          } : {}
        };
      });
    } catch {
      return SCHOLARSHIPS_DATABASE;
    }
  },

  // ==================== RULE ENGINE MATCHING ====================
  async matchScholarships(profile: StudentProfile): Promise<MatchResult[]> {
    try {
      const payload = toBackendStudent(profile);
      const res = await fetch(`${API_BASE_URL}/match`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return matchAllScholarships(profile, SCHOLARSHIPS_DATABASE);
      }

      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) {
        return matchAllScholarships(profile, SCHOLARSHIPS_DATABASE);
      }

      return data.results.map((r: any) => toFrontendMatchResult(r));
    } catch {
      return matchAllScholarships(profile, SCHOLARSHIPS_DATABASE);
    }
  },

  // ==================== BOOKMARKS ====================
  async getBookmarks(studentId: string): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/bookmarks`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async addBookmark(studentId: string, scholarshipId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/bookmarks`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ scholarship_id: scholarshipId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async removeBookmark(studentId: string, scholarshipId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/bookmarks/${scholarshipId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==================== APPLICATION TRACKER ====================
  async getApplications(studentId: string): Promise<Record<string, ApplicationTrackerItem>> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/applications`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return {};
      const list = await res.json();
      const map: Record<string, ApplicationTrackerItem> = {};
      for (const item of list) {
        map[item.scholarship_id] = {
          scholarshipId: item.scholarship_id,
          status: item.status as ApplicationTrackingStatus,
          appliedDate: item.applied_date,
          applicationReferenceNumber: item.application_reference_number,
          notes: item.notes,
          updatedAt: item.updated_at || new Date().toISOString()
        };
      }
      return map;
    } catch {
      return {};
    }
  },

  async saveApplication(studentId: string, item: ApplicationTrackerItem): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/applications`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          scholarship_id: item.scholarshipId,
          status: item.status,
          applied_date: item.appliedDate,
          application_reference_number: item.applicationReferenceNumber,
          notes: item.notes
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==================== NOTIFICATIONS & EMAIL ALERTS ====================
  async getNotifications(): Promise<{ items: NotificationItem[]; unreadCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return { items: [], unreadCount: 0 };
      const data = await res.json();
      const items: NotificationItem[] = (data.items || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        scholarshipId: n.scholarship_id,
        title: n.title,
        message: n.message,
        matchStatus: n.match_status,
        isRead: n.is_read,
        createdAt: n.created_at,
        emailSent: n.email_sent,
        emailSentTo: n.email_sent_to,
        emailSentAt: n.email_sent_at,
        deliveryStatus: n.delivery_status,
        scholarshipName: n.scholarship_name,
        amountDisplay: n.amount_display,
        deadline: n.deadline,
        officialLink: n.official_link
      }));
      return {
        items,
        unreadCount: data.unread_count ?? items.filter(i => !i.isRead).length
      };
    } catch {
      return { items: [], unreadCount: 0 };
    }
  },

  async markNotificationRead(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getNotificationPreferences(): Promise<NotificationPreferenceItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return null;
      const p = await res.json();
      return {
        id: p.id,
        userId: p.user_id,
        emailAlertsEnabled: p.email_alerts_enabled,
        minAmountThreshold: p.min_amount_threshold,
        notifyEligibleOnly: p.notify_eligible_only,
        alertEmail: p.alert_email,
        updatedAt: p.updated_at
      };
    } catch {
      return null;
    }
  },

  async updateNotificationPreferences(prefs: Partial<NotificationPreferenceItem>): Promise<NotificationPreferenceItem | null> {
    try {
      const payload: Record<string, any> = {};
      if (prefs.emailAlertsEnabled !== undefined) payload.email_alerts_enabled = prefs.emailAlertsEnabled;
      if (prefs.minAmountThreshold !== undefined) payload.min_amount_threshold = prefs.minAmountThreshold;
      if (prefs.notifyEligibleOnly !== undefined) payload.notify_eligible_only = prefs.notifyEligibleOnly;
      if (prefs.alertEmail !== undefined) payload.alert_email = prefs.alertEmail;

      const res = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const p = await res.json();
      return {
        id: p.id,
        userId: p.user_id,
        emailAlertsEnabled: p.email_alerts_enabled,
        minAmountThreshold: p.min_amount_threshold,
        notifyEligibleOnly: p.notify_eligible_only,
        alertEmail: p.alert_email,
        updatedAt: p.updated_at
      };
    } catch {
      return null;
    }
  },

  async sendTestEmail(email?: string): Promise<{ success: boolean; message: string; simulated?: boolean; alertEmail?: string }> {
    const res = await fetch(`${API_BASE_URL}/notifications/test-email`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(email ? { email } : {})
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to dispatch test email alert');
    }
    return {
      success: data.success,
      message: data.message,
      simulated: data.simulated,
      alertEmail: data.alert_email
    };
  },

  async scanMatchingAlerts(): Promise<{ scanned: number; newMatchesFound: number; alertsSent: number; message: string }> {
    const res = await fetch(`${API_BASE_URL}/notifications/scan-matches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to scan matching scholarships');
    }
    return {
      scanned: data.scanned,
      newMatchesFound: data.new_matches_found,
      alertsSent: data.alerts_sent,
      message: data.message
    };
  }
};

