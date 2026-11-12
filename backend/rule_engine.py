import json
from typing import List, Dict, Any, Tuple
from .models import Student, Scholarship, EligibilityCriteria
from .schemas import MatchResultResponse, ScholarshipResponse, EligibilityCriteriaSchema

def parse_json_list(val: Any) -> List[str]:
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        parsed = json.loads(val)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []

def evaluate_scholarship(student: Student, scholarship: Scholarship) -> MatchResultResponse:
    matched_reasons: List[str] = []
    missing_verifications: List[str] = []
    exclusion_reasons: List[str] = []

    criteria: EligibilityCriteria = scholarship.criteria

    if criteria:
        allowed_genders = parse_json_list(criteria.allowed_genders_json)
        allowed_states = parse_json_list(criteria.allowed_states_json)
        allowed_levels = parse_json_list(criteria.allowed_education_levels_json)
        allowed_categories = parse_json_list(criteria.allowed_categories_json)
        allowed_institutions = parse_json_list(criteria.allowed_institution_types_json)
        course_keywords = parse_json_list(criteria.course_keywords_json)

        # 1. Gender check
        if allowed_genders:
            if student.gender.lower() not in [g.lower() for g in allowed_genders]:
                exclusion_reasons.append(
                    f"This scholarship is strictly reserved for {', '.join(allowed_genders)} students."
                )
            else:
                matched_reasons.append(
                    f"Applicant gender ({student.gender.upper()}) satisfies the required gender criterion."
                )

        # 2. State Domicile check
        if allowed_states:
            student_state = student.state.strip().lower()
            matched_state = any(st.strip().lower() == student_state for st in allowed_states)
            if not matched_state:
                exclusion_reasons.append(
                    f"Restricted to permanent residents of {', '.join(allowed_states)}. (Your state: {student.state})"
                )
            else:
                matched_reasons.append(
                    f"State domicile ({student.state}) satisfies the geographic eligibility condition."
                )

        # 3. Education Level check
        if allowed_levels:
            if student.education_level not in allowed_levels:
                exclusion_reasons.append(
                    f"Requires enrollment in {', '.join(allowed_levels)}. (Current level: {student.education_level})"
                )
            else:
                matched_reasons.append(
                    f"Current education level ({student.education_level}) qualifies for this scheme."
                )

        # 4. Caste / Category check
        if allowed_categories:
            if student.category not in allowed_categories:
                exclusion_reasons.append(
                    f"Quota category requirement: {' / '.join(allowed_categories)}. (Your category: {student.category})"
                )
            else:
                matched_reasons.append(
                    f"Social reservation category ({student.category}) qualifies for this scheme."
                )

        # 5. Minority Requirement check
        if criteria.requires_minority:
            if not student.is_minority:
                exclusion_reasons.append(
                    "Exclusively intended for students from notified religious minority communities."
                )
            else:
                matched_reasons.append(
                    f"Notified minority status ({student.minority_community or 'Community'}) qualifies."
                )

        # 6. Disability Requirement check
        if criteria.requires_disability:
            if not student.has_disability:
                exclusion_reasons.append(
                    "Mandatory requirement: Specially abled candidate with certified benchmark disability."
                )
            elif criteria.min_disability_percentage and (student.disability_percentage or 0) < criteria.min_disability_percentage:
                exclusion_reasons.append(
                    f"Certified disability benchmark must be at least {criteria.min_disability_percentage}% (Recorded: {student.disability_percentage or 0}%)."
                )
            else:
                matched_reasons.append(
                    f"Disability benchmark verified ({student.disability_percentage or 40}% UDID standard satisfied)."
                )

        # 7. Academic Percentage check
        if criteria.min_percentage is not None:
            student_marks = student.prev_exam_percentage or 0.0
            if student.current_cgpa and student.current_cgpa <= 10.0:
                cgpa_pct = student.current_cgpa * 9.5
                student_marks = max(student_marks, cgpa_pct)

            if student_marks < criteria.min_percentage:
                exclusion_reasons.append(
                    f"Academic percentage {student_marks:.1f}% is below the minimum required cut-off of {criteria.min_percentage}%."
                )
            else:
                matched_reasons.append(
                    f"Academic score of {student_marks:.1f}% satisfies the minimum threshold of {criteria.min_percentage}%."
                )

        # 8. Annual Family Income check
        if criteria.max_income is not None:
            if student.annual_family_income > criteria.max_income:
                exclusion_reasons.append(
                    f"Annual family income of ₹{int(student.annual_family_income):,} exceeds the maximum ceiling of ₹{int(criteria.max_income):,}."
                )
            else:
                matched_reasons.append(
                    f"Annual family income (₹{int(student.annual_family_income):,}) is within the permissible limit of ₹{int(criteria.max_income):,}."
                )

                if not student.has_income_certificate:
                    missing_verifications.append(
                        "Requires issuance and verification of a valid Revenue Dept Income Certificate."
                    )

        # 9. Existing Concurrent Scholarship check
        if criteria.disallow_other_scholarships and student.already_receives_scholarship:
            exclusion_reasons.append(
                f"Guideline strictly prohibits availing this scholarship while receiving another government scholarship ({student.existing_scholarship_name or 'existing scheme'})."
            )

        # 10. Course Keyword / Discipline check
        if course_keywords:
            course_text = f"{student.course} {student.education_level}".lower()
            if not any(kw.lower() in course_text for kw in course_keywords):
                exclusion_reasons.append(
                    f"Restricted to eligible degree disciplines ({', '.join(course_keywords[:5])}). Your course: {student.course}."
                )
            else:
                matched_reasons.append("Course discipline matches the eligible study domain.")

        # 11. Institution Type check
        if allowed_institutions:
            if student.institution_type not in allowed_institutions:
                missing_verifications.append(
                    f"Requires institution recognition verification ({'/'.join(allowed_institutions)})."
                )
            else:
                matched_reasons.append(f"Enrolled in eligible {student.institution_type} institution.")

    # Missing certificate verification checks
    if student.category != "General" and not student.has_income_certificate:
        missing_verifications.append(
            "Caste and Income certificate digital verification with barcode/RD number required."
        )

    # Classification into 3 states
    if exclusion_reasons:
        status = "NOT_ELIGIBLE"
    elif missing_verifications:
        status = "POSSIBLY_ELIGIBLE"
    else:
        status = "ELIGIBLE"

    # Convert scholarship to Pydantic model
    rules_schema = None
    if criteria:
        rules_schema = EligibilityCriteriaSchema(
            max_income=criteria.max_income,
            min_percentage=criteria.min_percentage,
            allowed_education_levels=parse_json_list(criteria.allowed_education_levels_json),
            allowed_categories=parse_json_list(criteria.allowed_categories_json),
            allowed_genders=parse_json_list(criteria.allowed_genders_json),
            allowed_states=parse_json_list(criteria.allowed_states_json),
            allowed_institution_types=parse_json_list(criteria.allowed_institution_types_json),
            requires_minority=criteria.requires_minority,
            requires_disability=criteria.requires_disability,
            min_disability_percentage=criteria.min_disability_percentage,
            disallow_other_scholarships=criteria.disallow_other_scholarships,
            course_keywords=parse_json_list(criteria.course_keywords_json),
        )

    sch_response = ScholarshipResponse(
        id=scholarship.id,
        name=scholarship.name,
        provider=scholarship.provider,
        provider_type=scholarship.provider_type,
        scheme_type=scholarship.scheme_type,
        amount_display=scholarship.amount_display,
        amount_value=scholarship.amount_value,
        deadline=scholarship.deadline,
        deadline_date=scholarship.deadline_date,
        official_link=scholarship.official_link,
        portal_name=scholarship.portal_name,
        verified=scholarship.verified,
        description=scholarship.description,
        source_url=scholarship.source_url,
        verification_date=scholarship.verification_date,
        important_dates_notes=scholarship.important_dates_notes,
        eligibility_criteria_summary=parse_json_list(scholarship.eligibility_summary_json),
        required_documents=parse_json_list(scholarship.required_documents_json),
        application_procedure=parse_json_list(scholarship.application_procedure_json),
        rejection_reasons=parse_json_list(scholarship.rejection_reasons_json),
        rules=rules_schema,
    )

    return MatchResultResponse(
        scholarship=sch_response,
        status=status,
        matched_reasons=matched_reasons,
        missing_or_pending_verifications=missing_verifications,
        exclusion_reasons=exclusion_reasons,
    )
