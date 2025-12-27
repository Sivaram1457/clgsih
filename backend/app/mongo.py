from pymongo import MongoClient
from .config import settings
import logging

import json
import os

class MockCollection:
    def __init__(self):
        self.file_path = os.path.join(os.getcwd(), "activities.json")
        self.data = self._load_data()
    
    def _load_data(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r") as f:
                    return json.load(f)
            except:
                return []
        return []

    def _save_data(self):
        with open(self.file_path, "w") as f:
            json.dump(self.data, f)

    def insert_one(self, item):
        from bson import ObjectId
        if "_id" not in item:
            item["_id"] = str(ObjectId())
        elif isinstance(item["_id"], ObjectId):
             item["_id"] = str(item["_id"])
        
        # Handle datetime serialization
        serializable_item = {}
        for k, v in item.items():
            if hasattr(v, "isoformat"):
                serializable_item[k] = v.isoformat()
            else:
                serializable_item[k] = v

        self.data.append(serializable_item)
        self._save_data()
        class Result:
            def __init__(self, id): self.inserted_id = id
        return Result(serializable_item["_id"])
    
    def find(self, query):
        self.data = self._load_data()
        results = []
        for item in self.data:
            match = True
            for k, v in query.items():
                if k == "user_id" and isinstance(v, dict) and "$in" in v:
                    if item.get(k) not in v["$in"]:
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                results.append(item)
        return results

    def find_one(self, query):
        res = self.find(query)
        return res[0] if res else None

    def update_one(self, query, update):
        self.data = self._load_data()
        item = self.find_one(query)
        if item and "$set" in update:
            item.update(update["$set"])
            self._save_data()
        return item

    def count_documents(self, query):
        self.data = self._load_data()
        if not query:
            return len(self.data)
        return len(self.find(query))

try:
    client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=2000)
    client.server_info() # Trigger connection attempt
    db = client["smart_student_hub"]
    activities_collection = db["activities"]
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"MongoDB connection failed: {e}. Falling back to in-memory mock.")
    activities_collection = MockCollection()