import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import User, CareerGoal

def seed_data():
    db = SessionLocal()

    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin",
                email="admin@aigcstudy.com",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)

        if not db.query(User).filter(User.username == "teacher").first():
            teacher = User(
                username="teacher",
                email="teacher@aigcstudy.com",
                password_hash=get_password_hash("teacher123"),
                role="teacher"
            )
            db.add(teacher)

        if not db.query(User).filter(User.username == "student").first():
            student = User(
                username="student",
                email="student@aigcstudy.com",
                password_hash=get_password_hash("student123"),
                role="student"
            )
            db.add(student)

        careers = [
            {"name": "前端工程师", "description": "负责Web前端开发", "skills_required": ["HTML", "CSS", "JavaScript", "React", "Vue"]},
            {"name": "后端工程师", "description": "负责服务器端开发", "skills_required": ["Python", "Java", "Go", "数据库", "API设计"]},
            {"name": "数据科学家", "description": "负责数据分析与机器学习", "skills_required": ["Python", "机器学习", "深度学习", "数据分析", "统计学"]},
            {"name": "UI设计师", "description": "负责界面设计", "skills_required": ["设计基础", "Figma", "Sketch", "用户研究", "交互设计"]},
            {"name": "产品经理", "description": "负责产品规划与管理", "skills_required": ["需求分析", "产品设计", "项目管理", "数据分析", "沟通协调"]},
        ]

        for career_data in careers:
            existing = db.query(CareerGoal).filter(CareerGoal.name == career_data["name"]).first()
            if not existing:
                career = CareerGoal(**career_data)
                db.add(career)

        db.commit()
        print("Seed data inserted successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
