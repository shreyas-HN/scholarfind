import { Scholarship } from '../types';

export const SCHOLARSHIPS_DATABASE: Scholarship[] = [
  {
    id: 'nsp-central-sector',
    name: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    providerType: 'Central Government',
    schemeType: 'Merit-based',
    amountDisplay: '₹12,000 to ₹20,000 per annum',
    amountValue: 20000,
    deadline: '31 December 2026',
    deadlineDate: '2026-12-31',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal (NSP)',
    verified: true,
    description: 'Aimed at providing financial assistance to meritorious students from low-income families to meet their day-to-day expenses while pursuing higher studies in college and university.',
    eligibilityCriteriaSummary: [
      'Students scoring above 80th percentile in Class 12 / PUC board examination',
      'Pursuing regular full-time degree courses in recognized colleges/universities',
      'Gross annual parental income must not exceed ₹4,50,000',
      'Student should not be in receipt of any other central or state government scholarship'
    ],
    requiredDocuments: [
      'Aadhaar Card (linked with bank account)',
      'Class 12th / PUC Marksheet showing percentile/rank',
      'Income Certificate issued by competent revenue authority',
      'Current College Bonafide Certificate & Fee Receipt',
      'Bank Account Passbook (active account in student name with Aadhaar seeding)'
    ],
    applicationProcedure: [
      'Register on National Scholarship Portal (scholarships.gov.in) with Aadhaar and OTR (One Time Registration)',
      'Select Department of Higher Education -> Central Sector Scheme',
      'Fill academic details and upload Bonafide Certificate',
      'Submit application and note Application ID for institutional verification'
    ],
    rejectionReasons: [
      'Scoring below the 80th percentile cut-off declared by the respective state board',
      'Family income exceeding ₹4.5 Lakhs per annum',
      'Availing another concurrent government scholarship',
      'Bank account not seeded with Aadhaar (NPCI mapping failure)'
    ],
    importantDatesNotes: 'Application opens annually in July/August; verification deadline extends till January.',
    rules: {
      maxIncome: 450000,
      minPercentage: 80,
      allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
      disallowOtherScholarships: true
    }
  },
  {
    id: 'aicte-pragati',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students (Degree & Diploma)',
    provider: 'All India Council for Technical Education (AICTE), Ministry of Education',
    providerType: 'Central Government',
    schemeType: 'Gender-specific',
    amountDisplay: '₹50,000 per annum',
    amountValue: 50000,
    deadline: '15 January 2027',
    deadlineDate: '2027-01-15',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'NSP & AICTE Portal',
    verified: true,
    description: 'Exclusively for female students admitted to 1st year or 2nd year (lateral entry) of technical diploma or degree courses in AICTE approved institutions.',
    eligibilityCriteriaSummary: [
      'Female candidates only (up to two girls per family)',
      'Enrolled in 1st year (or 2nd year lateral entry) of Technical Degree or Diploma course in AICTE-approved institution',
      'Family income should not be more than ₹8,00,000 per annum',
      'Selection based strictly on qualifying examination merit'
    ],
    requiredDocuments: [
      'Class 10th & 12th / Diploma Marksheet',
      'AICTE Admission Allotment Letter',
      'Valid Annual Family Income Certificate (below ₹8 LPA)',
      'Parental declaration certifying maximum 2 daughters availing scheme',
      'Student Bank Passbook & Aadhaar Card'
    ],
    applicationProcedure: [
      'Log into NSP portal and search for AICTE Schemes',
      'Select Pragati Scholarship Scheme for Technical Degree or Diploma',
      'Upload institute admission letter and income proof',
      'Institute nodal officer verifies the student credentials on the portal'
    ],
    rejectionReasons: [
      'Institution not recognized by AICTE for the admitted technical branch',
      'Exceeding 2 girls limit per family',
      'Annual family income reported above ₹8 Lakhs',
      'Non-technical or general humanities/arts degree admission'
    ],
    importantDatesNotes: 'Verification conducted in 2 levels: Institute level followed by State Nodal Officer.',
    rules: {
      maxIncome: 800000,
      minPercentage: 60,
      allowedGenders: ['female'],
      allowedEducationLevels: ['Undergraduate', 'Diploma']
    }
  },
  {
    id: 'aicte-saksham',
    name: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students',
    provider: 'All India Council for Technical Education (AICTE)',
    providerType: 'Central Government',
    schemeType: 'Disability-specific',
    amountDisplay: '₹50,000 per annum',
    amountValue: 50000,
    deadline: '15 January 2027',
    deadlineDate: '2027-01-15',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal',
    verified: true,
    description: 'Empowers differently-abled students with a disability of not less than 40% pursuing technical degree or diploma education in AICTE approved colleges.',
    eligibilityCriteriaSummary: [
      'Specially-abled students with not less than 40% disability (UDID card required)',
      'Admitted to 1st year of Degree/Diploma technical course or 2nd year through lateral entry',
      'Family income must not exceed ₹8,00,000 per annum',
      'All eligible disabled students admitted are awarded without quota ceiling'
    ],
    requiredDocuments: [
      'Unique Disability ID (UDID) or Disability Certificate from Govt Medical Board (min 40%)',
      'Class 10th and 12th marksheets',
      'Current College Admission Bonafide',
      'Income Certificate (under ₹8 LPA)',
      'Aadhaar Linked Bank Account Details'
    ],
    applicationProcedure: [
      'Register on NSP via One Time Registration (OTR)',
      'Apply under AICTE Saksham Scheme section',
      'Upload UDID disability certificate and institutional fee receipt',
      'Submit for institutional verification'
    ],
    rejectionReasons: [
      'Disability percentage below 40% as per certified Medical Board',
      'Disability certificate missing UDID registration number',
      'Non-AICTE approved institution enrollment'
    ],
    importantDatesNotes: 'Sanctioned directly via Direct Benefit Transfer (DBT) to student Aadhaar-seeded accounts.',
    rules: {
      maxIncome: 800000,
      minPercentage: 50,
      requiresDisability: true,
      minDisabilityPercentage: 40,
      allowedEducationLevels: ['Undergraduate', 'Diploma']
    }
  },
  {
    id: 'post-matric-sc',
    name: 'Post Matric Scholarship for Scheduled Caste (SC) Students',
    provider: 'Ministry of Social Justice and Empowerment, Govt. of India / State Depts',
    providerType: 'Central Government',
    schemeType: 'Category-based',
    amountDisplay: 'Full tuition reimbursement + ₹13,500/yr maintenance allowance',
    amountValue: 45000,
    deadline: '28 February 2027',
    deadlineDate: '2027-02-28',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'NSP & Respective State Portals (e.g. SSP)',
    verified: true,
    description: 'Centrally sponsored flagship scheme providing complete tuition fee support and monthly maintenance allowance to SC students studying post-matriculation courses.',
    eligibilityCriteriaSummary: [
      'Student must belong to Scheduled Caste (SC) category',
      'Pursuing post-matric courses (PUC, Diploma, UG, PG, PhD)',
      'Total annual family income from all sources must not exceed ₹2,50,000',
      'Studying in a recognized Government, Aided, or Private institution'
    ],
    requiredDocuments: [
      'Caste Certificate with verified RD / Barcode number',
      'Income Certificate (valid within validity period of 1 to 3 years)',
      'Previous examination marksheet',
      'College Bonafide and Tuition Fee receipt breakdown',
      'Hostel certificate (for hostellers claiming higher allowance)'
    ],
    applicationProcedure: [
      'Apply via state portal (e.g., SSP in Karnataka, Mahadbt in Maharashtra) or NSP for other states',
      'Enter Caste Certificate number to fetch digital caste verification',
      'Upload college admission acknowledgement',
      'Institute verifies and forwards to Social Welfare Department'
    ],
    rejectionReasons: [
      'Invalid, forged, or unverified digital caste certificate',
      'Annual family income declared exceeding ₹2,50,000 threshold',
      'Failing in exam or detention (maintenance stopped for repeating years)',
      'Name spelling difference between Caste certificate and Aadhaar'
    ],
    importantDatesNotes: 'Mandatory Aadhaar authentication enabled. State welfare portals process monthly releases.',
    rules: {
      maxIncome: 250000,
      allowedCategories: ['SC'],
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
    }
  },
  {
    id: 'post-matric-st',
    name: 'Post Matric Scholarship for Scheduled Tribe (ST) Students',
    provider: 'Ministry of Tribal Affairs, Govt. of India',
    providerType: 'Central Government',
    schemeType: 'Category-based',
    amountDisplay: '100% Tuition Fees + ₹12,000/yr living allowance',
    amountValue: 42000,
    deadline: '28 February 2027',
    deadlineDate: '2027-02-28',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal & Tribal Welfare Dept',
    verified: true,
    description: 'Comprehensive financial security covering institutional tuition, examination fees, and maintenance stipend for ST students pursuing secondary and tertiary education.',
    eligibilityCriteriaSummary: [
      'Belonging to verified Scheduled Tribe (ST) community',
      'Studying in Post-Matriculation or post-secondary courses',
      'Annual family income must not exceed ₹2,50,000',
      'Enrolled in recognized colleges, polytechnics, or universities'
    ],
    requiredDocuments: [
      'ST Community Certificate issued by Revenue Authority',
      'Income Certificate (under ₹2.5 Lakhs)',
      'Marks card of last qualifying exam',
      'Hosteller certificate (if applicable)',
      'Bank passbook linked to Aadhaar'
    ],
    applicationProcedure: [
      'Register on NSP or state tribal welfare portal',
      'Select Post Matric Schemes -> Ministry of Tribal Affairs',
      'Submit academic and fee receipts',
      'District Tribal Welfare Officer scrutinizes and sanctions DBT'
    ],
    rejectionReasons: [
      'Caste certificate issued by non-authorized official',
      'Income proof exceeding ₹2.5 Lakhs limit',
      'Failure to complete biometric OTR verification'
    ],
    importantDatesNotes: 'Applications typically accepted until end of academic term with fee reimbursement.',
    rules: {
      maxIncome: 250000,
      allowedCategories: ['ST'],
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
    }
  },
  {
    id: 'post-matric-obc',
    name: 'Post Matric Scholarship for Other Backward Classes (OBC)',
    provider: 'Ministry of Social Justice and Backward Classes Welfare',
    providerType: 'Central Government',
    schemeType: 'Category-based',
    amountDisplay: '₹10,000 to ₹35,000 per annum depending on course group',
    amountValue: 25000,
    deadline: '15 February 2027',
    deadlineDate: '2027-02-15',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'NSP & State Backward Classes Portals',
    verified: true,
    description: 'Provides financial assistance to students belonging to OBC communities studying at post-secondary stage to enable them to complete their education.',
    eligibilityCriteriaSummary: [
      'Student belongs to recognized Other Backward Classes (OBC/BC) category',
      'Pursuing post-matriculation courses in recognized institutions',
      'Total annual family income must not exceed ₹2,50,000 per annum',
      'Minimum passing marks in previous examination'
    ],
    requiredDocuments: [
      'OBC / Non-Creamy Layer Certificate',
      'Current valid Income Certificate',
      'Previous examination marksheet',
      'Study certificate & College Fee structure',
      'Aadhaar card'
    ],
    applicationProcedure: [
      'Submit application through National Scholarship Portal or State BC Welfare Portal',
      'Verify Non-Creamy Layer status',
      'Upload college fee receipts for institutional verification'
    ],
    rejectionReasons: [
      'Falling into Creamy Layer bracket or income exceeding ₹2.5 LPA',
      'Non-recognition of institution by state higher education body'
    ],
    importantDatesNotes: 'State quota allocations apply; earlier applicants receive expedited processing.',
    rules: {
      maxIncome: 250000,
      minPercentage: 45,
      allowedCategories: ['OBC'],
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
    }
  },
  {
    id: 'karnataka-ssp-postmatric',
    name: 'State Scholarship Portal (SSP) Post-Matric Scholarship - Karnataka',
    provider: 'Government of Karnataka (Social Welfare, Tribal, BCW & Minority Depts)',
    providerType: 'State Government',
    schemeType: 'Need-based',
    amountDisplay: '100% Tuition Fee Reimbursement + Monthly Maintenance',
    amountValue: 40000,
    deadline: '31 January 2027',
    deadlineDate: '2027-01-31',
    officialLink: 'https://ssp.postmatric.karnataka.gov.in',
    portalName: 'SSP Karnataka Portal',
    verified: true,
    description: 'Unified state portal for all Karnataka domicile students belonging to SC, ST, OBC, EWS, and Minority categories for college and university fee concessions and stipends.',
    eligibilityCriteriaSummary: [
      'Student must be a permanent resident (domicile) of Karnataka',
      'Pursuing PUC, Diploma, ITI, UG, PG, Medical, Engineering, or PhD in Karnataka',
      'Family income ceiling: SC/ST up to ₹2.5L, Category-1 up to ₹2.5L, 2A/2B/3A/3B up to ₹1.0L, EWS up to ₹8.0L',
      'Valid Kutumba ID / Ration Card registered in Karnataka'
    ],
    requiredDocuments: [
      'Karnataka Kutumba Family ID',
      'Revenue Dept Income & Caste Certificate RD Numbers',
      'Student Aadhaar and E-Attested marks cards',
      'College Bonafide & College Registration Number (USN / Reg No)',
      'Hostel confirmation from e-Hostel portal (if staying in college/govt hostel)'
    ],
    applicationProcedure: [
      'Create account on ssp.postmatric.karnataka.gov.in with Kutumba ID and Aadhaar',
      'Fetch automated digital verification of Caste & Income via RD numbers',
      'Enter University Seat Number (USN) and academic course details',
      'Request e-Attestation of documents from designated college attestation officers'
    ],
    rejectionReasons: [
      'Non-Karnataka domicile or missing Kutumba ID mapping',
      'RD Number verification mismatch with name in revenue records',
      'Unattested academic marks card on SSP E-Attestation portal'
    ],
    importantDatesNotes: 'E-Attestation must be completed prior to final submission. Direct transfer to college and student accounts.',
    rules: {
      maxIncome: 800000,
      allowedStates: ['Karnataka'],
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
    }
  },
  {
    id: 'nsp-merit-cum-means-minority',
    name: 'Merit-cum-Means Scholarship for Professional and Technical Courses CS (Minorities)',
    provider: 'Ministry of Minority Affairs (MoMA), Govt. of India',
    providerType: 'Central Government',
    schemeType: 'Category-based',
    amountDisplay: 'Up to ₹30,000 per annum + Maintenance',
    amountValue: 30000,
    deadline: '31 December 2026',
    deadlineDate: '2026-12-31',
    officialLink: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal (NSP)',
    verified: true,
    description: 'Offered to meritorious students belonging to notified minority communities (Muslims, Christians, Sikhs, Buddhists, Jains, Parsis) pursuing professional or technical courses.',
    eligibilityCriteriaSummary: [
      'Belonging to notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)',
      'Admission to undergraduate or postgraduate technical/professional degree',
      'Secured not less than 50% marks in the previous final examination',
      'Annual family income from all sources should not exceed ₹2,50,000'
    ],
    requiredDocuments: [
      'Self-declaration of minority community by student',
      'Income Certificate from competent revenue officer',
      'Previous semester / 12th marksheet (min 50%)',
      'College bonafide and fee receipt',
      'Bank passbook copy'
    ],
    applicationProcedure: [
      'Register on scholarships.gov.in',
      'Navigate to Ministry of Minority Affairs -> Merit-cum-Means Scheme',
      'Provide fee break-up and self-certified minority affidavit',
      'College verifies and forwards to State Minority Development Directorate'
    ],
    rejectionReasons: [
      'Income certificate exceeding ₹2.5 LPA',
      'Less than 50% marks in qualifying exam',
      'General arts or non-professional degree course enrollment'
    ],
    importantDatesNotes: '30% of total scholarships earmaked for girl students from minority communities.',
    rules: {
      maxIncome: 250000,
      minPercentage: 50,
      requiresMinority: true,
      allowedEducationLevels: ['Undergraduate', 'Postgraduate']
    }
  },
  {
    id: 'reliance-foundation-ug',
    name: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    providerType: 'Private',
    schemeType: 'Merit-based',
    amountDisplay: 'Up to ₹2,00,000 over the duration of degree',
    amountValue: 50000,
    deadline: '15 October 2026',
    deadlineDate: '2026-10-15',
    officialLink: 'https://www.reliancefoundation.org',
    portalName: 'Reliance Foundation Portal',
    verified: true,
    description: 'Supports first-year undergraduate students across any stream with financial grants, mentorship, and leadership development programs.',
    eligibilityCriteriaSummary: [
      'Resident Indian citizen currently enrolled in 1st year full-time undergraduate degree',
      'Minimum 60% aggregate marks in 12th Standard board exams',
      'Household annual income below ₹15,00,000 (preference given to income < ₹2,50,000)',
      'Must complete the online aptitude test conducted by Reliance Foundation'
    ],
    requiredDocuments: [
      'Class 12th Marksheet',
      'College Bonafide or Student ID card',
      'Family Income Proof (ITR / Income Certificate / Salary slips)',
      'Aadhaar / Passport for identity',
      'Passport size photograph'
    ],
    applicationProcedure: [
      'Visit reliancefoundation.org scholarships section',
      'Complete online eligibility questionnaire and profile registration',
      'Take the mandatory 60-minute online cognitive and mathematics aptitude test',
      'Shortlisted applicants receive final interview invitation'
    ],
    rejectionReasons: [
      'Applying in 2nd, 3rd or final year of college (1st-year UG only)',
      'Score below 60% in Class 12 board exam',
      'Failing the mandatory online aptitude assessment test'
    ],
    importantDatesNotes: 'Over 5,000 scholarships awarded annually based on merit and financial need.',
    rules: {
      maxIncome: 1500000,
      minPercentage: 60,
      allowedEducationLevels: ['Undergraduate']
    }
  },
  {
    id: 'hdfc-parivartan-ecss',
    name: 'HDFC Bank Parivartan’s ECSS Programme',
    provider: 'HDFC Bank CSR / Buddy4Study',
    providerType: 'Private',
    schemeType: 'Need-based',
    amountDisplay: 'Up to ₹75,000 per annum',
    amountValue: 75000,
    deadline: '30 November 2026',
    deadlineDate: '2026-11-30',
    officialLink: 'https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme',
    portalName: 'Buddy4Study / HDFC CSR',
    verified: true,
    description: 'Designed to support meritorious and needy students facing financial crises or bereavement to pursue schooling, diploma, undergraduate, or postgraduate education uninterrupted.',
    eligibilityCriteriaSummary: [
      'Open for Indian nationals from Class 1 to Post-graduation / Professional studies',
      'Students must have passed previous examination with at least 55% marks',
      'Annual family income must be less than or equal to ₹2,50,000',
      'Preference given to students facing personal or family financial distress'
    ],
    requiredDocuments: [
      'Previous year marks card (min 55%)',
      'Government issued ID (Aadhaar / Voter ID)',
      'Income Certificate / BPL Card / Salary Slip',
      'Proof of admission (college fee receipt, admission letter)',
      'Student bank account details with canceled cheque'
    ],
    applicationProcedure: [
      'Apply online on Buddy4Study portal for HDFC Parivartan ECSS',
      'Upload financial proof and crisis statement (if applicable)',
      'Telephonic interview and background verification by NGO partners'
    ],
    rejectionReasons: [
      'Family income exceeding ₹2,50,000 per year',
      'Marks below 55% in the previous class/semester',
      'Unclear or unreadable fee receipts'
    ],
    importantDatesNotes: 'Disbursements are directly transferred to college accounts or student accounts via NEFT.',
    rules: {
      maxIncome: 250000,
      minPercentage: 55,
      allowedEducationLevels: ['SSLC', 'PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate']
    }
  },
  {
    id: 'sitaram-jindal-foundation',
    name: 'Sitaram Jindal Foundation Scholarship Scheme',
    provider: 'Sitaram Jindal Foundation, Bangalore',
    providerType: 'Trust/Foundation',
    schemeType: 'Merit-based',
    amountDisplay: '₹500 to ₹3,200 per month (Up to ₹38,400/yr)',
    amountValue: 38400,
    deadline: 'Open Throughout the Year (Rolling Admissions)',
    deadlineDate: '2027-12-31',
    officialLink: 'https://www.sitaramjindalfoundation.org',
    portalName: 'Sitaram Jindal Official Portal',
    verified: true,
    description: 'Prominent philanthropic scholarship open throughout the year to support poor and deserving students pursuing technical, medical, arts, commerce, and diploma courses.',
    eligibilityCriteriaSummary: [
      'Male students: min 60% marks in previous exam; Female students: min 55% marks',
      'Family income limit: for employment/business up to ₹4,00,000; for agriculture up to ₹2,50,000',
      'Pursuing Class 11, 12, ITI, Diploma, Graduation, Post-graduation, Engineering or Medicine',
      'Applications accepted round the year without single cutoff cutoff date'
    ],
    requiredDocuments: [
      'Duly filled Annexure application signed by College Principal',
      'Marksheet of SSLC / PUC / Graduation',
      'Income Certificate issued by Revenue Authority (Tahsildar)',
      'Hostel certificate with monthly mess expense (for hostellers)',
      'Physical Disability Certificate (if applicable for concession in marks)'
    ],
    applicationProcedure: [
      'Download application form from sitaramjindalfoundation.org',
      'Get principal signature and seal on the institution verification section',
      'Submit form by speed post to Sitaram Jindal Foundation, Tumkur Road, Bangalore',
      'Cheque sent directly to student by registered post on sanction'
    ],
    rejectionReasons: [
      'Application not signed and attested by college principal with official seal',
      'Marks below the prescribed threshold (60% for boys, 55% for girls)',
      'Missing Tahsildar certified income certificate'
    ],
    importantDatesNotes: 'No deadline: Applications evaluated on a rolling monthly cycle.',
    rules: {
      maxIncome: 400000,
      minPercentage: 55,
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate']
    }
  },
  {
    id: 'santoor-scholarship-women',
    name: 'Santoor Women’s Scholarship',
    provider: 'Wipro Consumer Care and Azim Premji Foundation',
    providerType: 'Private',
    schemeType: 'Gender-specific',
    amountDisplay: '₹24,000 per annum until degree completion',
    amountValue: 24000,
    deadline: '20 October 2026',
    deadlineDate: '2026-10-20',
    officialLink: 'https://www.santoor.in',
    portalName: 'Santoor Scholarship Portal',
    verified: true,
    description: 'Dedicated initiative by Wipro Consumer Care and Azim Premji Foundation to support young women from underprivileged backgrounds in Andhra Pradesh, Karnataka, Telangana, and Chhattisgarh to pursue higher education.',
    eligibilityCriteriaSummary: [
      'Exclusively for young women from Karnataka, Andhra Pradesh, Telangana, or Chhattisgarh',
      'Must have completed Class 10 (SSLC) in a local government school',
      'Must have passed Class 12 (PUC) from a government school or junior college',
      'Enrolled in a recognized full-time undergraduate degree (Humanities, Sciences, Commerce, Engineering, etc.)'
    ],
    requiredDocuments: [
      'Class 10th and 12th Marksheets from government school/college',
      'College Admission Fee receipt & Bonafide certificate',
      'Aadhaar card copy',
      'Student savings bank account passbook copy'
    ],
    applicationProcedure: [
      'Apply online on www.santoor.in or Buddy4Study portal',
      'Provide government school study certificate proof',
      'Selected candidates receive SMS notification and phone interview'
    ],
    rejectionReasons: [
      'Applicant studied Class 10 or 12 in an expensive private un-aided school',
      'Male applicant (strictly for female students)',
      'Residing outside the 4 eligible states'
    ],
    importantDatesNotes: 'Preference given to girl students from backward taluks and rural districts.',
    rules: {
      maxIncome: 350000,
      minPercentage: 50,
      allowedGenders: ['female'],
      allowedStates: ['Karnataka', 'Andhra Pradesh', 'Telangana', 'Chhattisgarh'],
      allowedEducationLevels: ['Undergraduate']
    }
  },
  {
    id: 'dst-inspire-she',
    name: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science and Technology (DST), Govt. of India',
    providerType: 'Central Government',
    schemeType: 'Merit-based',
    amountDisplay: '₹80,000 per annum (₹60,000 scholarship + ₹20,000 mentorship)',
    amountValue: 80000,
    deadline: '31 December 2026',
    deadlineDate: '2026-12-31',
    officialLink: 'https://online-inspire.gov.in',
    portalName: 'INSPIRE DST Portal',
    verified: true,
    description: 'Premier national program to attract talented youth to study Natural and Basic Sciences at the B.Sc., B.S., and Int. M.Sc./M.S. level.',
    eligibilityCriteriaSummary: [
      'Top 1% meritorious students in Class 12 board examinations across India',
      'Or rank holders in JEE Advanced / NEET within top 10,000 ranks',
      'Enrolled in regular B.Sc., B.S., Int. M.Sc. in Natural & Basic Sciences (Physics, Chemistry, Maths, Biology, Geology, etc.)',
      'Age between 17 and 22 years'
    ],
    requiredDocuments: [
      'Class 12th Marksheet indicating board cut-off top 1%',
      'INSPIRE Eligibility Note / Advisory Note from State/Central Board',
      'Endorsement Certificate signed by College Principal / Registrar',
      'Aadhaar seeded SBI bank account details'
    ],
    applicationProcedure: [
      'Register on online-inspire.gov.in',
      'Upload Class 12 marksheet and Principal Endorsement form',
      'Annual renewal requires maintaining at least 60% marks in college exams'
    ],
    rejectionReasons: [
      'Enrolled in professional/applied degrees (e.g., Engineering B.Tech, MBBS, BCA, B.Com - strictly for Basic Sciences)',
      'Class 12 board percentage below the top 1% cut-off announced by DST',
      'Age over 22 years at the time of application'
    ],
    importantDatesNotes: 'Must be enrolled in basic science degree disciplines.',
    rules: {
      minPercentage: 85,
      allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
      courseKeywordMatch: ['Science', 'B.Sc', 'BS', 'M.Sc', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology']
    }
  },
  {
    id: 'ongc-merit-scholarship',
    name: 'ONGC Foundation Scholarship for SC / ST / OBC / EWS Students',
    provider: 'ONGC Foundation (Oil and Natural Gas Corporation Ltd)',
    providerType: 'Trust/Foundation',
    schemeType: 'Category-based',
    amountDisplay: '₹48,000 per annum',
    amountValue: 48000,
    deadline: '30 November 2026',
    deadlineDate: '2026-11-30',
    officialLink: 'https://ongcscholar.org',
    portalName: 'ONGC Scholar Portal',
    verified: true,
    description: 'CSR initiative by ONGC to support economically underprivileged students pursuing professional degrees in Engineering, MBBS, MBA, and Geology/Geophysics.',
    eligibilityCriteriaSummary: [
      'Belonging to SC, ST, OBC, or General-EWS category',
      'Enrolled in 1st year of Engineering (B.Tech), MBBS, MBA, or Master’s in Geology/Geophysics',
      'Minimum 60% marks in Class 12 for Engineering/MBBS or 60% in graduation for PG',
      'Family income must not exceed ₹2,00,000 per annum (for SC/ST up to ₹4.5L)',
      'Age should not be more than 30 years'
    ],
    requiredDocuments: [
      'Caste Certificate / EWS Certificate',
      'Annual Income Certificate issued by competent revenue authority',
      'Class 12th / Graduation Marksheet (min 60%)',
      'PAN Card and Aadhaar Card',
      'College Bonafide Certificate'
    ],
    applicationProcedure: [
      'Register on ongcscholar.org',
      'Select respective scholarship scheme based on caste category',
      'Upload academic transcripts and caste document verification',
      'Hard copies verified through designated zonal ONGC offices'
    ],
    rejectionReasons: [
      'Family income exceeding the prescribed ceiling',
      'Non-professional degree (BA, B.Com, General B.Sc are not eligible)',
      'Applying in subsequent years (strictly 1st year professional students)'
    ],
    importantDatesNotes: '50% of the scholarships are reserved for female candidates.',
    rules: {
      maxIncome: 450000,
      minPercentage: 60,
      allowedCategories: ['SC', 'ST', 'OBC', 'EWS'],
      allowedEducationLevels: ['Undergraduate', 'Postgraduate']
    }
  },
  {
    id: 'tata-capital-pankh',
    name: 'Tata Capital Pankh Scholarship Programme',
    provider: 'Tata Capital Limited CSR',
    providerType: 'Private',
    schemeType: 'Need-based',
    amountDisplay: 'Up to ₹50,000 or 80% of course fee',
    amountValue: 50000,
    deadline: '15 December 2026',
    deadlineDate: '2026-12-15',
    officialLink: 'https://www.buddy4study.com/page/tata-capital-pankh-scholarship-programme',
    portalName: 'Tata Capital / Buddy4Study',
    verified: true,
    description: 'Empowers deserving students from economically weaker sections to pursue school, undergraduate, diploma, or professional courses without dropping out.',
    eligibilityCriteriaSummary: [
      'Students enrolled in Class 11, 12, General Undergraduate, Diploma, or Professional degree',
      'Minimum 60% marks in the preceding academic examination',
      'Annual family income must not be more than ₹2,50,000 from all sources',
      'Children of Tata Capital & Buddy4Study employees are not eligible'
    ],
    requiredDocuments: [
      'Photo ID (Aadhaar Card)',
      'Passport size photograph',
      'Income proof (Form 16A, Income Certificate by Tehsildar, Salary Slips)',
      'Proof of admission (School/College ID Card, Admission Letter)',
      'Bank account details of applicant / parent'
    ],
    applicationProcedure: [
      'Apply online on Buddy4Study Pankh scholarship portal',
      'Complete personal, academic, and financial background forms',
      'Shortlisted applicants undergo telephonic verification'
    ],
    rejectionReasons: [
      'Family income exceeding ₹2.5 Lakhs per year',
      'Scoring less than 60% in previous exam',
      'Incomplete fee receipts or unverifiable income certificate'
    ],
    importantDatesNotes: 'Covers up to 80% of course tuition fee directly disbursed to student bank account.',
    rules: {
      maxIncome: 250000,
      minPercentage: 60,
      allowedEducationLevels: ['PUC / 12th', 'Diploma', 'Undergraduate']
    }
  },
  {
    id: 'vidyasaarathi-acc-cement',
    name: 'ACC Vidyasaarathi Scholarship for Higher Education',
    provider: 'ACC Limited / Protean Vidyasaarathi',
    providerType: 'Private',
    schemeType: 'Need-based',
    amountDisplay: 'Up to ₹30,000 to ₹50,000 per annum',
    amountValue: 35000,
    deadline: '31 December 2026',
    deadlineDate: '2026-12-31',
    officialLink: 'https://www.vidyasaarathi.co.in',
    portalName: 'Protean Vidyasaarathi Portal',
    verified: true,
    description: 'Scholarship program initiated by ACC Limited to provide financial aid to students residing in surrounding plant communities and low-income students pursuing ITI, Diploma, and UG courses.',
    eligibilityCriteriaSummary: [
      'Enrolled in full-time ITI, Polytechnic Diploma, or Undergraduate Degree',
      'Minimum 50% marks in previous examination',
      'Family income must be less than ₹5,00,000 per annum',
      'Open to all categories; preference to students from rural and semi-urban localities'
    ],
    requiredDocuments: [
      'Proof of Identity & Address (Aadhaar)',
      'Class 10th / 12th Marksheet',
      'College Fee Structure & College Bonafide',
      'Income Certificate / Ration Card',
      'Student Bank Passbook'
    ],
    applicationProcedure: [
      'Register on vidyasaarathi.co.in',
      'Search for ACC Scholarship under available schemes',
      'Upload scanned documents and submit for scrutiny'
    ],
    rejectionReasons: [
      'Distance education or part-time course enrollment',
      'Income certificate exceeding ₹5 Lakhs'
    ],
    importantDatesNotes: 'Disbursement managed by Protean eGov Technologies via Direct Bank Transfer.',
    rules: {
      maxIncome: 500000,
      minPercentage: 50,
      allowedEducationLevels: ['Diploma', 'Undergraduate']
    }
  }
];



export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];
