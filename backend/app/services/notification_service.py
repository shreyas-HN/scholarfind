import os
import json
import logging
import smtplib
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session

from backend.models import Student, Scholarship
from backend.app.models.user import User
from backend.app.models.notification import Notification, NotificationPreference
from backend.rule_engine import evaluate_scholarship

logger = logging.getLogger("scholarfind.notifications")

# SMTP Configuration via environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER or "alerts@scholarfind.gov.in.assist")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ScholarFind Alert Engine")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


def generate_scholarship_alert_html(
    student_name: str,
    scholarship_name: str,
    provider: str,
    amount_display: str,
    deadline: str,
    official_link: str,
    portal_name: str,
    matched_reasons: List[str]
) -> str:
    """Generate high-contrast, professional HTML email template."""
    reasons_html = "".join([
        f"<li style='margin-bottom: 6px; color: #202B38;'>{reason}</li>"
        for reason in matched_reasons
    ]) or "<li style='color: #202B38;'>Matched all academic and income criteria.</li>"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Matching Scholarship: {scholarship_name}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F8F5; margin: 0; padding: 24px; color: #202B38;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5EAE8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(20, 43, 74, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #142B4A; padding: 28px 32px; text-align: left; border-bottom: 3px solid #159A80;">
        <span style="display: inline-block; color: #159A80; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">SCHOLARFIND NOTIFICATION ENGINE</span>
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 8px 0 0 0;">New Matching Scholarship Discovered</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>{student_name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #718096; margin: 0 0 24px 0;">
          Our deterministic scholarship rule engine has identified a newly verified scholarship opportunity that matches your academic, state domicile, and financial criteria.
        </p>

        <!-- Scholarship Highlight Card -->
        <div style="background-color: #F7F8F5; border: 1px solid #E5EAE8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <span style="font-size: 11px; font-weight: 600; color: #159A80; text-transform: uppercase; letter-spacing: 1px;">Official Verified Scheme</span>
          <h2 style="font-size: 18px; font-weight: 700; color: #142B4A; margin: 6px 0 4px 0;">{scholarship_name}</h2>
          <p style="font-size: 12px; color: #718096; margin: 0 0 16px 0;">Provider: <strong>{provider}</strong> ({portal_name})</p>

          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #E5EAE8; padding-top: 12px;">
            <tr>
              <td width="50%" style="vertical-align: top;">
                <span style="font-size: 11px; color: #718096; text-transform: uppercase; font-family: monospace;">Benefit Amount</span>
                <p style="font-size: 16px; font-weight: 700; color: #142B4A; margin: 4px 0 0 0;">{amount_display}</p>
              </td>
              <td width="50%" style="vertical-align: top;">
                <span style="font-size: 11px; color: #718096; text-transform: uppercase; font-family: monospace;">Application Deadline</span>
                <p style="font-size: 14px; font-weight: 600; color: #159A80; margin: 4px 0 0 0;">{deadline}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Matched Criteria Breakdown -->
        <div style="margin-bottom: 28px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #142B4A; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 10px 0; font-family: monospace;">Why Your Profile Qualifies:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
            {reasons_html}
          </ul>
        </div>

        <!-- Action Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <a href="{official_link}" target="_blank" style="display: inline-block; background-color: #159A80; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 6px rgba(21, 154, 128, 0.3);">
                Apply on Official Portal &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #142B4A; padding: 20px 32px; border-top: 1px solid #244C74; text-align: center; color: #A0AEC0; font-size: 11px; line-height: 1.5;">
        <p style="margin: 0 0 8px 0;">ScholarFind · National Scholarship Discovery Platform</p>
        <p style="margin: 0;">This is an automated alert generated because your profile matches verified public scholarship guidelines. You can modify your email preferences in the Student Portal.</p>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_email_alert(
    recipient_email: str,
    recipient_name: str,
    scholarship: Scholarship,
    matched_reasons: List[str]
) -> Tuple[bool, str]:
    """
    Dispatch email notification.
    If SMTP configured, sends via smtplib.
    If not, executes simulated dev delivery and logs payload.
    Returns (success: bool, status: str)
    """
    subject = f"New Matching Scholarship: {scholarship.name} ({scholarship.amount_display})"
    html_content = generate_scholarship_alert_html(
        student_name=recipient_name,
        scholarship_name=scholarship.name,
        provider=scholarship.provider,
        amount_display=scholarship.amount_display,
        deadline=scholarship.deadline,
        official_link=scholarship.official_link,
        portal_name=scholarship.portal_name,
        matched_reasons=matched_reasons
    )

    # 1. Live SMTP Delivery if host and user configured
    if SMTP_HOST and (SMTP_USER or SMTP_PASSWORD):
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
            msg["To"] = recipient_email

            text_fallback = (
                f"Hello {recipient_name},\n\n"
                f"A new scholarship matching your profile has been verified: {scholarship.name}\n"
                f"Benefit: {scholarship.amount_display}\n"
                f"Deadline: {scholarship.deadline}\n"
                f"Official Portal: {scholarship.portal_name} ({scholarship.official_link})\n\n"
                f"Matched Reasons:\n" + "\n".join([f"- {r}" for r in matched_reasons])
            )
            msg.attach(MIMEText(text_fallback, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if SMTP_PORT == 465:
                with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.sendmail(SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
            else:
                with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.sendmail(SMTP_FROM_EMAIL, [recipient_email], msg.as_string())

            logger.info(f"Live email alert successfully sent to {recipient_email} for {scholarship.name}")
            return True, "DELIVERED"
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {recipient_email}: {e}")
            return False, f"FAILED_SMTP: {str(e)[:100]}"

    # 2. Simulated Dev Delivery Mode
    logger.info(
        f"[SIMULATED EMAIL DISPATCH] To: {recipient_email} | Subject: {subject} | Amount: {scholarship.amount_display}"
    )
    return True, "SENT_DEV_SIMULATED"


def match_and_notify_students_for_scholarship(
    db: Session,
    scholarship: Scholarship
) -> List[Notification]:
    """
    Run the matching engine for this scholarship against all students in the database.
    Sends email alerts to students whose criteria match and who have email alerts enabled.
    """
    created_notifications: List[Notification] = []

    # Get all students
    students = db.query(Student).all()
    if not students:
        return created_notifications

    for student in students:
        # Check if student is associated with a registered User account
        user = db.query(User).filter(User.id == student.id).first()
        if not user:
            # Check by email lookup if student id differs
            continue

        # Check user notification preference
        pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
        if pref and not pref.email_alerts_enabled:
            continue

        if pref and pref.min_amount_threshold > 0:
            if scholarship.amount_value < pref.min_amount_threshold:
                continue

        # Check if notification for this student & scholarship already exists
        existing = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.scholarship_id == scholarship.id
        ).first()
        if existing:
            continue

        # Evaluate eligibility using rule engine
        eval_result = evaluate_scholarship(student, scholarship)
        # Check if student requested only 100% eligible
        if pref and pref.notify_eligible_only and eval_result.status != "ELIGIBLE":
            continue

        if eval_result.status in ["ELIGIBLE", "POSSIBLY_ELIGIBLE"]:
            matched_reasons = (getattr(eval_result, "matched_reasons", None) or getattr(eval_result, "reasons", None) or ["Criteria meets official gazette guidelines."])
            target_email = (pref.alert_email if pref and pref.alert_email else user.email)

            # Send Email Alert
            success, status_str = send_email_alert(
                recipient_email=target_email,
                recipient_name=user.full_name or student.full_name,
                scholarship=scholarship,
                matched_reasons=matched_reasons
            )

            # Record Notification in DB
            notif = Notification(
                user_id=user.id,
                user_email=target_email,
                scholarship_id=scholarship.id,
                title=f"New Matched Scholarship: {scholarship.name}",
                message=f"You qualify for {scholarship.name} offering {scholarship.amount_display}. Deadline: {scholarship.deadline}.",
                amount_display=scholarship.amount_display,
                deadline=scholarship.deadline,
                official_link=scholarship.official_link,
                matched_reasons_json=json.dumps(matched_reasons),
                email_sent=success,
                email_status=status_str,
                is_read=False
            )
            db.add(notif)
            created_notifications.append(notif)

    if created_notifications:
        db.commit()
        for n in created_notifications:
            db.refresh(n)

    return created_notifications


def scan_all_matches_for_user(
    db: Session,
    user: User,
    student: Student
) -> List[Notification]:
    """
    Evaluate all scholarships in database against this user's profile and create notifications for matches.
    """
    created: List[Notification] = []
    scholarships = db.query(Scholarship).all()

    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if pref and not pref.email_alerts_enabled:
        return created

    for sch in scholarships:
        # Check if notification already exists
        existing = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.scholarship_id == sch.id
        ).first()
        if existing:
            continue

        eval_result = evaluate_scholarship(student, sch)
        if pref and pref.notify_eligible_only and eval_result.status != "ELIGIBLE":
            continue

        if eval_result.status in ["ELIGIBLE", "POSSIBLY_ELIGIBLE"]:
            reasons = (getattr(eval_result, "matched_reasons", None) or getattr(eval_result, "reasons", None) or ["Criteria matches official portal specifications."])
            target_email = (pref.alert_email if pref and pref.alert_email else user.email)
            success, status_str = send_email_alert(
                recipient_email=target_email,
                recipient_name=user.full_name or student.full_name,
                scholarship=sch,
                matched_reasons=reasons
            )
            notif = Notification(
                user_id=user.id,
                user_email=target_email,
                scholarship_id=sch.id,
                title=f"Matched Scheme: {sch.name}",
                message=f"Your profile qualifies for {sch.name} ({sch.amount_display}). Target deadline: {sch.deadline}.",
                amount_display=sch.amount_display,
                deadline=sch.deadline,
                official_link=sch.official_link,
                matched_reasons_json=json.dumps(reasons),
                email_sent=success,
                email_status=status_str,
                is_read=False
            )
            db.add(notif)
            created.append(notif)

    if created:
        db.commit()
        for n in created:
            db.refresh(n)

    return created
