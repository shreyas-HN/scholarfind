import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    scholarship_id: Optional[str] = None
    title: str
    message: str
    amount_display: Optional[str] = None
    deadline: Optional[str] = None
    official_link: Optional[str] = None
    matched_reasons: Optional[str] = None
    email_sent: bool
    email_status: str
    is_read: bool
    created_at: Optional[datetime.datetime] = None
    # Frontend aliases
    email_sent_to: Optional[str] = None
    delivery_status: Optional[str] = None
    match_status: Optional[str] = "ELIGIBLE"

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    unread_count: int
    total_count: int
    items: List[NotificationResponse]
    notifications: List[NotificationResponse]


class PreferenceUpdate(BaseModel):
    alert_email: Optional[str] = None
    email_alerts_enabled: bool = True
    min_amount_threshold: float = Field(default=0.0, ge=0.0)
    instant_alerts: bool = True
    notify_eligible_only: bool = False


class PreferenceResponse(BaseModel):
    user_id: str
    alert_email: Optional[str] = None
    email_alerts_enabled: bool
    min_amount_threshold: float
    instant_alerts: bool
    notify_eligible_only: bool = False
    updated_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class TestEmailRequest(BaseModel):
    email: Optional[str] = None

