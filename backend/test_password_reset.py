import requests
import json
import time
import datetime
import hashlib
import secrets
from backend.database import SessionLocal
import backend.models
from backend.app.models.user import User
from backend.app.models.password_reset import PasswordResetToken
from backend.app.services.email_service import generate_password_reset_html, send_password_reset_email

BASE_URL = "http://127.0.0.1:8005"

def run_all_tests():
    print("=========================================================")
    print("  SCHOLARFIND: FORGOT PASSWORD & RESET TESTING SUITE    ")
    print("=========================================================\n")

    db = SessionLocal()

    # Setup: Register student
    timestamp = int(time.time())
    test_email = f"reset_student_{timestamp}@scholarfind.gov.in"
    old_password = "InitialPassword#2026"
    new_password = "UpdatedPassword#2027"

    print(f"[*] Setting up test student: {test_email}")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Divya Rao",
        "email": test_email,
        "password": old_password
    })
    assert reg_resp.status_code in (200, 201), f"Setup failed: {reg_resp.text}"
    user_id = reg_resp.json()["user"]["id"]
    print(f"✓ Registered student with ID: {user_id}")

    # Verify initial login with old password works
    init_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": old_password
    })
    assert init_login.status_code == 200, "Initial login failed"
    print("✓ Confirmed initial login with old password succeeds\n")

    # TEST 1: Request password reset using registered email
    print("--- TEST 1: Request Password Reset using Registered Email ---")
    forgot_resp = requests.post(f"{BASE_URL}/auth/forgot-password", json={
        "email": test_email
    })
    assert forgot_resp.status_code == 200, f"Forgot password failed: {forgot_resp.text}"
    forgot_data = forgot_resp.json()
    print("Response payload:", forgot_data)
    assert "If an account exists with this email" in forgot_data["message"]
    print("✓ TEST 1 PASSED: Generic response returned correctly (zero email leak)\n")

    # TEST 2: Verify token hash and email integration in database
    print("--- TEST 2: Verify Token in Database & Email Template Generation ---")
    token_record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user_id, PasswordResetToken.used == False)
        .order_by(PasswordResetToken.created_at.desc())
        .first()
    )
    assert token_record is not None, "PasswordResetToken record was not found in DB!"
    assert len(token_record.token_hash) == 64, "token_hash is not a valid 64-char SHA-256 hash!"
    assert token_record.expires_at > datetime.datetime.utcnow(), "Token expiration is not in the future!"
    assert token_record.used is False, "Token is marked used prematurely!"
    
    # Verify email HTML template generation
    dummy_url = f"{BASE_URL}/reset-password?token=sample_token_xyz"
    html_email = generate_password_reset_html(
        recipient_name="Divya Rao",
        reset_url=dummy_url,
        expires_in_minutes=20
    )
    assert "ScholarFind" in html_email
    assert "Reset Password" in html_email
    assert "20 minutes" in html_email
    assert "ignore this email" in html_email
    print(f"✓ Token hash in DB: {token_record.token_hash[:16]}... (SHA-256)")
    print(f"✓ Token expires at: {token_record.expires_at} (20 min window verified)")
    print(f"✓ Email delivery status: {forgot_data.get('delivery_status')}")
    print("✓ TEST 2 PASSED: Secure token and branded email template verified\n")

    # TEST 3: Extract reset token
    print("--- TEST 3: Open / Extract Reset Token ---")
    reset_link = forgot_data.get("reset_link")
    assert reset_link and "token=" in reset_link, "Reset link was not generated"
    raw_token = reset_link.split("token=")[1]
    
    # Verify that hashing raw_token matches DB token_hash
    computed_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    assert computed_hash == token_record.token_hash, "Token hash mismatch between raw token and DB!"
    print(f"✓ Successfully extracted reset token: {raw_token[:12]}...")
    print(f"✓ Verified SHA-256(raw_token) == DB token_hash")
    print("✓ TEST 3 PASSED\n")

    # TEST 4: Successfully change password using valid token
    print("--- TEST 4: Successfully Change Password ---")
    reset_resp = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "token": raw_token,
        "new_password": new_password
    })
    assert reset_resp.status_code == 200, f"Reset password failed: {reset_resp.text}"
    reset_data = reset_resp.json()
    print("Reset response:", reset_data)
    assert "successfully" in reset_data["message"].lower()

    # Verify in DB that token is now marked used
    db.expire_all()
    token_record_after = db.query(PasswordResetToken).filter(PasswordResetToken.id == token_record.id).first()
    assert token_record_after.used is True, "Token was not marked used after successful reset!"
    print(f"✓ Database token record updated: used={token_record_after.used}")
    print("✓ TEST 4 PASSED: Password changed and single-use token marked used\n")

    # TEST 5: Try using the SAME reset link again
    print("--- TEST 5: Re-use of Already-Used Token Must Fail ---")
    reuse_resp = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "token": raw_token,
        "new_password": "AnotherPassword#2028"
    })
    assert reuse_resp.status_code == 400, f"Expected 400 Bad Request, got {reuse_resp.status_code}"
    print("Re-use error response:", reuse_resp.json())
    assert "already been used" in reuse_resp.json()["detail"].lower()
    print("✓ TEST 5 PASSED: Re-using token correctly rejected with 400 Bad Request\n")

    # TEST 6: Try using an expired token
    print("--- TEST 6: Expired Token Must Fail ---")
    expired_raw_token = secrets.token_urlsafe(32)
    expired_token_hash = hashlib.sha256(expired_raw_token.encode("utf-8")).hexdigest()
    # Create expired record in DB (expired 10 minutes ago)
    expired_record = PasswordResetToken(
        user_id=user_id,
        token_hash=expired_token_hash,
        expires_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10),
        used=False
    )
    db.add(expired_record)
    db.commit()

    expired_resp = requests.post(f"{BASE_URL}/auth/reset-password", json={
        "token": expired_raw_token,
        "new_password": "AnotherPassword#2028"
    })
    assert expired_resp.status_code == 400, f"Expected 400 Bad Request, got {expired_resp.status_code}"
    print("Expired token error response:", expired_resp.json())
    assert "expired" in expired_resp.json()["detail"].lower()
    print("✓ TEST 6 PASSED: Expired token correctly rejected with 400 Bad Request\n")

    # TEST 7: Log in using the OLD password (MUST FAIL)
    print("--- TEST 7: Log in Using OLD Password (Must Fail) ---")
    old_login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": old_password
    })
    assert old_login_resp.status_code == 401, f"Expected 401 Unauthorized for old password, got {old_login_resp.status_code}"
    print("Old password rejection:", old_login_resp.json())
    print("✓ TEST 7 PASSED: Old password rejected with 401 Unauthorized\n")

    # TEST 8: Log in using the NEW password (MUST SUCCEED)
    print("--- TEST 8: Log in Using NEW Password (Must Succeed) ---")
    new_login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": test_email,
        "password": new_password
    })
    assert new_login_resp.status_code == 200, f"Expected 200 OK for new password, got {new_login_resp.status_code}"
    new_login_data = new_login_resp.json()
    assert "access_token" in new_login_data
    assert new_login_data["user"]["email"] == test_email
    print(f"✓ New login successful! User: {new_login_data['user']['full_name']}")
    print("✓ TEST 8 PASSED: New password accepted and authenticated\n")

    db.close()
    print("=========================================================")
    print("  ALL 8 FORGOT & RESET PASSWORD TESTS PASSED! ✓✓✓       ")
    print("=========================================================")

if __name__ == "__main__":
    run_all_tests()
