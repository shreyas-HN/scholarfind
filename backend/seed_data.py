import json
from sqlalchemy.orm import Session
from .models import Scholarship, EligibilityCriteria

VERIFIED_SCHOLARSHIPS_DATA = [
  {
    "id": "nsp-central-sector",
    "name": "Central Sector Scheme of Scholarship for College and University Students (CSSS)",
    "provider": "Department of Higher Education, Ministry of Education, Govt. of India",
    "provider_type": "Central Government",
    "scheme_type": "Merit-based",
    "amount_display": "₹12,000 to ₹20,000 per annum",
    "amount_value": 20000.0,
    "deadline": "31 December 2026",
    "deadline_date": "2026-12-31",
    "official_link": "https://scholarships.gov.in",
    "portal_name": "National Scholarship Portal (NSP)",
    "verified": True,
    "source_url": "https://www.education.gov.in/scholarships-education-loan-0",
    "verification_date": "Verified 2026 Gazette Notification",
    "description": "Aimed at providing financial assistance to meritorious students from low-income families to meet their day-to-day expenses while pursuing higher studies in college and university.",
    "important_dates_notes": "Application opens annually in July/August; institutional verification window extends until January.",
    "eligibility_summary": [
      "Students scoring above 80th percentile in Class 12 / PUC board examination",
      "Pursuing regular full-time degree courses in recognized colleges/universities",
      "Gross annual parental income must not exceed ₹4,50,000",
      "Student should not be in receipt of any other central or state government scholarship"
    ],
    "required_documents": [
      "Aadhaar Card (linked with bank account)",
      "Class 12th / PUC Marksheet showing percentile/rank",
      "Income Certificate issued by competent revenue authority",
      "Current College Bonafide Certificate & Fee Receipt",
      "Bank Account Passbook (active account in student name with Aadhaar seeding)"
    ],
    "application_procedure": [
      "Register on National Scholarship Portal (scholarships.gov.in) with Aadhaar and OTR (One Time Registration)",
      "Select Department of Higher Education -> Central Sector Scheme",
      "Fill academic details and upload Bonafide Certificate",
      "Submit application and note Application ID for institutional verification"
    ],
    "rejection_reasons": [
      "Scoring below the 80th percentile cut-off declared by the respective state board",
      "Family income exceeding ₹4.5 Lakhs per annum",
      "Availing another concurrent government scholarship",
      "Bank account not seeded with Aadhaar (NPCI mapping failure)"
    ],
    "criteria": {
      "max_income": 450000.0,
      "min_percentage": 80.0,
      "allowed_education_levels": ["Undergraduate", "Postgraduate"],
      "disallow_other_scholarships": True
    }
  },
  {
    "id": "aicte-pragati",
    "name": "AICTE Pragati Scholarship Scheme for Girl Students (Degree & Diploma)",
    "provider": "All India Council for Technical Education (AICTE), Ministry of Education",
    "provider_type": "Central Government",
    "scheme_type": "Gender-specific",
    "amount_display": "₹50,000 per annum",
    "amount_value": 50000.0,
    "deadline": "15 January 2027",
    "deadline_date": "2027-01-15",
    "official_link": "https://scholarships.gov.in",
    "portal_name": "NSP & AICTE Portal",
    "verified": True,
    "source_url": "https://www.aicte-india.org/schemes/students-development-schemes/pragati",
    "verification_date": "AICTE Academic Guidelines 2026",
    "description": "Exclusively for female students admitted to 1st year or 2nd year (lateral entry) of technical diploma or degree courses in AICTE approved institutions.",
    "important_dates_notes": "Verification conducted in 2 levels: Institute level followed by State Nodal Officer.",
    "eligibility_summary": [
      "Female candidates only (up to two girls per family)",
      "Enrolled in 1st year (or 2nd year lateral entry) of Technical Degree or Diploma course in AICTE-approved institution",
      "Family income should not be more than ₹8,00,000 per annum",
      "Selection based strictly on qualifying examination merit"
    ],
    "required_documents": [
      "Class 10th & 12th / Diploma Marksheet",
      "AICTE Admission Allotment Letter",
      "Valid Annual Family Income Certificate (below ₹8 LPA)",
      "Parental declaration certifying maximum 2 daughters availing scheme",
      "Student Bank Passbook & Aadhaar Card"
    ],
    "application_procedure": [
      "Log into NSP portal and search for AICTE Schemes",
      "Select Pragati Scholarship Scheme for Technical Degree or Diploma",
      "Upload institute admission letter and income proof",
      "Institute nodal officer verifies the student credentials on the portal"
    ],
    "rejection_reasons": [
      "Institution not recognized by AICTE for the admitted technical branch",
      "Exceeding 2 girls limit per family",
      "Annual family income reported above ₹8 Lakhs",
      "Non-technical or general humanities/arts degree admission"
    ],
    "criteria": {
      "max_income": 800000.0,
      "min_percentage": 60.0,
      "allowed_genders": ["female"],
      "allowed_education_levels": ["Undergraduate", "Diploma"]
    }
  },
  {
    "id": "aicte-saksham",
    "name": "AICTE Saksham Scholarship Scheme for Specially-Abled Students",
    "provider": "All India Council for Technical Education (AICTE)",
    "provider_type": "Central Government",
    "scheme_type": "Disability-specific",
    "amount_display": "₹50,000 per annum",
    "amount_value": 50000.0,
    "deadline": "15 January 2027",
    "deadline_date": "2027-01-15",
    "official_link": "https://scholarships.gov.in",
    "portal_name": "National Scholarship Portal",
    "verified": True,
    "source_url": "https://www.aicte-india.org/schemes/students-development-schemes/saksham",
    "verification_date": "AICTE Guidelines 2026",
    "description": "Empowers differently-abled students with a disability of not less than 40% pursuing technical degree or diploma education in AICTE approved colleges.",
    "important_dates_notes": "Sanctioned directly via Direct Benefit Transfer (DBT) to student Aadhaar-seeded accounts.",
    "eligibility_summary": [
      "Specially-abled students with not less than 40% disability (UDID card required)",
      "Admitted to 1st year of Degree/Diploma technical course or 2nd year through lateral entry",
      "Family income must not exceed ₹8,00,000 per annum",
      "All eligible disabled students admitted are awarded without quota ceiling"
    ],
    "required_documents": [
      "Unique Disability ID (UDID) or Disability Certificate from Govt Medical Board (min 40%)",
      "Class 10th and 12th marksheets",
      "Current College Admission Bonafide",
      "Income Certificate (under ₹8 LPA)",
      "Aadhaar Linked Bank Account Details"
    ],
    "application_procedure": [
      "Register on NSP via One Time Registration (OTR)",
      "Apply under AICTE Saksham Scheme section",
      "Upload UDID disability certificate and institutional fee receipt",
      "Submit for institutional verification"
    ],
    "rejection_reasons": [
      "Disability percentage below 40% as per certified Medical Board",
      "Disability certificate missing UDID registration number",
      "Non-AICTE approved institution enrollment"
    ],
    "criteria": {
      "max_income": 800000.0,
      "min_percentage": 50.0,
      "requires_disability": True,
      "min_disability_percentage": 40,
      "allowed_education_levels": ["Undergraduate", "Diploma"]
    }
  },
  {
    "id": "post-matric-sc",
    "name": "Post Matric Scholarship for Scheduled Caste (SC) Students",
    "provider": "Ministry of Social Justice and Empowerment, Govt. of India / State Depts",
    "provider_type": "Central Government",
    "scheme_type": "Category-based",
    "amount_display": "Full tuition reimbursement + ₹13,500/yr maintenance allowance",
    "amount_value": 45000.0,
    "deadline": "28 February 2027",
    "deadline_date": "2027-02-28",
    "official_link": "https://scholarships.gov.in",
    "portal_name": "NSP & Respective State Portals (e.g. SSP)",
    "verified": True,
    "source_url": "https://socialjustice.gov.in/schemes/26",
    "verification_date": "MoSJE Guidelines 2026",
    "description": "Centrally sponsored flagship scheme providing complete tuition fee support and monthly maintenance allowance to SC students studying post-matriculation courses.",
    "important_dates_notes": "Mandatory Aadhaar authentication enabled. State welfare portals process monthly releases.",
    "eligibility_summary": [
      "Student must belong to Scheduled Caste (SC) category",
      "Pursuing post-matric courses (PUC, Diploma, UG, PG, PhD)",
      "Total annual family income from all sources must not exceed ₹2,50,000",
      "Studying in a recognized Government, Aided, or Private institution"
    ],
    "required_documents": [
      "Caste Certificate with verified RD / Barcode number",
      "Income Certificate (valid within validity period of 1 to 3 years)",
      "Previous examination marksheet",
      "College Bonafide and Tuition Fee receipt breakdown",
      "Hostel certificate (for hostellers claiming higher allowance)"
    ],
    "application_procedure": [
      "Apply via state portal (e.g., SSP in Karnataka, Mahadbt in Maharashtra) or NSP for other states",
      "Enter Caste Certificate number to fetch digital caste verification",
      "Upload college admission acknowledgement",
      "Institute verifies and forwards to Social Welfare Department"
    ],
    "rejection_reasons": [
      "Invalid, forged, or unverified digital caste certificate",
      "Annual family income declared exceeding ₹2,50,000 threshold",
      "Failing in exam or detention (maintenance stopped for repeating years)",
      "Name spelling difference between Caste certificate and Aadhaar"
    ],
    "criteria": {
      "max_income": 250000.0,
      "allowed_categories": ["SC"],
      "allowed_education_levels": ["PUC / 12th", "Diploma", "Undergraduate", "Postgraduate", "PhD"]
    }
  },
  {
    "id": "post-matric-st",
    "name": "Post Matric Scholarship for Scheduled Tribe (ST) Students",
    "provider": "Ministry of Tribal Affairs, Govt. of India",
    "provider_type": "Central Government",
    "scheme_type": "Category-based",
    "amount_display": "100% Tuition Fees + ₹12,000/yr living allowance",
    "amount_value": 42000.0,
    "deadline": "28 February 2027",
    "deadline_date": "2027-02-28",
    "official_link": "https://scholarships.gov.in",
    "portal_name": "National Scholarship Portal & Tribal Welfare Dept",
    "verified": True,
    "source_url": "https://tribal.nic.in/Schemes.aspx",
    "verification_date": "Ministry of Tribal Affairs 2026",
    "description": "Comprehensive financial security covering institutional tuition, examination fees, and maintenance stipend for ST students pursuing secondary and tertiary education.",
    "important_dates_notes": "Applications typically accepted until end of academic term with fee reimbursement.",
    "eligibility_summary": [
      "Belonging to verified Scheduled Tribe (ST) community",
      "Studying in Post-Matriculation or post-secondary courses",
      "Annual family income must not exceed ₹2,50,000",
      "Enrolled in recognized colleges, polytechnics, or universities"
    ],
    "required_documents": [
      "ST Community Certificate issued by Revenue Authority",
      "Income Certificate (under ₹2.5 Lakhs)",
      "Marks card of last qualifying exam",
      "Hosteller certificate (if applicable)",
      "Bank passbook linked to Aadhaar"
    ],
    "application_procedure": [
      "Register on NSP or state tribal welfare portal",
      "Select Post Matric Schemes -> Ministry of Tribal Affairs",
      "Submit academic and fee receipts",
      "District Tribal Welfare Officer scrutinizes and sanctions DBT"
    ],
    "rejection_reasons": [
      "Caste certificate issued by non-authorized official",
      "Income proof exceeding ₹2.5 Lakhs limit",
      "Failure to complete biometric OTR verification"
    ],
    "criteria": {
      "max_income": 250000.0,
      "allowed_categories": ["ST"],
      "allowed_education_levels": ["PUC / 12th", "Diploma", "Undergraduate", "Postgraduate", "PhD"]
    }
  },
  {
    "id": "karnataka-ssp-postmatric",
    "name": "State Scholarship Portal (SSP) Post-Matric Scholarship - Karnataka",
    "provider": "Government of Karnataka (Social Welfare, Tribal, BCW & Minority Depts)",
    "provider_type": "State Government",
    "scheme_type": "Need-based",
    "amount_display": "100% Tuition Fee Reimbursement + Monthly Maintenance",
    "amount_value": 40000.0,
    "deadline": "31 January 2027",
    "deadline_date": "2027-01-31",
    "official_link": "https://ssp.postmatric.karnataka.gov.in",
    "portal_name": "SSP Karnataka Portal",
    "verified": True,
    "source_url": "https://ssp.postmatric.karnataka.gov.in",
    "verification_date": "Karnataka Gazette Notification 2026",
    "description": "Unified state portal for all Karnataka domicile students belonging to SC, ST, OBC, EWS, and Minority categories for college and university fee concessions and stipends.",
    "important_dates_notes": "E-Attestation must be completed prior to final submission. Direct transfer to college and student accounts.",
    "eligibility_summary": [
      "Student must be a permanent resident (domicile) of Karnataka",
      "Pursuing PUC, Diploma, ITI, UG, PG, Medical, Engineering, or PhD in Karnataka",
      "Family income ceiling: SC/ST up to ₹2.5L, Category-1 up to ₹2.5L, 2A/2B/3A/3B up to ₹1.0L, EWS up to ₹8.0L",
      "Valid Kutumba ID / Ration Card registered in Karnataka"
    ],
    "required_documents": [
      "Karnataka Kutumba Family ID",
      "Revenue Dept Income & Caste Certificate RD Numbers",
      "Student Aadhaar and E-Attested marks cards",
      "College Bonafide & College Registration Number (USN / Reg No)",
      "Hostel confirmation from e-Hostel portal (if staying in college/govt hostel)"
    ],
    "application_procedure": [
      "Create account on ssp.postmatric.karnataka.gov.in with Kutumba ID and Aadhaar",
      "Fetch automated digital verification of Caste & Income via RD numbers",
      "Enter University Seat Number (USN) and academic course details",
      "Request e-Attestation of documents from designated college attestation officers"
    ],
    "rejection_reasons": [
      "Non-Karnataka domicile or missing Kutumba ID mapping",
      "RD Number verification mismatch with name in revenue records",
      "Unattested academic marks card on SSP E-Attestation portal"
    ],
    "criteria": {
      "max_income": 800000.0,
      "allowed_states": ["Karnataka"],
      "allowed_education_levels": ["PUC / 12th", "Diploma", "Undergraduate", "Postgraduate", "PhD"]
    }
  },
  {
    "id": "reliance-foundation-ug",
    "name": "Reliance Foundation Undergraduate Scholarship",
    "provider": "Reliance Foundation",
    "provider_type": "Private",
    "scheme_type": "Merit-based",
    "amount_display": "Up to ₹2,00,000 over the duration of degree",
    "amount_value": 50000.0,
    "deadline": "15 October 2026",
    "deadline_date": "2026-10-15",
    "official_link": "https://www.reliancefoundation.org",
    "portal_name": "Reliance Foundation Portal",
    "verified": True,
    "source_url": "https://www.reliancefoundation.org/our-work/education/scholarships",
    "verification_date": "Reliance Foundation Official Portal 2026",
    "description": "Supports first-year undergraduate students across any stream with financial grants, mentorship, and leadership development programs.",
    "important_dates_notes": "Over 5,000 scholarships awarded annually based on merit and financial need.",
    "eligibility_summary": [
      "Resident Indian citizen currently enrolled in 1st year full-time undergraduate degree",
      "Minimum 60% aggregate marks in 12th Standard board exams",
      "Household annual income below ₹15,00,000 (preference given to income < ₹2,50,000)",
      "Must complete the online aptitude test conducted by Reliance Foundation"
    ],
    "required_documents": [
      "Class 12th Marksheet",
      "College Bonafide or Student ID card",
      "Family Income Proof (ITR / Income Certificate / Salary slips)",
      "Aadhaar / Passport for identity",
      "Passport size photograph"
    ],
    "application_procedure": [
      "Visit reliancefoundation.org scholarships section",
      "Complete online eligibility questionnaire and profile registration",
      "Take the mandatory 60-minute online cognitive and mathematics aptitude test",
      "Shortlisted applicants receive final interview invitation"
    ],
    "rejection_reasons": [
      "Applying in 2nd, 3rd or final year of college (1st-year UG only)",
      "Score below 60% in Class 12 board exam",
      "Failing the mandatory online aptitude assessment test"
    ],
    "criteria": {
      "max_income": 1500000.0,
      "min_percentage": 60.0,
      "allowed_education_levels": ["Undergraduate"]
    }
  },
  {
    "id": "hdfc-parivartan-ecss",
    "name": "HDFC Bank Parivartan’s ECSS Programme",
    "provider": "HDFC Bank CSR / Buddy4Study",
    "provider_type": "Private",
    "scheme_type": "Need-based",
    "amount_display": "Up to ₹75,000 per annum",
    "amount_value": 75000.0,
    "deadline": "30 November 2026",
    "deadline_date": "2026-11-30",
    "official_link": "https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme",
    "portal_name": "Buddy4Study / HDFC CSR",
    "verified": True,
    "source_url": "https://www.hdfcbank.com/personal/about-us/corporate-social-responsibility",
    "verification_date": "HDFC CSR Guidelines 2026",
    "description": "Designed to support meritorious and needy students facing financial crises or bereavement to pursue schooling, diploma, undergraduate, or postgraduate education uninterrupted.",
    "important_dates_notes": "Disbursements are directly transferred to college accounts or student accounts via NEFT.",
    "eligibility_summary": [
      "Open for Indian nationals from Class 1 to Post-graduation / Professional studies",
      "Students must have passed previous examination with at least 55% marks",
      "Annual family income must be less than or equal to ₹2,50,000",
      "Preference given to students facing personal or family financial distress"
    ],
    "required_documents": [
      "Previous year marks card (min 55%)",
      "Government issued ID (Aadhaar / Voter ID)",
      "Income Certificate / BPL Card / Salary Slip",
      "Proof of admission (college fee receipt, admission letter)",
      "Student bank account details with canceled cheque"
    ],
    "application_procedure": [
      "Apply online on Buddy4Study portal for HDFC Parivartan ECSS",
      "Upload financial proof and crisis statement (if applicable)",
      "Telephonic interview and background verification by NGO partners"
    ],
    "rejection_reasons": [
      "Family income exceeding ₹2,50,000 per year",
      "Marks below 55% in the previous class/semester",
      "Unclear or unreadable fee receipts"
    ],
    "criteria": {
      "max_income": 250000.0,
      "min_percentage": 55.0,
      "allowed_education_levels": ["SSLC", "PUC / 12th", "Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    "id": "dst-inspire-she",
    "name": "INSPIRE Scholarship for Higher Education (SHE)",
    "provider": "Department of Science and Technology (DST), Govt. of India",
    "provider_type": "Central Government",
    "scheme_type": "Merit-based",
    "amount_display": "₹80,000 per annum (₹60,000 scholarship + ₹20,000 mentorship)",
    "amount_value": 80000.0,
    "deadline": "31 December 2026",
    "deadline_date": "2026-12-31",
    "official_link": "https://online-inspire.gov.in",
    "portal_name": "INSPIRE DST Portal",
    "verified": True,
    "source_url": "https://online-inspire.gov.in",
    "verification_date": "DST Official Gazette 2026",
    "description": "Premier national program to attract talented youth to study Natural and Basic Sciences at the B.Sc., B.S., and Int. M.Sc./M.S. level.",
    "important_dates_notes": "Must be enrolled in basic science degree disciplines.",
    "eligibility_summary": [
      "Top 1% meritorious students in Class 12 board examinations across India",
      "Or rank holders in JEE Advanced / NEET within top 10,000 ranks",
      "Enrolled in regular B.Sc., B.S., Int. M.Sc. in Natural & Basic Sciences (Physics, Chemistry, Maths, Biology, Geology, etc.)",
      "Age between 17 and 22 years"
    ],
    "required_documents": [
      "Class 12th Marksheet indicating board cut-off top 1%",
      "INSPIRE Eligibility Note / Advisory Note from State/Central Board",
      "Endorsement Certificate signed by College Principal / Registrar",
      "Aadhaar seeded SBI bank account details"
    ],
    "application_procedure": [
      "Register on online-inspire.gov.in",
      "Upload Class 12 marksheet and Principal Endorsement form",
      "Annual renewal requires maintaining at least 60% marks in college exams"
    ],
    "rejection_reasons": [
      "Enrolled in professional/applied degrees (e.g., Engineering B.Tech, MBBS, BCA, B.Com - strictly for Basic Sciences)",
      "Class 12 board percentage below the top 1% cut-off announced by DST",
      "Age over 22 years at the time of application"
    ],
    "criteria": {
      "min_percentage": 85.0,
      "allowed_education_levels": ["Undergraduate", "Postgraduate"],
      "course_keywords": ["Science", "B.Sc", "BS", "M.Sc", "Physics", "Chemistry", "Mathematics", "Biology", "Botany", "Zoology"]
    }
  }
]

def seed_scholarships_if_empty(db: Session):
    existing_count = db.query(Scholarship).count()
    if existing_count > 0:
        return

    for item in VERIFIED_SCHOLARSHIPS_DATA:
        crit_data = item.get("criteria", {})
        
        sch = Scholarship(
            id=item["id"],
            name=item["name"],
            provider=item["provider"],
            provider_type=item["provider_type"],
            scheme_type=item["scheme_type"],
            amount_display=item["amount_display"],
            amount_value=item["amount_value"],
            deadline=item["deadline"],
            deadline_date=item["deadline_date"],
            official_link=item["official_link"],
            portal_name=item["portal_name"],
            verified=item["verified"],
            description=item["description"],
            source_url=item["source_url"],
            verification_date=item["verification_date"],
            important_dates_notes=item.get("important_dates_notes"),
            eligibility_summary_json=json.dumps(item.get("eligibility_summary", [])),
            required_documents_json=json.dumps(item.get("required_documents", [])),
            application_procedure_json=json.dumps(item.get("application_procedure", [])),
            rejection_reasons_json=json.dumps(item.get("rejection_reasons", []))
        )
        db.add(sch)
        db.flush()

        criteria = EligibilityCriteria(
            scholarship_id=sch.id,
            max_income=crit_data.get("max_income"),
            min_percentage=crit_data.get("min_percentage"),
            allowed_education_levels_json=json.dumps(crit_data.get("allowed_education_levels", [])),
            allowed_categories_json=json.dumps(crit_data.get("allowed_categories", [])),
            allowed_genders_json=json.dumps(crit_data.get("allowed_genders", [])),
            allowed_states_json=json.dumps(crit_data.get("allowed_states", [])),
            allowed_institution_types_json=json.dumps(crit_data.get("allowed_institution_types", [])),
            requires_minority=crit_data.get("requires_minority", False),
            requires_disability=crit_data.get("requires_disability", False),
            min_disability_percentage=crit_data.get("min_disability_percentage"),
            disallow_other_scholarships=crit_data.get("disallow_other_scholarships", False),
            course_keywords_json=json.dumps(crit_data.get("course_keywords", []))
        )
        db.add(criteria)

    db.commit()
