from app.database import SessionLocal

from app.models.user import User

from app.utils.auth import get_password_hash

from app.mongo import activities_collection

from datetime import datetime

db = SessionLocal()

# Create sample users

users_data = [

    {"email": "student@example.com", "password": "pass", "full_name": "John Doe", "role": "student", "department": "CS", "year": "3rd"},

    {"email": "faculty@example.com", "password": "pass", "full_name": "Dr. Smith", "role": "faculty", "department": "CS"},

    {"email": "admin@example.com", "password": "pass", "full_name": "Admin", "role": "admin"},

]

for u in users_data:
    hashed = get_password_hash(u["password"])
    user = User(email=u["email"], hashed_password=hashed, full_name=u["full_name"], role=u["role"], department=u.get("department"), year=u.get("year"))
    try:
        db.add(user)
        db.commit()
    except Exception:
        db.rollback()
        print(f"User {u['email']} already exists.")

# Sample activity

activities_collection.insert_one({

    "user_id": 1,

    "category": "conference",

    "title": "AI Conference",

    "description": "Attended AI conference",

    "duration": "2 days",

    "skills_gained": ["AI", "ML"],

    "status": "pending",

    "created_at": datetime.utcnow()

})

print("Sample data inserted")