export type Gender = 'male' | 'female' | 'other' | 'all';
export type EducationLevel = 'SSLC' | 'PUC / 12th' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'PhD';
export type InstitutionType = 'Government' | 'Private' | 'Aided';
export type CasteCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Other';
export type ResidenceType = 'Rural' | 'Urban';
export type ScholarType = 'Hostel' | 'Day Scholar';

export type MinorityCommunity = 'Muslim' | 'Christian' | 'Sikh' | 'Buddhist' | 'Jain' | 'Parsi' | 'None';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  createdAt?: string;
}

export interface StudentProfile {
  id?: string;
  // Step 1: Personal
  fullName: string;
  age: number;
  gender: Gender;
  state: string;
  district: string;
  nationality: string;
  residence: ResidenceType;
  hasDisability: boolean;
  disabilityPercentage?: number;

  // Step 2: Educational
  educationLevel: EducationLevel;
  course: string;
  institutionName: string;
  currentYear: number;
  prevExamPercentage: number;
  currentCgpaOrPercentage: number;
  institutionType: InstitutionType;

  // Step 3: Category
  category: CasteCategory;
  isMinority: boolean;
  minorityCommunity?: MinorityCommunity;

  // Step 4: Financial
  annualFamilyIncome: number;
  parentOccupation: string;
  familyMembersCount: number;
  siblingsStudyingCount: number;
  hasIncomeCertificate: boolean;

  // Step 5: Additional
  scholarType: ScholarType;
  alreadyReceivesScholarship: boolean;
  existingScholarshipName?: string;
  sportsAchievements?: string;
  academicAchievements?: string;
  updatedAt?: string;
}

export type ProviderType = 'Central Government' | 'State Government' | 'Private' | 'Trust/Foundation';
export type SchemeType = 'Need-based' | 'Merit-based' | 'Category-based' | 'Gender-specific' | 'Disability-specific';
export type MatchStatus = 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  providerType: ProviderType;
  schemeType: SchemeType;
  amountDisplay: string;
  amountValue: number; // in INR per annum for sorting
  deadline: string;
  deadlineDate: string;
  officialLink: string;
  portalName: string;
  verified: boolean;
  description: string;
  eligibilityCriteriaSummary: string[];
  requiredDocuments: string[];
  applicationProcedure: string[];
  rejectionReasons: string[];
  importantDatesNotes: string;

  // Deterministic Matching Rules
  rules: {
    maxIncome?: number; // e.g. 250000, 800000
    minPercentage?: number; // e.g. 50, 60, 80
    allowedEducationLevels?: EducationLevel[];
    allowedCategories?: CasteCategory[];
    allowedGenders?: ('male' | 'female' | 'other')[];
    allowedStates?: string[]; // Empty means Pan-India
    allowedInstitutionTypes?: InstitutionType[];
    requiresMinority?: boolean;
    requiresDisability?: boolean;
    minDisabilityPercentage?: number;
    disallowOtherScholarships?: boolean;
    courseKeywordMatch?: string[]; // e.g. technical / professional courses
  };
}

export interface MatchResult {
  scholarship: Scholarship;
  status: MatchStatus;
  matchedReasons: string[];
  missingOrPendingVerifications: string[];
  exclusionReasons: string[];
}

export type ApplicationTrackingStatus = 'Interested' | 'Applied' | 'Not Applied';

export interface ApplicationTrackerItem {
  scholarshipId: string;
  status: ApplicationTrackingStatus;
  appliedDate?: string;
  applicationReferenceNumber?: string;
  notes?: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  status: 'ALL' | MatchStatus;
  providerType: 'ALL' | ProviderType;
  schemeType: 'ALL' | SchemeType;
  minAmount: number;
  sortBy: 'amount_desc' | 'amount_asc' | 'deadline_soonest' | 'relevance';
}

export interface NotificationItem {
  id: number;
  userId: number;
  scholarshipId: string;
  title: string;
  message: string;
  matchStatus: MatchStatus;
  isRead: boolean;
  createdAt: string;
  emailSent: boolean;
  emailSentTo?: string | null;
  emailSentAt?: string | null;
  deliveryStatus: string;
  scholarshipName?: string | null;
  amountDisplay?: string | null;
  deadline?: string | null;
  officialLink?: string | null;
}

export interface NotificationPreferenceItem {
  id?: number;
  userId?: number;
  emailAlertsEnabled: boolean;
  minAmountThreshold: number;
  notifyEligibleOnly: boolean;
  alertEmail?: string | null;
  updatedAt?: string;
}

