import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(64), index=True, nullable=False)
    user_email = Column(String(255), index=True, nullable=False)
    scholarship_id = Column(String(64), ForeignKey("scholarships.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    amount_display = Column(String(100), nullable=True)
    deadline = Column(String(100), nullable=True)
    official_link = Column(String(500), nullable=True)
    matched_reasons_json = Column(Text, nullable=True)
    
    email_sent = Column(Boolean, default=False)
    email_status = Column(String(50), default="SENT")  # "DELIVERED", "SENT_DEV_SIMULATED", "FAILED"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    scholarship = relationship("Scholarship")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "scholarship_id": self.scholarship_id,
            "title": self.title,
            "message": self.message,
            "amount_display": self.amount_display,
            "deadline": self.deadline,
            "official_link": self.official_link,
            "matched_reasons": self.matched_reasons_json,
            "email_sent": self.email_sent,
            "email_status": self.email_status,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    alert_email = Column(String(255), nullable=True)
    email_alerts_enabled = Column(Boolean, default=True)
    min_amount_threshold = Column(Float, default=0.0)
    instant_alerts = Column(Boolean, default=True)
    notify_eligible_only = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "alert_email": self.alert_email,
            "email_alerts_enabled": self.email_alerts_enabled,
            "min_amount_threshold": self.min_amount_threshold,
            "instant_alerts": self.instant_alerts,
            "notify_eligible_only": self.notify_eligible_only,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
