import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import engine, Base, get_db
from backend.models import Student, Scholarship, EligibilityCriteria, SavedScholarship, Application
from backend.app.models.user import User, RevokedToken
from backend.schemas import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    ScholarshipResponse,
    EligibilityCriteriaSchema,
    MatchResultResponse,
    MatchEvaluationSummary,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    BookmarkCreate,
    BookmarkResponse,
)
from backend.rule_engine import evaluate_scholarship, parse_json_list
from backend.seed_data import seed_scholarships_if_empty
from backend.app.routers.auth import router as auth_router
from backend.app.routers.notifications import router as notifications_router
from backend.app.services.notification_service import (
    match_and_notify_students_for_scholarship,
    scan_all_matches_for_user
)
from backend.app.dependencies.auth import get_current_user, get_current_user_optional

# Create all tables (including User, RevokedToken, Notification, NotificationPreference)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ScholarFind API",
    description="Intelligent Indian Scholarship Discovery Platform with Argon2 & JWT Authentication",
    version="2.1.0"
)

# CORS configuration - allow credentials for HttpOnly cookie transfer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Authentication router at both /auth and /api/auth
app.include_router(auth_router, prefix="/auth")
app.include_router(auth_router, prefix="/api/auth")

# Mount Notifications router at both /notifications and /api/notifications
app.include_router(notifications_router, prefix="/api")
app.include_router(notifications_router, prefix="")

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        seed_scholarships_if_empty(db)
    finally:
        db.close()


@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ScholarFind FastAPI Backend",
        "auth_engine": "Argon2id + JWT + Server Revocation",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


# ==================== STUDENT APIS (PROTECTED) ====================

