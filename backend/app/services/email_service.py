import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple, Optional
import urllib.request
import json

logger = logging.getLogger("scholarfind.email")

# SMTP Configuration via environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER or "support@scholarfind.gov.in.assist")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ScholarFind Security")

# Resend API Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")


def generate_password_reset_html(
    recipient_name: str,
    reset_url: str,
    expires_in_minutes: int = 20
) -> str:
    """
    Generate professional, responsive HTML password reset email matching ScholarFind brand identity.
    Palette: Midnight Navy (#142B4A), Emerald (#159A80), Warm Ivory (#F7F8F5).
    """
    safe_name = recipient_name.strip() if recipient_name else "Student"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ScholarFind Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F7F8F5; margin: 0; padding: 28px 12px; color: #202B38; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5EAE8; overflow: hidden; box-shadow: 0 4px 12px rgba(20, 43, 74, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #142B4A; padding: 32px 36px; text-align: left; border-bottom: 3px solid #159A80;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #159A80; width: 40px; height: 40px; border-radius: 10px; text-align: center; vertical-align: middle;">
              <span style="font-size: 22px; line-height: 40px; color: #FFFFFF;">🎓</span>
            </td>
            <td style="padding-left: 14px;">
              <span style="font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; display: block; line-height: 1.1;">Scholar<span style="color: #159A80;">Find</span></span>
              <span style="font-size: 10px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.2px;">National Scholarship Engine</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 36px 28px 36px;">
        <h1 style="color: #142B4A; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.3px;">
          Password Reset Request
        </h1>
        <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
          Hello <strong>{safe_name}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6;">
          We received a request to reset the password for your ScholarFind account. Click the button below to choose a new password:
        </p>

        <!-- CTA Button -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
          <tr>
            <td style="border-radius: 12px; background-color: #159A80;">
              <a href="{reset_url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 12px; background-color: #159A80; border: 1px solid #12826C; letter-spacing: 0.2px;">
                Reset Password
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry Warning -->
        <div style="background-color: #F8FAFC; border-left: 4px solid #159A80; padding: 14px 16px; border-radius: 6px; margin: 24px 0 20px 0;">
          <p style="font-size: 12px; color: #334155; margin: 0; font-weight: 600;">
            ⏱️ This password reset link is strictly valid for <span style="color: #142B4A;">{expires_in_minutes} minutes</span>.
          </p>
          <p style="font-size: 11px; color: #64748B; margin: 4px 0 0 0;">
            For your security, this single-use link will automatically expire after {expires_in_minutes} minutes.
          </p>
        </div>

        <!-- URL Fallback -->
        <p style="font-size: 12px; color: #64748B; margin-top: 24px; margin-bottom: 8px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 11px; color: #159A80; word-break: break-all; margin: 0 0 24px 0; background-color: #F1F5F9; padding: 10px 12px; border-radius: 8px; font-family: monospace;">
          <a href="{reset_url}" style="color: #159A80; text-decoration: none;">{reset_url}</a>
        </p>

        <!-- Ignore Notice -->
        <div style="border-top: 1px solid #E5EAE8; padding-top: 20px; margin-top: 24px;">
          <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">
            <strong>Did not request this change?</strong> You can safely ignore this email. Your current password remains active and no changes will be made to your account.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E5EAE8; text-align: center;">
        <p style="font-size: 11px; color: #94A3B8; margin: 0 0 6px 0;">
          ScholarFind · National Scholarship Portal & SSP Matcher
        </p>
        <p style="font-size: 10px; color: #94A3B8; margin: 0;">
          Protected under Digital India Data Guidelines. This is an automated security transmission.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_password_reset_email(
    recipient_email: str,
    recipient_name: str,
    reset_url: str,
    expires_in_minutes: int = 20
) -> Tuple[bool, str, Optional[str]]:
    """
    Dispatch password reset email using Resend or SMTP.
    Does NOT simulate delivery if unconfigured; returns explicit status and configuration instructions.
    
    Returns:
        (success: bool, delivery_status: str, message: Optional[str])
    """
    subject = "Reset Your ScholarFind Password"
    html_content = generate_password_reset_html(
        recipient_name=recipient_name,
        reset_url=reset_url,
        expires_in_minutes=expires_in_minutes
    )

    # 1. Resend API delivery if configured
    if RESEND_API_KEY:
        try:
            req_data = {
                "from": f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>",
                "to": [recipient_email],
                "subject": subject,
                "html": html_content
            }
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps(req_data).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    logger.info(f"Password reset email sent via Resend API to {recipient_email}")
                    return True, "DELIVERED_RESEND", "Password reset email dispatched successfully via Resend API."
                else:
                    body = resp.read().decode("utf-8")
                    logger.error(f"Resend API returned {resp.status}: {body}")
                    return False, "FAILED_RESEND", f"Resend API error: {body[:100]}"
        except Exception as e:
            logger.error(f"Resend dispatch error: {e}")
            return False, "FAILED_RESEND", f"Resend dispatch failed: {str(e)[:100]}"

    # 2. SMTP Delivery if configured
    if SMTP_HOST:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
            msg["To"] = recipient_email

            text_fallback = (
                f"Hello {recipient_name},\n\n"
                f"We received a request to reset your ScholarFind password.\n"
                f"Open the link below to set a new password:\n{reset_url}\n\n"
                f"This link expires in {expires_in_minutes} minutes.\n"
                f"If you did not request this, you can safely ignore this email."
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
                    try:
                        server.starttls()
                    except Exception:
                        pass
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.sendmail(SMTP_FROM_EMAIL, [recipient_email], msg.as_string())

            logger.info(f"Password reset email sent via SMTP to {recipient_email}")
            return True, "DELIVERED_SMTP", "Password reset email dispatched successfully via SMTP server."
        except Exception as e:
            logger.error(f"SMTP dispatch error to {recipient_email}: {e}")
            return False, "FAILED_SMTP", f"SMTP delivery failed: {str(e)[:100]}"

    # 3. Not configured: Do not simulate or pretend delivery
    config_note = (
        "Email delivery credentials (SMTP_HOST or RESEND_API_KEY) are not configured in environment. "
        "To enable live email delivery, configure SMTP_HOST/SMTP_USER/SMTP_PASSWORD or RESEND_API_KEY in .env."
    )
    logger.warning(f"Email service not configured. Reset link generated for {recipient_email}: {reset_url}")
    return False, "EMAIL_SERVICE_NOT_CONFIGURED", config_note
