import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base
from backend.app.models.user import User, RevokedToken
from backend.app.models.notification import Notification, NotificationPreference
from backend.app.models.password_reset import PasswordResetToken

class Student(Base):
    __tablename__ = "students"

    id = Column(String(64), primary_key=True, index=True)
    
    # Personal Information
    full_name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    nationality = Column(String(50), default="Indian")
    residence = Column(String(20), default="Urban")
    has_disability = Column(Boolean, default=False)
    disability_percentage = Column(Integer, nullable=True)

    # Educational Information
    education_level = Column(String(50), nullable=False, index=True)
    course = Column(String(150), nullable=False)
    institution_name = Column(String(200), nullable=False)
    current_year = Column(Integer, default=1)
    prev_exam_percentage = Column(Float, nullable=False)
    current_cgpa = Column(Float, nullable=True)
    institution_type = Column(String(50), default="Government")

    # Category Information
    category = Column(String(30), nullable=False, index=True)
    is_minority = Column(Boolean, default=False)
    minority_community = Column(String(50), nullable=True)

    # Financial Information
    annual_family_income = Column(Float, nullable=False, index=True)
    parent_occupation = Column(String(100), nullable=False)
    family_members_count = Column(Integer, default=4)
    siblings_studying_count = Column(Integer, default=1)
    has_income_certificate = Column(Boolean, default=False)

    # Additional Information
    scholar_type = Column(String(30), default="Day Scholar")
    already_receives_scholarship = Column(Boolean, default=False)
    existing_scholarship_name = Column(String(200), nullable=True)
    sports_achievements = Column(Text, nullable=True)
    academic_achievements = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    bookmarks = relationship("SavedScholarship", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(250), nullable=False)
    provider = Column(String(250), nullable=False)
    provider_type = Column(String(50), nullable=False, index=True)
    scheme_type = Column(String(50), nullable=False, index=True)
    amount_display = Column(String(150), nullable=False)
    amount_value = Column(Float, nullable=False, default=0.0, index=True)
    deadline = Column(String(100), nullable=False)
    deadline_date = Column(String(20), nullable=False, index=True)
    official_link = Column(String(500), nullable=False)
    portal_name = Column(String(150), nullable=False)
    verified = Column(Boolean, default=True)
    description = Column(Text, nullable=False)
    
    # Official verification tracking
    source_url = Column(String(500), nullable=False)
    verification_date = Column(String(50), nullable=False)
    important_dates_notes = Column(Text, nullable=True)

    # Serialized JSON lists for rich display
    eligibility_summary_json = Column(Text, nullable=False)
    required_documents_json = Column(Text, nullable=False)
    application_procedure_json = Column(Text, nullable=False)
    rejection_reasons_json = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    criteria = relationship("EligibilityCriteria", back_populates="scholarship", uselist=False, cascade="all, delete-orphan")
    saved_by = relationship("SavedScholarship", back_populates="scholarship", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="scholarship", cascade="all, delete-orphan")


class EligibilityCriteria(Base):
    __tablename__ = "eligibility_criteria"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scholarship_id = Column(String(64), ForeignKey("scholarships.id"), unique=True, nullable=False)

    max_income = Column(Float, nullable=True)
    min_percentage = Column(Float, nullable=True)
    allowed_education_levels_json = Column(Text, nullable=True)
    allowed_categories_json = Column(Text, nullable=True)
    allowed_genders_json = Column(Text, nullable=True)
    allowed_states_json = Column(Text, nullable=True)
    allowed_institution_types_json = Column(Text, nullable=True)
    requires_minority = Column(Boolean, default=False)
    requires_disability = Column(Boolean, default=False)
    min_disability_percentage = Column(Integer, nullable=True)
    disallow_other_scholarships = Column(Boolean, default=False)
    course_keywords_json = Column(Text, nullable=True)

    scholarship = relationship("Scholarship", back_populates="criteria")


class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False, index=True)
    scholarship_id = Column(String(64), ForeignKey("scholarships.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="bookmarks")
    scholarship = relationship("Scholarship", back_populates="saved_by")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False, index=True)
    scholarship_id = Column(String(64), ForeignKey("scholarships.id"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="Not Applied")  # 'Interested', 'Applied', 'Not Applied'
    applied_date = Column(String(50), nullable=True)
    application_reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="applications")
    scholarship = relationship("Scholarship", back_populates="applications")
