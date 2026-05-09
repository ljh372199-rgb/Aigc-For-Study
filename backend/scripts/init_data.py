import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.course import Course
from app.models.course import CourseEnrollment
from app.models.homework import Homework
from app.models.homework import HomeworkSubmission
from app.models.learning_plan import LearningPlan

def init_data():
    db = SessionLocal()
    
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin = User(
                username="admin",
                email="admin@aigcstudy.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                status="active"
            )
            db.add(admin)
            db.commit()
            print("Created admin user")
        
        teacher_user = db.query(User).filter(User.username == "teacher").first()
        if not teacher_user:
            teacher = User(
                username="teacher",
                email="teacher@aigcstudy.com",
                hashed_password=get_password_hash("teacher123"),
                role="teacher",
                status="active"
            )
            db.add(teacher)
            db.commit()
            print("Created teacher user")
        
        student_user = db.query(User).filter(User.username == "student").first()
        if not student_user:
            student = User(
                username="student",
                email="student@aigcstudy.com",
                hashed_password=get_password_hash("student123"),
                role="student",
                status="active"
            )
            db.add(student)
            db.commit()
            print("Created student user")
        
        print("Initial data inserted successfully")
        
    finally:
        db.close()

if __name__ == "__main__":
    init_data()