import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Users,
  IndianRupee,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  StudentProfile,
  Gender,
  EducationLevel,
  InstitutionType,
  CasteCategory,
  ResidenceType,
  ScholarType,
  MinorityCommunity,
  AuthUser
} from '../types';
import { INDIAN_STATES } from '../data/scholarships';

interface StudentFormProps {
  initialProfile: StudentProfile | null;
  authUser?: AuthUser | null;
  onSubmit: (profile: StudentProfile) => void;
  onCancel: () => void;
}

interface RawFormState {
  fullName: string;
  age: string;
  gender: string;
  state: string;
  district: string;
  nationality: string;
  residence: string;
  hasDisability: boolean | null;
  disabilityPercentage: string;

  educationLevel: string;
  course: string;
  institutionName: string;
  institutionType: string;
  currentYear: string;
  prevExamPercentage: string;
  currentCgpaOrPercentage: string;

  category: string;
  isMinority: boolean | null;
  minorityCommunity: string;

  annualFamilyIncome: string;
  parentOccupation: string;
  familyMembersCount: string;
  siblingsStudyingCount: string;
  hasIncomeCertificate: boolean | null;

  scholarType: string;
  alreadyReceivesScholarship: boolean | null;
  existingScholarshipName: string;
  sportsAchievements: string;
  academicAchievements: string;
}

const getBlankState = (): RawFormState => ({
  fullName: '',
  age: '',
  gender: '',
  state: '',
  district: '',
  nationality: '',
  residence: '',
  hasDisability: null,
  disabilityPercentage: '',

  educationLevel: '',
  course: '',
  institutionName: '',
  institutionType: '',
  currentYear: '',
  prevExamPercentage: '',
  currentCgpaOrPercentage: '',

  category: '',
  isMinority: null,
  minorityCommunity: '',

  annualFamilyIncome: '',
  parentOccupation: '',
  familyMembersCount: '',
  siblingsStudyingCount: '',
  hasIncomeCertificate: null,

  scholarType: '',
  alreadyReceivesScholarship: null,
  existingScholarshipName: '',
  sportsAchievements: '',
  academicAchievements: ''
});

const populateFromProfile = (profile: StudentProfile): RawFormState => ({
  fullName: profile.fullName || '',
  age: profile.age ? String(profile.age) : '',
  gender: profile.gender || '',
  state: profile.state || '',
  district: profile.district || '',
  nationality: profile.nationality || '',
  residence: profile.residence || '',
  hasDisability: profile.hasDisability ?? null,
  disabilityPercentage: profile.disabilityPercentage ? String(profile.disabilityPercentage) : '',

  educationLevel: profile.educationLevel || '',
  course: profile.course || '',
  institutionName: profile.institutionName || '',
  institutionType: profile.institutionType || '',
  currentYear: profile.currentYear ? String(profile.currentYear) : '',
  prevExamPercentage: profile.prevExamPercentage !== undefined && profile.prevExamPercentage !== null && profile.prevExamPercentage > 0 ? String(profile.prevExamPercentage) : '',
  currentCgpaOrPercentage: profile.currentCgpaOrPercentage !== undefined && profile.currentCgpaOrPercentage !== null && profile.currentCgpaOrPercentage > 0 ? String(profile.currentCgpaOrPercentage) : '',

  category: profile.category || '',
  isMinority: profile.isMinority ?? null,
  minorityCommunity: profile.minorityCommunity || '',

  annualFamilyIncome: profile.annualFamilyIncome !== undefined && profile.annualFamilyIncome !== null ? String(profile.annualFamilyIncome) : '',
  parentOccupation: profile.parentOccupation || '',
  familyMembersCount: profile.familyMembersCount !== undefined && profile.familyMembersCount !== null ? String(profile.familyMembersCount) : '',
  siblingsStudyingCount: profile.siblingsStudyingCount !== undefined && profile.siblingsStudyingCount !== null ? String(profile.siblingsStudyingCount) : '',
  hasIncomeCertificate: profile.hasIncomeCertificate ?? null,

  scholarType: profile.scholarType || '',
  alreadyReceivesScholarship: profile.alreadyReceivesScholarship ?? null,
  existingScholarshipName: profile.existingScholarshipName || '',
  sportsAchievements: profile.sportsAchievements || '',
  academicAchievements: profile.academicAchievements || ''
});

