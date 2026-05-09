from typing import List, Dict, Any
import random

from app.services.ai.base import AIServiceProtocol

class MockAIService(AIServiceProtocol):
    async def generate_learning_plan(
        self,
        career_goal: str,
        skills_required: List[str]
    ) -> Dict[str, Any]:
        return {
            "career_goal": career_goal,
            "duration": "6个月",
            "phases": [
                {
                    "phase": "基础阶段",
                    "duration": "1个月",
                    "courses": ["Python基础", "数据结构", "算法入门"],
                    "milestones": ["完成Python基础学习", "掌握常用数据结构"]
                },
                {
                    "phase": "进阶阶段",
                    "duration": "2个月",
                    "courses": ["机器学习基础", "深度学习入门"],
                    "milestones": ["理解ML基本算法", "完成第一个项目"]
                },
                {
                    "phase": "冲刺阶段",
                    "duration": "1个月",
                    "courses": ["综合项目", "面试准备"],
                    "milestones": ["完成毕业项目", "准备面试"]
                }
            ],
            "recommendations": ["每天保证2-3小时学习时间", "定期复习和总结"]
        }
    
    async def generate_exercises(
        self,
        topic: str,
        count: int,
        difficulty: str
    ) -> List[Dict[str, Any]]:
        exercises = []
        for i in range(count):
            exercises.append({
                "content": f"关于{topic}的第{i+1}题：请简述你对{topic}的理解。",
                "type": "short_answer",
                "answer": f"参考答案：{topic}是计算机科学中的重要概念...",
                "options": None
            })
        return exercises
    
    async def grade_exercise(
        self,
        content: str,
        answer: str
    ) -> Dict[str, Any]:
        score = random.randint(70, 100)
        return {
            "score": score,
            "feedback": f"答案完成度良好，得分{score}分。建议：1. 进一步深化理解；2. 增加实例说明。",
            "grade_level": "B+" if score < 90 else "A"
        }
    
    async def grade_assignment(
        self,
        title: str,
        description: str,
        content: str
    ) -> Dict[str, Any]:
        score = random.randint(70, 100)
        return {
            "score": score,
            "feedback": f"作业完成良好，逻辑清晰，得分{score}分。",
            "grade_level": "B+" if score < 90 else "A",
            "suggestions": ["代码质量良好", "逻辑正确性优秀"]
        }
    
    async def analyze_learning_progress(
        self,
        student_id: str
    ) -> Dict[str, Any]:
        return {
            "total_study_time": 120,
            "completed_courses": 5,
            "exercise_accuracy": 85.0,
            "strengths": ["数据结构", "算法设计"],
            "weaknesses": ["系统设计"],
            "recent_performance": [
                {"date": "2026-05-01", "score": 85},
                {"date": "2026-05-02", "score": 88},
                {"date": "2026-05-03", "score": 82}
            ]
        }
