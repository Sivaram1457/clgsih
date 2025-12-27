import sqlite3
import os

db_path = "smart_student_hub.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, department, year FROM users;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()
else:
    print(f"{db_path} not found")