export const StudentForm: React.FC<StudentFormProps> = ({
  initialProfile,
  authUser,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestVisitedStep, setHighestVisitedStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasLoadedSavedProfile, setHasLoadedSavedProfile] = useState<boolean>(false);

  // Initialize: Only populate if an authenticated user explicitly has a saved profile with real data
  const [formData, setFormData] = useState<RawFormState>(() => {
    if (authUser && initialProfile && initialProfile.fullName && initialProfile.fullName.trim() !== '') {
      return populateFromProfile(initialProfile);
    }
    return getBlankState();
  });

  useEffect(() => {
    if (authUser && initialProfile && initialProfile.fullName && initialProfile.fullName.trim() !== '') {
      setFormData(populateFromProfile(initialProfile));
      setHasLoadedSavedProfile(true);
    } else {
      setHasLoadedSavedProfile(false);
    }
  }, [authUser, initialProfile]);

  const updateField = <K extends keyof RawFormState>(key: K, value: RawFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to clear all entered details and start fresh?')) {
      setFormData(getBlankState());
      setErrors({});
      setCurrentStep(1);
      setHighestVisitedStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full Name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Enter your full legal name';
      }

      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      } else {
        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum) || ageNum < 12 || ageNum > 65) {
          newErrors.age = 'Enter a valid age between 12 and 65';
        }
      }

      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }

      if (!formData.state) {
        newErrors.state = 'Please select your state of domicile';
      }

      if (!formData.district.trim()) {
        newErrors.district = 'District is required';
      }

      if (!formData.nationality.trim()) {
        newErrors.nationality = 'Nationality is required (e.g. Indian)';
      }

      if (!formData.residence) {
        newErrors.residence = 'Please select your area of residence';
      }

      if (formData.hasDisability === null) {
        newErrors.hasDisability = 'Please specify disability status';
      } else if (formData.hasDisability) {
        const pct = parseInt(formData.disabilityPercentage, 10);
        if (!formData.disabilityPercentage || isNaN(pct) || pct < 40 || pct > 100) {
          newErrors.disabilityPercentage = 'Certified disability must be at least 40% (40–100)';
        }
      }
    }

    if (step === 2) {
      if (!formData.educationLevel) {
        newErrors.educationLevel = 'Please select your current education level';
      }

      if (!formData.course.trim()) {
        newErrors.course = 'Course name & branch is required (e.g. B.Tech CS, PUC Science)';
      }

      if (!formData.institutionName.trim()) {
        newErrors.institutionName = 'College / University / School name is required';
      }

      if (!formData.institutionType) {
        newErrors.institutionType = 'Please select institution management type';
      }

      if (!formData.currentYear) {
        newErrors.currentYear = 'Please select your current year of study';
      }

      if (!formData.prevExamPercentage.trim()) {
        newErrors.prevExamPercentage = 'Previous exam score percentage is required';
      } else {
        const pct = parseFloat(formData.prevExamPercentage);
        if (isNaN(pct) || pct <= 0 || pct > 100) {
          newErrors.prevExamPercentage = 'Enter a valid percentage between 1 and 100';
        }
      }

      if (formData.currentCgpaOrPercentage.trim()) {
        const cgpa = parseFloat(formData.currentCgpaOrPercentage);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 100) {
          newErrors.currentCgpaOrPercentage = 'Enter valid CGPA (0–10) or percentage (0–100)';
        }
      }
    }

    if (step === 3) {
      if (!formData.category) {
        newErrors.category = 'Please select your social / reservation category';
      }

      if (formData.isMinority === null) {
        newErrors.isMinority = 'Please indicate religious minority status';
      } else if (formData.isMinority && !formData.minorityCommunity) {
        newErrors.minorityCommunity = 'Please select your minority community';
      }
    }

    if (step === 4) {
      if (!formData.annualFamilyIncome.trim()) {
        newErrors.annualFamilyIncome = 'Annual family income is required';
      } else {
        const inc = parseInt(formData.annualFamilyIncome, 10);
        if (isNaN(inc) || inc < 0) {
          newErrors.annualFamilyIncome = 'Enter a valid income amount';
        }
      }

      if (!formData.parentOccupation.trim()) {
        newErrors.parentOccupation = 'Parent or guardian occupation is required';
      }

      if (!formData.familyMembersCount.trim()) {
        newErrors.familyMembersCount = 'Household member count is required';
      } else {
        const count = parseInt(formData.familyMembersCount, 10);
        if (isNaN(count) || count < 1) {
          newErrors.familyMembersCount = 'Enter at least 1 family member';
        }
      }

      if (!formData.siblingsStudyingCount.trim()) {
        newErrors.siblingsStudyingCount = 'Studying siblings count is required';
      } else {
        const sib = parseInt(formData.siblingsStudyingCount, 10);
        if (isNaN(sib) || sib < 0) {
          newErrors.siblingsStudyingCount = 'Enter valid siblings count (0 or more)';
        }
      }

      if (formData.hasIncomeCertificate === null) {
        newErrors.hasIncomeCertificate = 'Please specify if you hold a valid income certificate';
      }
    }

    if (step === 5) {
      if (!formData.scholarType) {
        newErrors.scholarType = 'Please select accommodation type (Day Scholar or Hostel)';
      }

      if (formData.alreadyReceivesScholarship === null) {
        newErrors.alreadyReceivesScholarship = 'Please indicate whether you receive another scholarship';
      } else if (formData.alreadyReceivesScholarship && !formData.existingScholarshipName.trim()) {
        newErrors.existingScholarshipName = 'Please enter the name of your current scholarship';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 5);
      setCurrentStep(nextStep);
      setHighestVisitedStep((prev) => Math.max(prev, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepJump = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep > currentStep && targetStep <= highestVisitedStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      const finalProfile: StudentProfile = {
        fullName: formData.fullName.trim(),
        age: parseInt(formData.age, 10) || 18,
        gender: (formData.gender || 'male') as Gender,
        state: formData.state,
        district: formData.district.trim(),
        nationality: formData.nationality.trim() || 'Indian',
        residence: (formData.residence || 'Urban') as ResidenceType,
        hasDisability: Boolean(formData.hasDisability),
        disabilityPercentage: formData.hasDisability ? parseInt(formData.disabilityPercentage, 10) || 40 : undefined,

        educationLevel: (formData.educationLevel || 'Undergraduate') as EducationLevel,
        course: formData.course.trim(),
        institutionName: formData.institutionName.trim(),
        institutionType: (formData.institutionType || 'Government') as InstitutionType,
        currentYear: parseInt(formData.currentYear, 10) || 1,
        prevExamPercentage: parseFloat(formData.prevExamPercentage) || 0,
        currentCgpaOrPercentage: formData.currentCgpaOrPercentage ? parseFloat(formData.currentCgpaOrPercentage) : 0,

        category: (formData.category || 'General') as CasteCategory,
        isMinority: Boolean(formData.isMinority),
        minorityCommunity: formData.isMinority ? (formData.minorityCommunity as MinorityCommunity) : 'None',

        annualFamilyIncome: parseInt(formData.annualFamilyIncome, 10) || 0,
        parentOccupation: formData.parentOccupation.trim(),
        familyMembersCount: parseInt(formData.familyMembersCount, 10) || 1,
        siblingsStudyingCount: parseInt(formData.siblingsStudyingCount, 10) || 0,
        hasIncomeCertificate: Boolean(formData.hasIncomeCertificate),

        scholarType: (formData.scholarType || 'Day Scholar') as ScholarType,
        alreadyReceivesScholarship: Boolean(formData.alreadyReceivesScholarship),
        existingScholarshipName: formData.alreadyReceivesScholarship ? formData.existingScholarshipName.trim() : undefined,
        sportsAchievements: formData.sportsAchievements.trim() || undefined,
        academicAchievements: formData.academicAchievements.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      onSubmit(finalProfile);
    }
  };

  const stepsMeta = [
    { number: 1, title: 'Personal Info', subtext: 'Identity & Domicile', icon: User },
    { number: 2, title: 'Education', subtext: 'Course & Academics', icon: GraduationCap },
    { number: 3, title: 'Social Category', subtext: 'Reservation Quota', icon: Users },
    { number: 4, title: 'Family & Finance', subtext: 'Income & Means', icon: IndianRupee },
    { number: 5, title: 'Additional Details', subtext: 'Hostel & Review', icon: Award }
  ];

  const completionPercentage = Math.round((currentStep / 5) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner if authenticated saved profile is loaded */}
      {hasLoadedSavedProfile && authUser && (
        <div className="mb-6 p-4 bg-white border border-[#159A80]/30 rounded-xl flex items-center justify-between gap-3 text-xs text-[#202B38] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#159A80] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#142B4A]">
                Saved profile loaded for {authUser.name}
              </p>
              <p className="text-[#718096]">
                You can review or update any information before calculating new scholarship matches.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3 py-1.5 text-xs font-semibold text-[#142B4A] bg-[#F7F8F5] border border-[#E5EAE8] rounded-lg hover:bg-slate-100 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#718096]" />
            <span>Start Fresh</span>
          </button>
        </div>
      )}

      {/* Main Progressive Multi-Step Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAE8] shadow-xs overflow-hidden transition-all">
        {/* Step Indicator Header */}
        <div className="p-6 sm:p-7 border-b border-[#E5EAE8] bg-[#F7F8F5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#159A80] uppercase tracking-widest font-mono bg-[#159A80]/10 border border-[#159A80]/20 px-2 py-0.5 rounded-md">
                  Step {currentStep} of 5
                </span>
                <span className="text-xs text-[#718096]">·</span>
                <span className="text-xs text-[#718096] font-medium">Takes ~2 mins</span>
              </div>
              <h2 className="text-2xl font-bold text-[#142B4A] font-display tracking-tight">
                {stepsMeta[currentStep - 1].title}
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                {stepsMeta[currentStep - 1].subtext} · Accurate details ensure 100% rule-based matching.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-bold text-[#142B4A] font-mono tabular-nums">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] text-[#718096] uppercase tracking-wider font-semibold">
                  Progress
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                title="Reset all form fields to blank"
                className="p-2 text-slate-400 hover:text-[#142B4A] hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Visual Bar */}
          <div className="relative mb-6">
            <div className="w-full h-1.5 bg-[#E5EAE8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#159A80] transition-all duration-300 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {stepsMeta.map((s) => {
              const Icon = s.icon;
              const isPassed = s.number < currentStep;
              const isCurrent = s.number === currentStep;
              const isClickable = s.number <= highestVisitedStep;

              return (
                <button
                  type="button"
                  key={s.number}
                  onClick={() => isClickable && handleStepJump(s.number)}
                  disabled={!isClickable}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white border-[#142B4A] shadow-xs ring-1 ring-[#142B4A]/10'
                      : isPassed
                      ? 'bg-white border-[#159A80]/40 text-[#159A80] hover:border-[#159A80] cursor-pointer'
                      : 'bg-[#F7F8F5]/80 border-[#E5EAE8] text-[#718096] cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-[#142B4A] text-white'
                          : isPassed
                          ? 'bg-[#159A80] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : s.number}
                    </div>
                    <Icon
                      className={`w-3.5 h-3.5 hidden sm:block ${
                        isCurrent
                          ? 'text-[#142B4A]'
                          : isPassed
                          ? 'text-[#159A80]'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <span
                      className={`block text-xs font-bold truncate ${
                        isCurrent
                          ? 'text-[#142B4A]'
                          : isPassed
                          ? 'text-[#159A80]'
                          : 'text-[#718096]'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Step Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* Validation Notice */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Please provide all mandatory details to proceed:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                  {Object.values(errors).slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {Object.values(errors).length > 3 && (
                    <li>...and {Object.values(errors).length - 3} other items</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Full Name (As per Aadhaar / School Records) *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Enter your official full name"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] transition-all text-[#202B38] ${
                      errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={65}
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="e.g. 19"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38] ${
                      errors.age ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.age && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                    </p>
                  )}
                </div>

                {/* Gender Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.gender ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Transgender</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.gender}
                    </p>
                  )}
                  <p className="text-[11px] text-[#718096] mt-1">
                    Used to match schemes like AICTE Pragati, Santoor, and Fair & Lovely.
                  </p>
                </div>

                {/* State of Domicile */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    State of Domicile / Permanent Residence *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.state ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  >
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.state}
                    </p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    placeholder="e.g. Bengaluru Urban, Pune, Raichur, Patna"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.district ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.district && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.district}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="e.g. Indian"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.nationality ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.nationality && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.nationality}
                    </p>
                  )}
                </div>

                {/* Residence Area Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Area of Residence *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('residence', 'Urban')}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        formData.residence === 'Urban'
                          ? 'bg-[#159A80]/10 border-[#159A80] text-[#142B4A] ring-1 ring-[#159A80]/20'
                          : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
                      }`}
                    >
                      Urban / City
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('residence', 'Rural')}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        formData.residence === 'Rural'
                          ? 'bg-[#159A80]/10 border-[#159A80] text-[#142B4A] ring-1 ring-[#159A80]/20'
                          : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
                      }`}
                    >
                      Rural / Village
                    </button>
                  </div>
                  {errors.residence && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.residence}
                    </p>
                  )}
                </div>

                {/* Benchmark Disability (PwD) */}
                <div className="sm:col-span-2 p-4 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Person with Benchmark Disability (PwD)? *
                  </label>
                  <div className="flex items-center gap-5 mt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="pwdStatus"
                        checked={formData.hasDisability === true}
                        onChange={() => updateField('hasDisability', true)}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>Yes (UDID certified ≥ 40%)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="pwdStatus"
                        checked={formData.hasDisability === false}
                        onChange={() => {
                          updateField('hasDisability', false);
                          updateField('disabilityPercentage', '');
                        }}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.hasDisability && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.hasDisability}
                    </p>
                  )}

                  {formData.hasDisability === true && (
                    <div className="mt-3 pt-3 border-t border-[#E5EAE8]">
                      <label className="block text-xs font-medium text-[#202B38] mb-1">
                        Disability Percentage (%) as per UDID card *
                      </label>
                      <input
                        type="number"
                        min={40}
                        max={100}
                        value={formData.disabilityPercentage}
                        onChange={(e) => updateField('disabilityPercentage', e.target.value)}
                        placeholder="e.g. 45"
                        className={`w-36 px-3 py-2 text-xs bg-white border rounded-lg tabular-nums ${
                          errors.disabilityPercentage ? 'border-rose-400' : 'border-[#E5EAE8]'
                        }`}
                      />
                      {errors.disabilityPercentage && (
                        <p className="text-xs text-rose-500 mt-1">{errors.disabilityPercentage}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: EDUCATIONAL INFORMATION ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Current Education Level */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Current Education Level *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => updateField('educationLevel', e.target.value)}
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.educationLevel ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  >
                    <option value="" disabled>Select Education Level</option>
                    <option value="SSLC">SSLC (Class 10th)</option>
                    <option value="PUC / 12th">PUC / Class 12th / Intermediate</option>
                    <option value="Diploma">Polytechnic Diploma</option>
                    <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / B.Com / MBBS / etc.)</option>
                    <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MBA / etc.)</option>
                    <option value="PhD">Doctorate / PhD</option>
                  </select>
                  {errors.educationLevel && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.educationLevel}
                    </p>
                  )}
                </div>

                {/* Course & Branch */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Current Course & Branch *
                  </label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => updateField('course', e.target.value)}
                    placeholder="e.g. B.Tech Computer Science, B.Sc Physics, PUC Science"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.course ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.course && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.course}
                    </p>
                  )}
                </div>

                {/* Institution Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    College / University / School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => updateField('institutionName', e.target.value)}
                    placeholder="e.g. Government Engineering College, BMSCE, IIT Bombay, St. Joseph's"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.institutionName ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.institutionName && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.institutionName}
                    </p>
                  )}
                </div>

                {/* Institution Management Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Institution Management Type *
                  </label>
                  <select
                    value={formData.institutionType}
                    onChange={(e) => updateField('institutionType', e.target.value)}
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.institutionType ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  >
                    <option value="" disabled>Select Institution Type</option>
                    <option value="Government">Government / State University</option>
                    <option value="Aided">Government Aided (Private Trust)</option>
                    <option value="Private">Private / Deemed University</option>
                  </select>
                  {errors.institutionType && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.institutionType}
                    </p>
                  )}
                </div>

                {/* Current Year */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Current Year of Study *
                  </label>
                  <select
                    value={formData.currentYear}
                    onChange={(e) => updateField('currentYear', e.target.value)}
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38] ${
                      errors.currentYear ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  >
                    <option value="" disabled>Select Year of Study</option>
                    <option value="1">1st Year (Fresh Admission)</option>
                    <option value="2">2nd Year (Lateral / Regular)</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year (Final)</option>
                    <option value="5">5th Year</option>
                  </select>
                  {errors.currentYear && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.currentYear}
                    </p>
                  )}
                </div>

                {/* Previous Exam Percentage */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Previous Board / Exam Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={formData.prevExamPercentage}
                    onChange={(e) => updateField('prevExamPercentage', e.target.value)}
                    placeholder="e.g. 84.5"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38] ${
                      errors.prevExamPercentage ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.prevExamPercentage && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.prevExamPercentage}
                    </p>
                  )}
                  <p className="text-[11px] text-[#718096] mt-1">
                    Class 10th score (for PUC) or Class 12th score (for UG admissions).
                  </p>
                </div>

                {/* Current Semester CGPA */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Current Semester CGPA or Percentage (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={formData.currentCgpaOrPercentage}
                    onChange={(e) => updateField('currentCgpaOrPercentage', e.target.value)}
                    placeholder="e.g. 8.5 (on 10 scale) or 85%"
                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5EAE8] hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38]"
                  />
                  <p className="text-[11px] text-[#718096] mt-1">
                    If enrolled in higher semesters, enter your latest cumulative CGPA.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CATEGORY INFORMATION ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Social Caste Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-2">
                    Social Caste / Reservation Category *
                  </label>
                  <div className="space-y-2">
                    {(['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] as CasteCategory[]).map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          formData.category === cat
                            ? 'bg-[#159A80]/10 border-[#159A80] text-[#142B4A] font-semibold ring-1 ring-[#159A80]/20'
                            : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
                        }`}
                      >
                        <span className="text-sm">{cat}</span>
                        <input
                          type="radio"
                          name="casteCategory"
                          checked={formData.category === cat}
                          onChange={() => updateField('category', cat)}
                          className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.category}
                    </p>
                  )}
                </div>

                {/* Religious Minority Status */}
                <div className="space-y-4">
                  <div className="p-5 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                    <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                      Religious Minority Status *
                    </label>
                    <p className="text-xs text-[#718096] mb-3.5 leading-relaxed">
                      Do you belong to a notified religious minority community as per Ministry of Minority Affairs guidelines?
                    </p>

                    <div className="flex items-center gap-5 mb-3.5">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                        <input
                          type="radio"
                          name="minorityStatus"
                          checked={formData.isMinority === true}
                          onChange={() => updateField('isMinority', true)}
                          className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                        <input
                          type="radio"
                          name="minorityStatus"
                          checked={formData.isMinority === false}
                          onChange={() => {
                            updateField('isMinority', false);
                            updateField('minorityCommunity', '');
                          }}
                          className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {errors.isMinority && (
                      <p className="text-xs text-rose-500 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.isMinority}
                      </p>
                    )}

                    {formData.isMinority === true && (
                      <div className="pt-3 border-t border-[#E5EAE8]">
                        <label className="block text-xs font-medium text-[#202B38] mb-1.5">
                          Select Minority Community *
                        </label>
                        <select
                          value={formData.minorityCommunity}
                          onChange={(e) => updateField('minorityCommunity', e.target.value)}
                          className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38] ${
                            errors.minorityCommunity ? 'border-rose-400' : 'border-[#E5EAE8]'
                          }`}
                        >
                          <option value="" disabled>Select Minority Community</option>
                          <option value="Muslim">Muslim</option>
                          <option value="Christian">Christian</option>
                          <option value="Sikh">Sikh</option>
                          <option value="Buddhist">Buddhist</option>
                          <option value="Jain">Jain</option>
                          <option value="Parsi">Parsi</option>
                        </select>
                        {errors.minorityCommunity && (
                          <p className="text-xs text-rose-500 mt-1">{errors.minorityCommunity}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: FAMILY FINANCIAL INFORMATION ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Annual Family Income */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider">
                      Annual Gross Family Income (₹ INR) *
                    </label>
                    {formData.annualFamilyIncome && !isNaN(parseInt(formData.annualFamilyIncome, 10)) && (
                      <span className="text-sm font-bold text-[#159A80] font-mono tabular-nums">
                        ₹{parseInt(formData.annualFamilyIncome, 10).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <input
                    type="number"
                    step={1000}
                    min={0}
                    value={formData.annualFamilyIncome}
                    onChange={(e) => updateField('annualFamilyIncome', e.target.value)}
                    placeholder="Enter total family annual income e.g. 180000"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] font-mono tabular-nums text-[#202B38] ${
                      errors.annualFamilyIncome ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.annualFamilyIncome && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.annualFamilyIncome}
                    </p>
                  )}
                  <p className="text-[11px] text-[#718096] mt-1.5">
                    Include combined income of both parents/guardians from all sources (agriculture, salary, business).
                  </p>
                </div>

                {/* Parent Occupation */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Parent / Guardian Occupation *
                  </label>
                  <input
                    type="text"
                    value={formData.parentOccupation}
                    onChange={(e) => updateField('parentOccupation', e.target.value)}
                    placeholder="e.g. Farmer, Private Driver, Teacher, Clerk, Self-employed"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] text-[#202B38] ${
                      errors.parentOccupation ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.parentOccupation && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.parentOccupation}
                    </p>
                  )}
                </div>

                {/* Total Family Members */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Total Family Members in Household *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.familyMembersCount}
                    onChange={(e) => updateField('familyMembersCount', e.target.value)}
                    placeholder="e.g. 4"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38] ${
                      errors.familyMembersCount ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.familyMembersCount && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.familyMembersCount}
                    </p>
                  )}
                </div>

                {/* Siblings Studying */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Number of Siblings Currently Studying *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={formData.siblingsStudyingCount}
                    onChange={(e) => updateField('siblingsStudyingCount', e.target.value)}
                    placeholder="e.g. 1"
                    className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] focus:border-[#159A80] tabular-nums text-[#202B38] ${
                      errors.siblingsStudyingCount ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5EAE8] hover:border-slate-300'
                    }`}
                  />
                  {errors.siblingsStudyingCount && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.siblingsStudyingCount}
                    </p>
                  )}
                </div>

                {/* Income Certificate Status */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Do you have a valid Government Income Certificate? *
                  </label>
                  <div className="flex items-center gap-5 mt-2.5">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="incomeCertOption"
                        checked={formData.hasIncomeCertificate === true}
                        onChange={() => updateField('hasIncomeCertificate', true)}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>Yes (Tehsildar / Revenue Dept)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="incomeCertOption"
                        checked={formData.hasIncomeCertificate === false}
                        onChange={() => updateField('hasIncomeCertificate', false)}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>Not yet / In progress</span>
                    </label>
                  </div>
                  {errors.hasIncomeCertificate && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.hasIncomeCertificate}
                    </p>
                  )}
                  <p className="text-[11px] text-[#718096] mt-1.5">
                    Without an income certificate, schemes requiring strict means will be flagged as "Possibly Eligible (Needs Verification)".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: ADDITIONAL INFORMATION & REVIEW ================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Accommodation Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Accommodation Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('scholarType', 'Day Scholar')}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        formData.scholarType === 'Day Scholar'
                          ? 'bg-[#159A80]/10 border-[#159A80] text-[#142B4A] ring-1 ring-[#159A80]/20'
                          : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
                      }`}
                    >
                      Day Scholar (Home)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('scholarType', 'Hostel')}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        formData.scholarType === 'Hostel'
                          ? 'bg-[#159A80]/10 border-[#159A80] text-[#142B4A] ring-1 ring-[#159A80]/20'
                          : 'bg-white border-[#E5EAE8] text-[#718096] hover:bg-[#F7F8F5]'
                      }`}
                    >
                      Hosteller (Hostel)
                    </button>
                  </div>
                  {errors.scholarType && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.scholarType}
                    </p>
                  )}
                  <p className="text-[11px] text-[#718096] mt-1">
                    Hostellers qualify for additional maintenance allowances under Post-Matric schemes.
                  </p>
                </div>

                {/* Already Receives Scholarship */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Do you already receive another scholarship? *
                  </label>
                  <div className="flex items-center gap-5 mt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="otherScholarshipStatus"
                        checked={formData.alreadyReceivesScholarship === true}
                        onChange={() => updateField('alreadyReceivesScholarship', true)}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202B38] cursor-pointer">
                      <input
                        type="radio"
                        name="otherScholarshipStatus"
                        checked={formData.alreadyReceivesScholarship === false}
                        onChange={() => {
                          updateField('alreadyReceivesScholarship', false);
                          updateField('existingScholarshipName', '');
                        }}
                        className="text-[#159A80] focus:ring-[#159A80] w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.alreadyReceivesScholarship && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.alreadyReceivesScholarship}
                    </p>
                  )}

                  {formData.alreadyReceivesScholarship === true && (
                    <div className="mt-3 pt-3 border-t border-[#E5EAE8]">
                      <label className="block text-xs font-medium text-[#202B38] mb-1">
                        Name of Existing Scholarship *
                      </label>
                      <input
                        type="text"
                        value={formData.existingScholarshipName}
                        onChange={(e) => updateField('existingScholarshipName', e.target.value)}
                        placeholder="e.g. NSP Pre-Matric, State Merit"
                        className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-[#202B38] ${
                          errors.existingScholarshipName ? 'border-rose-400' : 'border-[#E5EAE8]'
                        }`}
                      />
                      {errors.existingScholarshipName && (
                        <p className="text-xs text-rose-500 mt-1">{errors.existingScholarshipName}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Sports Achievements */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Sports Achievements (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.sportsAchievements}
                    onChange={(e) => updateField('sportsAchievements', e.target.value)}
                    placeholder="e.g. District badminton, State athletic meet"
                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5EAE8] hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38]"
                  />
                </div>

                {/* Academic Achievements */}
                <div>
                  <label className="block text-xs font-semibold text-[#142B4A] uppercase tracking-wider mb-1.5">
                    Academic Achievements (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.academicAchievements}
                    onChange={(e) => updateField('academicAchievements', e.target.value)}
                    placeholder="e.g. State rank top 5%, NTSE scholar, Olympiad"
                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5EAE8] hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A80] text-[#202B38]"
                  />
                </div>
              </div>

              {/* Review Summary Card before final submit */}
              <div className="mt-8 p-5 bg-[#F7F8F5] rounded-xl border border-[#E5EAE8]">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#159A80]" />
                  <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                    Profile Review Summary
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#E5EAE8]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold block">Applicant</span>
                    <span className="font-bold text-[#142B4A] truncate block">
                      {formData.fullName || '—'}
                    </span>
                    <span className="text-[11px] text-[#718096] capitalize">
                      {formData.gender || '—'}, {formData.age || '—'} yrs
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E5EAE8]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold block">Academic</span>
                    <span className="font-bold text-[#142B4A] truncate block">
                      {formData.course || '—'}
                    </span>
                    <span className="text-[11px] text-[#718096]">
                      Yr {formData.currentYear || '—'} · {formData.prevExamPercentage ? `${formData.prevExamPercentage}%` : '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E5EAE8]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold block">Category & State</span>
                    <span className="font-bold text-[#142B4A] truncate block">
                      {formData.category || '—'}
                    </span>
                    <span className="text-[11px] text-[#718096] truncate block">
                      {formData.state || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E5EAE8]">
                    <span className="text-[10px] text-[#718096] uppercase font-semibold block">Income</span>
                    <span className="font-bold text-[#159A80] font-mono block">
                      {formData.annualFamilyIncome ? `₹${parseInt(formData.annualFamilyIncome, 10).toLocaleString('en-IN')}` : '—'}
                    </span>
                    <span className="text-[11px] text-[#718096]">
                      {formData.hasIncomeCertificate ? 'Cert: Yes' : 'Cert: Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[#E5EAE8] flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 text-xs font-semibold text-[#142B4A] bg-white border border-[#E5EAE8] hover:bg-[#F7F8F5] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs font-semibold text-[#718096] hover:text-[#142B4A] transition-colors cursor-pointer"
                >
                  Back to Home
                </button>
              )}
            </div>

            <div>
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#244C74] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next: {stepsMeta[currentStep].title}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#159A80] hover:bg-[#12826C] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Profile & Calculate Matches</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
