import requests
import json
import time

BASE_URL = "http://127.0.0.1:8005"

def run_test():
    print("=== Testing ScholarFind Email Notification Service ===")

    # 1. Register test user
    email = f"test_student_{int(time.time())}@scholarfind.gov.in"
    password = "StrongPassword@123"
    
    print(f"1. Registering student user: {email}")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Shreyas Student",
        "email": email,
        "password": password
    })
    assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("✓ Registration successful, token acquired")

    # 2. Save student profile
    print("2. Saving student profile")
    profile_resp = requests.post(f"{BASE_URL}/api/students", headers=headers, json={
        "full_name": "Shreyas Student",
        "age": 20,
        "gender": "male",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "nationality": "Indian",
        "residence": "Urban",
        "has_disability": False,
        "education_level": "Undergraduate",
        "course": "B.Tech Computer Science",
        "institution_name": "RV College of Engineering",
        "current_year": 2,
        "prev_exam_percentage": 88.5,
        "current_cgpa": 8.9,
        "institution_type": "Government",
        "category": "OBC",
        "is_minority": False,
        "annual_family_income": 180000,
        "parent_occupation": "Agriculture",
        "family_members_count": 4,
        "siblings_studying_count": 1,
        "has_income_certificate": True,
        "scholar_type": "Day Scholar",
        "already_receives_scholarship": False
    })
    assert profile_resp.status_code == 200, f"Save profile failed: {profile_resp.text}"
    print("✓ Profile saved. Automatic scan dispatched match alerts.")

    # 3. Preferences API
    print("3. Checking and updating Notification Preferences")
    pref_get = requests.get(f"{BASE_URL}/api/notifications/preferences", headers=headers)
    assert pref_get.status_code == 200, f"Get preferences failed: {pref_get.text}"
    print("Current preferences:", pref_get.json())

    pref_put = requests.put(f"{BASE_URL}/api/notifications/preferences", headers=headers, json={
        "email_alerts_enabled": True,
        "min_amount_threshold": 10000,
        "notify_eligible_only": False,
        "alert_email": "shreyashn899@gmail.com"
    })
    assert pref_put.status_code == 200, f"Update preferences failed: {pref_put.text}"
    updated_pref = pref_put.json()
    assert updated_pref["alert_email"] == "shreyashn899@gmail.com"
    print("✓ Updated preferences to alert email: shreyashn899@gmail.com")

    # 4. Test Email API
    print("4. Triggering test email alert dispatch")
    test_email_resp = requests.post(f"{BASE_URL}/api/notifications/test-email", headers=headers, json={
        "email": "shreyashn899@gmail.com"
    })
    assert test_email_resp.status_code == 200, f"Test email failed: {test_email_resp.text}"
    print("✓ Test email result:", test_email_resp.json())

    # 5. Check notification list
    print("5. Checking notification alerts in user's inbox")
    notifs_resp = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    assert notifs_resp.status_code == 200, f"Get notifications failed: {notifs_resp.text}"
    notifs_data = notifs_resp.json()
    print(f"Total alerts: {len(notifs_data['items'])}, Unread count: {notifs_data['unread_count']}")
    assert len(notifs_data["items"]) > 0, "Expected at least 1 notification alert"

    # 6. Add a NEW matching scholarship to database to test real-time alert trigger
    print("6. Adding a brand new scholarship to trigger match-and-notify pipeline")
    new_sch_id = f"test-scheme-{int(time.time())}"
    new_sch_resp = requests.post(f"{BASE_URL}/api/scholarships", headers=headers, json={
        "id": new_sch_id,
        "name": "Karnataka Special Merit Excellence Scholarship 2026",
        "provider": "Department of Higher Education, Govt of Karnataka",
        "provider_type": "State Government",
        "scheme_type": "Merit-based",
        "amount_display": "₹60,000 per annum",
        "amount_value": 60000,
        "deadline": "November 30, 2026",
        "deadline_date": "2026-11-30",
        "official_link": "https://ssp.postmatric.karnataka.gov.in",
        "portal_name": "Karnataka State Scholarship Portal (SSP)",
        "verified": True,
        "description": "Excellence fellowship for high-achieving undergraduate students in Karnataka colleges.",
        "eligibility_criteria_summary": [
            "Must be domicile of Karnataka",
            "Enrolled in Undergraduate degree course",
            "Minimum 60% in previous qualifying examination",
            "Annual family income below ₹2,50,000"
        ],
        "required_documents": [
            "Income certificate from Tehsildar",
            "Bonafide student certificate",
            "Previous semester marks card"
        ],
        "application_procedure": ["Apply through SSP Portal with Aadhaar and College registration number."],
        "rules": {
            "max_income": 250000,
            "min_percentage": 60,
            "allowed_education_levels": ["Undergraduate"],
            "allowed_states": ["Karnataka"]
        }
    })
    assert new_sch_resp.status_code == 200, f"Add scholarship failed: {new_sch_resp.text}"
    print(f"✓ New scholarship added: {new_sch_id}")

    # Check that new alert was delivered to student for this new scholarship
    print("7. Verifying automatic notification generation for newly added scholarship")
    notifs_resp_2 = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    assert notifs_resp_2.status_code == 200
    items = notifs_resp_2.json()["items"]
    matching_item = next((i for i in items if i["scholarship_id"] == new_sch_id), None)
    assert matching_item is not None, f"Alert for {new_sch_id} was not found in notifications list!"
    print(f"✓ Found generated alert for new scholarship: {matching_item['title']}")
    print(f"✓ Delivery status: {matching_item['delivery_status']}, recipient: {matching_item['email_sent_to']}")
    print(f"✓ Match status: {matching_item['match_status']}")

    # 8. Mark notification as read
    print("8. Marking notification as read")
    read_resp = requests.put(f"{BASE_URL}/api/notifications/{matching_item['id']}/read", headers=headers)
    assert read_resp.status_code == 200
    print("✓ Notification successfully marked as read")

    print("\nALL NOTIFICATION SERVICE INTEGRATION TESTS PASSED SUCCESSFULLY! ✓✓✓")

if __name__ == "__main__":
    run_test()
