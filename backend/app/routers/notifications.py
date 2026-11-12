import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Student, Scholarship
from backend.app.models.user import User
from backend.app.models.notification import Notification, NotificationPreference
from backend.app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    PreferenceUpdate,
    PreferenceResponse,
    TestEmailRequest
)
from backend.app.dependencies.auth import get_current_user
from backend.app.services.notification_service import (
    send_email_alert,
    scan_all_matches_for_user
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve notifications and email alerts for current student."""
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

    unread_count = sum(1 for n in notifs if not n.is_read)

    resp_items = [
        NotificationResponse(
            id=n.id,
            user_id=n.user_id,
            user_email=n.user_email,
            scholarship_id=n.scholarship_id,
            title=n.title,
            message=n.message,
            amount_display=n.amount_display,
            deadline=n.deadline,
            official_link=n.official_link,
            matched_reasons=n.matched_reasons_json,
            email_sent=n.email_sent,
            email_status=n.email_status,
            is_read=n.is_read,
            created_at=n.created_at,
            email_sent_to=n.user_email,
            delivery_status=n.email_status,
            match_status="ELIGIBLE"
        )
        for n in notifs
    ]

    return NotificationListResponse(
        unread_count=unread_count,
        total_count=len(notifs),
        items=resp_items,
        notifications=resp_items
    )


@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.post("/read-all", response_model=dict)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all unread notifications as read for current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.get("/preferences", response_model=PreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get email notification preferences."""
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        # Default preference: email alerts enabled
        pref = NotificationPreference(
            user_id=current_user.id,
            alert_email="shreyashn899@gmail.com",
            email_alerts_enabled=True,
            min_amount_threshold=0.0,
            notify_eligible_only=False
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return PreferenceResponse.model_validate(pref)


@router.put("/preferences", response_model=PreferenceResponse)
def update_preferences(
    payload: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update email alert preferences."""
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            alert_email=payload.alert_email or "shreyashn899@gmail.com",
            email_alerts_enabled=payload.email_alerts_enabled,
            min_amount_threshold=payload.min_amount_threshold,
            instant_alerts=payload.instant_alerts,
            notify_eligible_only=payload.notify_eligible_only
        )
        db.add(pref)
    else:
        if payload.alert_email is not None:
            pref.alert_email = payload.alert_email
        pref.email_alerts_enabled = payload.email_alerts_enabled
        pref.min_amount_threshold = payload.min_amount_threshold
        pref.instant_alerts = payload.instant_alerts
        pref.notify_eligible_only = payload.notify_eligible_only
        pref.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(pref)
    return PreferenceResponse.model_validate(pref)


@router.post("/scan-matches", response_model=dict)
def trigger_scan_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scan all scholarships in database against student profile criteria.
    Dispatches email alerts for all qualifying schemes.
    """
    student = db.query(Student).filter(Student.id == current_user.id).first()
    if not student:
        return {
            "message": "Please save your student profile credentials first to enable matching alert evaluation.",
            "new_alerts_sent": 0
        }

    new_notifs = scan_all_matches_for_user(db, current_user, student)
    return {
        "message": f"Scan completed. Dispatched email alerts for {len(new_notifs)} matching scholarship opportunities.",
        "new_alerts_sent": len(new_notifs),
        "notifications": [n.to_dict() for n in new_notifs]
    }


@router.post("/test-email", response_model=dict)
def send_test_email_alert(
    payload: Optional[TestEmailRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a sample scholarship matching alert email to the student's email address.
    """
    target_email = payload.email if (payload and payload.email) else current_user.email
    sample_sch = db.query(Scholarship).first()
    if not sample_sch:
        raise HTTPException(status_code=404, detail="No scholarship available in database to preview.")

    reasons = [
        "Annual family income verified within mandatory limit.",
        "Qualifying examination percentage meets scheme minimum.",
        "Educational level and domicile guidelines confirmed."
    ]

    success, status_str = send_email_alert(
        recipient_email=target_email,
        recipient_name=current_user.full_name,
        scholarship=sample_sch,
        matched_reasons=reasons
    )

    # Record notification
    test_notif = Notification(
        user_id=current_user.id,
        user_email=target_email,
        scholarship_id=sample_sch.id,
        title=f"Sample Match Alert: {sample_sch.name}",
        message=f"Verified match alert sent to {target_email} for {sample_sch.name} ({sample_sch.amount_display}).",
        amount_display=sample_sch.amount_display,
        deadline=sample_sch.deadline,
        official_link=sample_sch.official_link,
        matched_reasons_json=json.dumps(reasons),
        email_sent=success,
        email_status=status_str,
        is_read=False
    )
    db.add(test_notif)
    db.commit()

    return {
        "message": f"Test matching scholarship alert sent to {target_email} ({status_str}).",
        "email": target_email,
        "delivery_status": status_str,
        "scholarship": sample_sch.name
    }
