import { StudentProfile, Scholarship, MatchResult, MatchStatus } from '../types';

export function evaluateScholarship(student: StudentProfile, scholarship: Scholarship): MatchResult {
  const matchedReasons: string[] = [];
  const missingOrPendingVerifications: string[] = [];
  const exclusionReasons: string[] = [];

  const rules = scholarship.rules;

  // 1. Gender Verification
  if (rules.allowedGenders && rules.allowedGenders.length > 0) {
    if (!rules.allowedGenders.includes(student.gender as any)) {
      exclusionReasons.push(
        `This scholarship is exclusively reserved for ${rules.allowedGenders.join(', ')} applicants.`
      );
    } else {
      matchedReasons.push(
        `Applicant gender (${student.gender.toUpperCase()}) matches the scheme requirements.`
      );
    }
  }

  // 2. State / Domicile Verification
  if (rules.allowedStates && rules.allowedStates.length > 0) {
    const isStateMatch = rules.allowedStates.some(
      (st) => st.toLowerCase() === student.state.trim().toLowerCase()
    );
    if (!isStateMatch) {
      exclusionReasons.push(
        `Restricted to permanent residents of ${rules.allowedStates.join(', ')}. (Your state: ${student.state})`
      );
    } else {
      matchedReasons.push(
        `State domicile (${student.state}) satisfies the geographic eligibility condition.`
      );
    }
  }

  // 3. Education Level Verification
  if (rules.allowedEducationLevels && rules.allowedEducationLevels.length > 0) {
    if (!rules.allowedEducationLevels.includes(student.educationLevel)) {
      exclusionReasons.push(
        `Requires enrollment in ${rules.allowedEducationLevels.join(' or ')}. (Current level: ${student.educationLevel})`
      );
    } else {
      matchedReasons.push(
        `Current education level (${student.educationLevel}) qualifies for this scheme.`
      );
    }
  }

  // 4. Caste / Category Verification
  if (rules.allowedCategories && rules.allowedCategories.length > 0) {
    if (!rules.allowedCategories.includes(student.category)) {
      exclusionReasons.push(
        `Category requirement: ${rules.allowedCategories.join(' / ')}. (Your category: ${student.category})`
      );
    } else {
      matchedReasons.push(
        `Social category (${student.category}) qualifies for this scheme quota.`
      );
    }
  }

  // 5. Minority Requirement Verification
  if (rules.requiresMinority) {
    if (!student.isMinority) {
      exclusionReasons.push('Exclusively intended for students from recognized religious minority communities.');
    } else {
      matchedReasons.push(
        `Notified minority community status satisfies the scheme requirement.`
      );
    }
  }

  // 6. Disability Requirement Verification
  if (rules.requiresDisability) {
    if (!student.hasDisability) {
      exclusionReasons.push('Mandatory requirement: Specially abled candidate with certified disability.');
    } else if (
      rules.minDisabilityPercentage &&
      (student.disabilityPercentage || 0) < rules.minDisabilityPercentage
    ) {
      exclusionReasons.push(
        `Certified disability must be at least ${rules.minDisabilityPercentage}% (Recorded: ${student.disabilityPercentage || 0}%).`
      );
    } else {
      matchedReasons.push(
        `Disability status verified (${student.disabilityPercentage || 40}% UDID certified benchmark satisfied).`
      );
    }
  }

  // 7. Academic Score / Percentage Verification
  if (rules.minPercentage !== undefined && rules.minPercentage !== null) {
    const studentScore = Math.max(
      student.prevExamPercentage || 0,
      (student.currentCgpaOrPercentage && student.currentCgpaOrPercentage <= 10)
        ? student.currentCgpaOrPercentage * 9.5
        : (student.currentCgpaOrPercentage || 0)
    );

    if (studentScore < rules.minPercentage) {
      exclusionReasons.push(
        `Academic percentage ${studentScore.toFixed(1)}% is below the minimum cut-off requirement of ${rules.minPercentage}%.`
      );
    } else {
      matchedReasons.push(
        `Academic score of ${studentScore.toFixed(1)}% satisfies the minimum threshold of ${rules.minPercentage}%.`
      );
    }
  }

  // 8. Annual Family Income Verification
  if (rules.maxIncome !== undefined && rules.maxIncome !== null) {
    if (student.annualFamilyIncome > rules.maxIncome) {
      exclusionReasons.push(
        `Annual family income of ₹${student.annualFamilyIncome.toLocaleString('en-IN')} exceeds the ceiling limit of ₹${rules.maxIncome.toLocaleString('en-IN')}.`
      );
    } else {
      matchedReasons.push(
        `Annual family income (₹${student.annualFamilyIncome.toLocaleString('en-IN')}) is within the permissible limit of ₹${rules.maxIncome.toLocaleString('en-IN')}.`
      );

      // Check if government income certificate is verified
      if (!student.hasIncomeCertificate) {
        missingOrPendingVerifications.push(
          'Requires issuance and verification of a valid Revenue Dept Income Certificate.'
        );
      }
    }
  }

  // 9. Existing Concurrent Scholarship Verification
  if (rules.disallowOtherScholarships && student.alreadyReceivesScholarship) {
    exclusionReasons.push(
      `Central guideline prohibits availing this scholarship while receiving other government financial aid (${student.existingScholarshipName || 'existing scheme'}).`
    );
  }

  // 10. Course Keyword / Discipline Match (e.g. Science for INSPIRE)
  if (rules.courseKeywordMatch && rules.courseKeywordMatch.length > 0) {
    const courseText = `${student.course} ${student.educationLevel}`.toLowerCase();
    const hasKeyword = rules.courseKeywordMatch.some((kw) =>
      courseText.includes(kw.toLowerCase())
    );
    if (!hasKeyword) {
      exclusionReasons.push(
        `Restricted to natural and basic sciences courses (${rules.courseKeywordMatch.slice(0, 5).join(', ')}). Your course: ${student.course}.`
      );
    } else {
      matchedReasons.push(`Course discipline matches eligible scientific study domain.`);
    }
  }

  // 11. Institution Type Verification (if constrained)
  if (rules.allowedInstitutionTypes && rules.allowedInstitutionTypes.length > 0) {
    if (!rules.allowedInstitutionTypes.includes(student.institutionType)) {
      missingOrPendingVerifications.push(
        `Requires institution recognition verification (${rules.allowedInstitutionTypes.join('/')}).`
      );
    } else {
      matchedReasons.push(`Enrolled in eligible ${student.institutionType} institution.`);
    }
  }

  // Document requirement checks for pending verification
  if (student.category !== 'General' && !student.hasIncomeCertificate) {
    missingOrPendingVerifications.push(
      'Caste and Income certificate digital verification with barcode/RD number required.'
    );
  }

  // Determine final status
  let status: MatchStatus = 'NOT_ELIGIBLE';

  if (exclusionReasons.length > 0) {
    status = 'NOT_ELIGIBLE';
  } else if (missingOrPendingVerifications.length > 0) {
    status = 'POSSIBLY_ELIGIBLE';
  } else {
    status = 'ELIGIBLE';
  }

  return {
    scholarship,
    status,
    matchedReasons,
    missingOrPendingVerifications,
    exclusionReasons
  };
}

export function matchAllScholarships(student: StudentProfile, database: Scholarship[]): MatchResult[] {
  const results = database.map((scholarship) => evaluateScholarship(student, scholarship));

  // Sort by ELIGIBLE first, then POSSIBLY_ELIGIBLE, then NOT_ELIGIBLE
  // Within same status, sort by amountValue descending
  const statusPriority: Record<MatchStatus, number> = {
    ELIGIBLE: 1,
    POSSIBLY_ELIGIBLE: 2,
    NOT_ELIGIBLE: 3
  };

  return results.sort((a, b) => {
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return b.scholarship.amountValue - a.scholarship.amountValue;
  });
}