@app.post("/api/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update student profile for authenticated user."""
    student_id = payload.id or current_user.id
    
    # Check if student already exists
    existing = db.query(Student).filter(Student.id == student_id).first()
    if existing:
        # Update existing
        for field, value in payload.model_dump(exclude_unset=True).items():
            if field != "id":
                setattr(existing, field, value)
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        try:
            scan_all_matches_for_user(db, current_user, existing)
        except Exception as e:
            pass
        return existing

    student_data = payload.model_dump()
    student_data["id"] = student_id
    student = Student(**student_data)
    db.add(student)
    db.commit()
    db.refresh(student)
    try:
        scan_all_matches_for_user(db, current_user, student)
    except Exception as e:
        pass
    return student


@app.get("/api/students/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve student profile for authenticated user."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@app.put("/api/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update student profile for authenticated user."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(student, field, value)

    student.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(student)
    return student


# ==================== SCHOLARSHIP APIS (PUBLIC EXPLORATION) ====================

def serialize_scholarship(sch: Scholarship) -> ScholarshipResponse:
    rules_schema = None
    if sch.criteria:
        c = sch.criteria
        rules_schema = EligibilityCriteriaSchema(
            max_income=c.max_income,
            min_percentage=c.min_percentage,
            allowed_education_levels=parse_json_list(c.allowed_education_levels_json),
            allowed_categories=parse_json_list(c.allowed_categories_json),
            allowed_genders=parse_json_list(c.allowed_genders_json),
            allowed_states=parse_json_list(c.allowed_states_json),
            allowed_institution_types=parse_json_list(c.allowed_institution_types_json),
            requires_minority=c.requires_minority,
            requires_disability=c.requires_disability,
            min_disability_percentage=c.min_disability_percentage,
            disallow_other_scholarships=c.disallow_other_scholarships,
            course_keywords=parse_json_list(c.course_keywords_json),
        )

    return ScholarshipResponse(
        id=sch.id,
        name=sch.name,
        provider=sch.provider,
        provider_type=sch.provider_type,
        scheme_type=sch.scheme_type,
        amount_display=sch.amount_display,
        amount_value=sch.amount_value,
        deadline=sch.deadline,
        deadline_date=sch.deadline_date,
        official_link=sch.official_link,
        portal_name=sch.portal_name,
        verified=sch.verified,
        description=sch.description,
        source_url=sch.source_url,
        verification_date=sch.verification_date,
        important_dates_notes=sch.important_dates_notes,
        eligibility_criteria_summary=parse_json_list(sch.eligibility_summary_json),
        required_documents=parse_json_list(sch.required_documents_json),
        application_procedure=parse_json_list(sch.application_procedure_json),
        rejection_reasons=parse_json_list(sch.rejection_reasons_json),
        rules=rules_schema,
    )


@app.get("/api/scholarships", response_model=List[ScholarshipResponse])
def get_scholarships(
    query: Optional[str] = None,
    provider_type: Optional[str] = None,
    scheme_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Scholarship)

    if provider_type and provider_type != "ALL":
        q = q.filter(Scholarship.provider_type == provider_type)

    if scheme_type and scheme_type != "ALL":
        q = q.filter(Scholarship.scheme_type == scheme_type)

    scholarships = q.all()

    if query and query.strip():
        search_term = query.strip().lower()
        scholarships = [
            s for s in scholarships
            if search_term in s.name.lower() or search_term in s.provider.lower() or search_term in s.description.lower()
        ]

    return [serialize_scholarship(s) for s in scholarships]


@app.get("/api/scholarships/{scholarship_id}", response_model=ScholarshipResponse)
def get_scholarship_by_id(scholarship_id: str, db: Session = Depends(get_db)):
    sch = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not sch:
        raise HTTPException(status_code=404, detail="Scholarship scheme not found")
    return serialize_scholarship(sch)


@app.post("/api/scholarships", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_scholarship(
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Add a new scholarship to the database.
    Automatically evaluates student profile criteria and sends email alerts to matching users.
    """
    import json
    sch_id = payload.get("id") or str(uuid.uuid4())
    
    # Check if exists
    existing = db.query(Scholarship).filter(Scholarship.id == sch_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scholarship ID already exists")

    new_sch = Scholarship(
        id=sch_id,
        name=payload["name"],
        provider=payload["provider"],
        provider_type=payload.get("provider_type", "Central Government"),
        scheme_type=payload.get("scheme_type", "Merit-cum-Means"),
        amount_display=payload["amount_display"],
        amount_value=float(payload.get("amount_value", 0.0)),
        deadline=payload["deadline"],
        deadline_date=payload.get("deadline_date", "2026-12-31"),
        official_link=payload["official_link"],
        portal_name=payload.get("portal_name", "National Scholarship Portal (NSP)"),
        verified=payload.get("verified", True),
        description=payload.get("description", ""),
        source_url=payload.get("source_url", "https://scholarships.gov.in"),
        verification_date=payload.get("verification_date", "2026-11-12"),
        important_dates_notes=payload.get("important_dates_notes", ""),
        eligibility_summary_json=json.dumps(payload.get("eligibility_criteria_summary", payload.get("eligibility_summary", []))),
        required_documents_json=json.dumps(payload.get("required_documents", [])),
        application_procedure_json=json.dumps(payload.get("application_procedure", [])),
        rejection_reasons_json=json.dumps(payload.get("rejection_reasons", []))
    )
    db.add(new_sch)
    db.commit()
    db.refresh(new_sch)

    # Criteria setup
    rules = payload.get("rules", {})
    criteria = EligibilityCriteria(
        scholarship_id=new_sch.id,
        max_income=rules.get("max_income") or rules.get("maxIncome"),
        min_percentage=rules.get("min_percentage") or rules.get("minPercentage"),
        allowed_education_levels_json=json.dumps(rules.get("allowed_education_levels", rules.get("allowedEducationLevels", []))),
        allowed_categories_json=json.dumps(rules.get("allowed_categories", rules.get("allowedCategories", []))),
        allowed_genders_json=json.dumps(rules.get("allowed_genders", rules.get("allowedGenders", []))),
        allowed_states_json=json.dumps(rules.get("allowed_states", rules.get("allowedStates", []))),
        allowed_institution_types_json=json.dumps(rules.get("allowed_institution_types", rules.get("allowedInstitutionTypes", []))),
        requires_minority=rules.get("requires_minority", rules.get("requiresMinority", False)),
        requires_disability=rules.get("requires_disability", rules.get("requiresDisability", False)),
        min_disability_percentage=rules.get("min_disability_percentage") or rules.get("minDisabilityPercentage"),
        disallow_other_scholarships=rules.get("disallow_other_scholarships", rules.get("disallowOtherScholarships", False)),
        course_keywords_json=json.dumps(rules.get("course_keywords", rules.get("courseKeywords", [])))
    )
    db.add(criteria)
    db.commit()

    # Automatically notify all students with matching criteria
    notifs = match_and_notify_students_for_scholarship(db, new_sch)

    return {
        "message": f"Scholarship '{new_sch.name}' created successfully.",
        "scholarship_id": new_sch.id,
        "matching_students_notified": len(notifs),
        "notifications": [n.to_dict() for n in notifs]
    }


# ==================== RULE ENGINE MATCHING APIS (PROTECTED) ====================

@app.post("/api/students/{student_id}/match", response_model=MatchEvaluationSummary)
def match_scholarships_for_student(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate matching for registered student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    scholarships = db.query(Scholarship).all()
    results: List[MatchResultResponse] = []

    for sch in scholarships:
        res = evaluate_scholarship(student, sch)
        results.append(res)

    status_weights = {"ELIGIBLE": 1, "POSSIBLY_ELIGIBLE": 2, "NOT_ELIGIBLE": 3}
    results.sort(key=lambda x: (status_weights.get(x.status, 4), -x.scholarship.amount_value))

    eligible_cnt = sum(1 for r in results if r.status == "ELIGIBLE")
    possibly_cnt = sum(1 for r in results if r.status == "POSSIBLY_ELIGIBLE")
    not_eligible_cnt = sum(1 for r in results if r.status == "NOT_ELIGIBLE")
    aid_potential = sum(r.scholarship.amount_value for r in results if r.status in ["ELIGIBLE", "POSSIBLY_ELIGIBLE"])

    return MatchEvaluationSummary(
        student_id=student.id,
        total_evaluated=len(results),
        eligible_count=eligible_cnt,
        possibly_eligible_count=possibly_cnt,
        not_eligible_count=not_eligible_cnt,
        qualified_aid_potential=aid_potential,
        results=results
    )


@app.post("/api/match", response_model=MatchEvaluationSummary)
def match_transient_profile(
    payload: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate matching for authenticated student's entered criteria."""
    student_dict = payload.model_dump()
    student_dict["id"] = payload.id or current_user.id
    student = Student(**student_dict)

    scholarships = db.query(Scholarship).all()
    results: List[MatchResultResponse] = []

    for sch in scholarships:
        res = evaluate_scholarship(student, sch)
        results.append(res)

    status_weights = {"ELIGIBLE": 1, "POSSIBLY_ELIGIBLE": 2, "NOT_ELIGIBLE": 3}
    results.sort(key=lambda x: (status_weights.get(x.status, 4), -x.scholarship.amount_value))

    eligible_cnt = sum(1 for r in results if r.status == "ELIGIBLE")
    possibly_cnt = sum(1 for r in results if r.status == "POSSIBLY_ELIGIBLE")
    not_eligible_cnt = sum(1 for r in results if r.status == "NOT_ELIGIBLE")
    aid_potential = sum(r.scholarship.amount_value for r in results if r.status in ["ELIGIBLE", "POSSIBLY_ELIGIBLE"])

    return MatchEvaluationSummary(
        student_id=student.id,
        total_evaluated=len(results),
        eligible_count=eligible_cnt,
        possibly_eligible_count=possibly_cnt,
        not_eligible_count=not_eligible_cnt,
        qualified_aid_potential=aid_potential,
        results=results
    )


# ==================== BOOKMARK APIS (PROTECTED) ====================

@app.get("/api/students/{student_id}/bookmarks", response_model=List[str])
def get_student_bookmarks(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmarks = db.query(SavedScholarship.scholarship_id).filter(SavedScholarship.student_id == student_id).all()
    return [b[0] for b in bookmarks]


@app.post("/api/students/{student_id}/bookmarks", response_model=BookmarkResponse)
def add_bookmark(
    student_id: str,
    payload: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(SavedScholarship).filter(
        SavedScholarship.student_id == student_id,
        SavedScholarship.scholarship_id == payload.scholarship_id
    ).first()
    if existing:
        return existing

    b = SavedScholarship(student_id=student_id, scholarship_id=payload.scholarship_id)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@app.delete("/api/students/{student_id}/bookmarks/{scholarship_id}")
def remove_bookmark(
    student_id: str,
    scholarship_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(SavedScholarship).filter(
        SavedScholarship.student_id == student_id,
        SavedScholarship.scholarship_id == scholarship_id
    ).delete()
    db.commit()
    return {"message": "Bookmark removed"}


# ==================== APPLICATION TRACKING APIS (PROTECTED) ====================

@app.get("/api/students/{student_id}/applications", response_model=List[ApplicationResponse])
def get_applications(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.student_id == student_id).all()
    return apps


@app.post("/api/students/{student_id}/applications", response_model=ApplicationResponse)
def create_or_update_application(
    student_id: str,
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(Application).filter(
        Application.student_id == student_id,
        Application.scholarship_id == payload.scholarship_id
    ).first()

    if existing:
        existing.status = payload.status
        if payload.applied_date is not None:
            existing.applied_date = payload.applied_date
        if payload.application_reference_number is not None:
            existing.application_reference_number = payload.application_reference_number
        if payload.notes is not None:
            existing.notes = payload.notes
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    app_record = Application(
        student_id=student_id,
        scholarship_id=payload.scholarship_id,
        status=payload.status,
        applied_date=payload.applied_date or (datetime.date.today().isoformat() if payload.status == "Applied" else None),
        application_reference_number=payload.application_reference_number,
        notes=payload.notes,
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    return app_record


@app.put("/api/students/{student_id}/applications/{scholarship_id}", response_model=ApplicationResponse)
def update_application_details(
    student_id: str,
    scholarship_id: str,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Application).filter(
        Application.student_id == student_id,
        Application.scholarship_id == scholarship_id
    ).first()

    if not existing:
        existing = Application(
            student_id=student_id,
            scholarship_id=scholarship_id,
            status=payload.status or "Interested",
            applied_date=payload.applied_date,
            application_reference_number=payload.application_reference_number,
            notes=payload.notes,
        )
        db.add(existing)
    else:
        if payload.status is not None:
            existing.status = payload.status
        if payload.applied_date is not None:
            existing.applied_date = payload.applied_date
        if payload.application_reference_number is not None:
            existing.application_reference_number = payload.application_reference_number
        if payload.notes is not None:
            existing.notes = payload.notes
        existing.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(existing)
    return existing
