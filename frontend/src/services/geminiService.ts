import { GoogleGenAI } from '@google/genai';
import { StudentProfile, Scholarship, MatchResult } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      aiInstance = new GoogleGenAI({ apiKey });
      return aiInstance;
    } catch {
      return null;
    }
  }
  return null;
}

export async function generateScholarshipAdvice(
  student: StudentProfile,
  match: MatchResult
): Promise<string> {
  const client = getAiClient();
  const { scholarship, status, matchedReasons, missingOrPendingVerifications, exclusionReasons } = match;

  if (!client) {
    // High-quality deterministic fallback response
    return generateDeterministicAdvice(student, match);
  }

  try {
    const prompt = `You are an expert Indian higher education scholarship counsellor for the ScholarFind platform.
Analyze this student's profile and their match status for the following scholarship:

SCHOLARSHIP:
Name: ${scholarship.name}
Provider: ${scholarship.provider} (${scholarship.providerType})
Financial Value: ${scholarship.amountDisplay}
Official Portal: ${scholarship.portalName} (${scholarship.officialLink})
Match Status: ${status}

STUDENT PROFILE:
- Name: ${student.fullName}
- Level: ${student.educationLevel} (${student.course})
- Institution: ${student.institutionName} (${student.institutionType})
- Category: ${student.category}
- State: ${student.state}
- Annual Family Income: ₹${student.annualFamilyIncome.toLocaleString('en-IN')} (Has Income Certificate: ${student.hasIncomeCertificate ? 'Yes' : 'No'})
- Academic Marks: ${student.prevExamPercentage}%

MATCH SIGNALS:
- Strengths / Reasons Matched: ${matchedReasons.join('; ')}
- Verification / Action Needed: ${missingOrPendingVerifications.join('; ') || 'None'}
- Exclusions (if any): ${exclusionReasons.join('; ') || 'None'}

Please provide concise, friendly, bullet-pointed student guidance with:
1. Executive Assessment (1-2 sentences on their competitiveness)
2. Document Preparation Checklist & Timeline Advice (e.g. Aadhaar seeding with NPCI, Revenue office visit)
3. Direct Next Steps to Apply on ${scholarship.portalName}
Keep tone supportive, professional, and practical for Indian students.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || generateDeterministicAdvice(student, match);
  } catch (err) {
    console.warn('Gemini advisory call failed, switching to local advice template', err);
    return generateDeterministicAdvice(student, match);
  }
}

function generateDeterministicAdvice(student: StudentProfile, match: MatchResult): string {
  const { scholarship, status } = match;

  if (status === 'ELIGIBLE') {
    return `### Strategic Application Guide for ${student.fullName}
**Assessment:** Excellent match! You satisfy all core requirements for the ${scholarship.name}.

**Key Preparation Steps:**
- **Aadhaar Seeding:** Ensure your active bank account is linked to your Aadhaar number and active on NPCI DBT mapping.
- **Documents Ready:** Keep digital PDF scans (under 200KB each) of your Income Certificate, College Bonafide, and Marksheets ready.
- **Portal Submission:** Head to **${scholarship.portalName}** (${scholarship.officialLink}) and complete the student verification form before ${scholarship.deadline}.
- **College Nodal Officer:** Inform your college scholarship clerk or administrative office once submitted for prompt institutional endorsement.`;
  }

  if (status === 'POSSIBLY_ELIGIBLE') {
    return `### Verification Action Plan for ${student.fullName}
**Assessment:** You meet key academic and category criteria, but specific government verification documents are required.

**Pending Actions:**
${match.missingOrPendingVerifications.map((item) => `- **${item}**`).join('\n')}
- **Income Certificate:** If you have not obtained your Tehsildar / Revenue Department Income Certificate, apply through your nearest CSC (Common Service Centre) or state e-portal immediately.
- **Pre-Registration:** You can still create your student login on **${scholarship.portalName}** while gathering the final attested paperwork.`;
  }

  return `### Criteria Gap Analysis for ${student.fullName}
**Assessment:** You are currently not eligible for this scheme due to the following specific rules:

${match.exclusionReasons.map((item) => `- **${item}**`).join('\n')}

**Alternative Recommendations:**
- Review other scholarships in your dashboard where your academic percentage and income brackets match.
- Check state-specific and private foundation scholarships (such as Reliance Foundation or Sitaram Jindal) which often feature broader eligibility bands.`;
}
