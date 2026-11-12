from typing import List, Optional
from pydantic import BaseModel, Field

# --- Student Schemas ---
class StudentBase(BaseModel):
    full_name: str
    age: int
    gender: str
    state: str
    district: str
    nationality: str = "Indian"
    residence: str = "Urban"
    has_disability: bool = False
    disability_percentage: Optional[int] = None

    education_level: str
    course: str
    institution_name: str
    current_year: int = 1
    prev_exam_percentage: float
    current_cgpa: Optional[float] = None
    institution_type: str = "Government"

    category: str
    is_minority: bool = False
    minority_community: Optional[str] = None

    annual_family_income: float
    parent_occupation: str
    family_members_count: int = 4
    siblings_studying_count: int = 1
    has_income_certificate: bool = False

    scholar_type: str = "Day Scholar"
    already_receives_scholarship: bool = False
    existing_scholarship_name: Optional[str] = None
    sports_achievements: Optional[str] = None
    academic_achievements: Optional[str] = None

class StudentCreate(StudentBase):
    id: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    nationality: Optional[str] = None
    residence: Optional[str] = None
    has_disability: Optional[bool] = None
    disability_percentage: Optional[int] = None

    education_level: Optional[str] = None
    course: Optional[str] = None
    institution_name: Optional[str] = None
    current_year: Optional[int] = None
    prev_exam_percentage: Optional[float] = None
    current_cgpa: Optional[float] = None
    institution_type: Optional[str] = None

    category: Optional[str] = None
    is_minority: Optional[bool] = None
    minority_community: Optional[str] = None

    annual_family_income: Optional[float] = None
    parent_occupation: Optional[str] = None
    family_members_count: Optional[int] = None
    siblings_studying_count: Optional[int] = None
    has_income_certificate: Optional[bool] = None

    scholar_type: Optional[str] = None
    already_receives_scholarship: Optional[bool] = None
    existing_scholarship_name: Optional[str] = None
    sports_achievements: Optional[str] = None
    academic_achievements: Optional[str] = None

class StudentResponse(StudentBase):
    id: str

    class Config:
        from_attributes = True


# --- Criteria & Scholarship Schemas ---
class EligibilityCriteriaSchema(BaseModel):
    max_income: Optional[float] = None
    min_percentage: Optional[float] = None
    allowed_education_levels: List[str] = Field(default_factory=list)
    allowed_categories: List[str] = Field(default_factory=list)
    allowed_genders: List[str] = Field(default_factory=list)
    allowed_states: List[str] = Field(default_factory=list)
    allowed_institution_types: List[str] = Field(default_factory=list)
    requires_minority: bool = False
    requires_disability: bool = False
    min_disability_percentage: Optional[int] = None
    disallow_other_scholarships: bool = False
    course_keywords: List[str] = Field(default_factory=list)

class ScholarshipResponse(BaseModel):
    id: str
    name: str
    provider: str
    provider_type: str
    scheme_type: str
    amount_display: str
    amount_value: float
    deadline: str
    deadline_date: str
    official_link: str
    portal_name: str
    verified: bool
    description: str
    source_url: str
    verification_date: str
    important_dates_notes: Optional[str] = None

    eligibility_criteria_summary: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    application_procedure: List[str] = Field(default_factory=list)
    rejection_reasons: List[str] = Field(default_factory=list)
    rules: Optional[EligibilityCriteriaSchema] = None

    class Config:
        from_attributes = True


# --- Rule Engine Match Schemas ---
class MatchResultResponse(BaseModel):
    scholarship: ScholarshipResponse
    status: str  # 'ELIGIBLE', 'POSSIBLY_ELIGIBLE', 'NOT_ELIGIBLE'
    matched_reasons: List[str]
    missing_or_pending_verifications: List[str]
    exclusion_reasons: List[str]

class MatchEvaluationSummary(BaseModel):
    student_id: Optional[str] = None
    total_evaluated: int
    eligible_count: int
    possibly_eligible_count: int
    not_eligible_count: int
    qualified_aid_potential: float
    results: List[MatchResultResponse]


# --- Application Tracking Schemas ---
class ApplicationCreate(BaseModel):
    scholarship_id: str
    status: str = "Interested"  # 'Interested', 'Applied', 'Not Applied'
    applied_date: Optional[str] = None
    application_reference_number: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[str] = None
    application_reference_number: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    student_id: str
    scholarship_id: str
    status: str
    applied_date: Optional[str] = None
    application_reference_number: Optional[str] = None
    notes: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


# --- Bookmark Schemas ---
class BookmarkCreate(BaseModel):
    scholarship_id: str

class BookmarkResponse(BaseModel):
    id: int
    student_id: str
    scholarship_id: str

    class Config:
        from_attributes = True
