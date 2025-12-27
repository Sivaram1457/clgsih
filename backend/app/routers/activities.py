from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from ..mongo import activities_collection

from ..schemas.activity import ActivityCreate, Activity

from ..routers.auth import get_current_active_user, role_required

from ..models.user import User

from bson import ObjectId

from datetime import datetime

from typing import List

import os

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=Activity)

def create_activity(activity: ActivityCreate, current_user: User = Depends(get_current_active_user)):

    activity_dict = activity.dict()

    activity_dict["user_id"] = current_user.id

    activity_dict["status"] = "pending"

    activity_dict["created_at"] = datetime.utcnow()

    result = activities_collection.insert_one(activity_dict)

    activity_dict["id"] = str(result.inserted_id)

    return Activity(**activity_dict)

@router.get("/", response_model=List[Activity])

def get_activities(current_user: User = Depends(get_current_active_user)):

    activities = list(activities_collection.find({"user_id": current_user.id}))

    for activity in activities:

        activity["id"] = str(activity["_id"])

        del activity["_id"]

    return [Activity(**activity) for activity in activities]

from ..database import get_db
from sqlalchemy.orm import Session

@router.get("/pending", response_model=List[Activity])
def get_pending_activities(
    db: Session = Depends(get_db), 
    current_user: User = Depends(role_required("faculty"))
):
    if not current_user.department:
        return []

    # 1. Get all student IDs belonging to this faculty's department (Case-Insensitive)
    from sqlalchemy import func
    query = db.query(User.id).filter(
        User.role == "student",
        func.upper(User.department) == func.upper(current_user.department)
    )

    if current_user.year:
        query = query.filter(User.year == current_user.year)

    department_students = query.all()
    
    # department_students is a list of tuples like [(1,), (2,)]
    student_ids = [s[0] for s in department_students]

    if not student_ids:
        return []

    # 2. Query MongoDB for pending activities belonging to these students
    activities = list(activities_collection.find({
        "status": "pending",
        "user_id": {"$in": student_ids}
    }))

    for activity in activities:
        # Robust ID handling: prefer _id, fallback to id
        obj_id = activity.get("_id") or activity.get("id")
        activity["id"] = str(obj_id)
        if "_id" in activity:
            del activity["_id"]

    return [Activity(**activity) for activity in activities]

@router.put("/{activity_id}/approve")

def approve_activity(activity_id: str, current_user: User = Depends(role_required("faculty"))):

    activity = activities_collection.find_one({"_id": ObjectId(activity_id)})

    if not activity:

        raise HTTPException(status_code=404, detail="Activity not found")

    activities_collection.update_one(

        {"_id": ObjectId(activity_id)},

        {"$set": {"status": "approved", "approved_at": datetime.utcnow(), "faculty_id": current_user.id}}

    )

    return {"message": "Activity approved"}

@router.put("/{activity_id}/reject")

def reject_activity(activity_id: str, current_user: User = Depends(role_required("faculty"))):

    activity = activities_collection.find_one({"_id": ObjectId(activity_id)})

    if not activity:

        raise HTTPException(status_code=404, detail="Activity not found")

    activities_collection.update_one(

        {"_id": ObjectId(activity_id)},

        {"$set": {"status": "rejected", "approved_at": datetime.utcnow(), "faculty_id": current_user.id}}

    )

    return {"message": "Activity rejected"}

@router.post("/upload-proof")

def upload_proof(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):

    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")

    with open(file_path, "wb") as f:

        f.write(file.file.read())

    return {"url": file_path}