import uuid
import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    token_hash = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "token_hash": self.token_hash,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "used": self.used,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
