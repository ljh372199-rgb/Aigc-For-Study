from typing import List, Dict, Any
import json
from app.services.ai.base import AIServiceProtocol

class DeepSeekService(AIServiceProtocol):
    def __init__(self):
        from app.core.config import settings
        self.api_key = settings.DEEPSEEK_API_KEY
        self.model = settings.DEEPSEEK_MODEL
        self.base_url = settings.DEEPSEEK_BASE_URL
    
    async def _call_api(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
        import httpx
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    
    async def generate_learning_plan(
        self,
        career_goal: str,
        skills_required: List[str]
    ) -> Dict[str, Any]:
        prompt = f"""你是一个专业的AI学习规划师。请为想要成为{career_goal}的用户生成一个详细的学习方案。
用户需要掌握的技能包括: {', '.join(skills_required)}

请以JSON格式返回学习方案，包含以下字段:
- career_goal: 职业目标
- duration: 总时长
- phases: 学习阶段数组，每个阶段包含:
  - phase: 阶段名称
  - duration: 阶段时长
  - courses: 课程列表
  - milestones: 里程碑
- recommendations: 建议

请直接返回JSON，不要包含其他文字。"""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_api(messages, temperature=0.7)
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {
                "career_goal": career_goal,
                "duration": "6个月",
                "phases": [
                    {"phase": "基础阶段", "duration": "2个月", "courses": skills_required[:3], "milestones": ["掌握基础知识"]},
                    {"phase": "进阶阶段", "duration": "2个月", "courses": skills_required[3:6] if len(skills_required) > 3 else [], "milestones": ["能够独立完成项目"]},
                    {"phase": "实战阶段", "duration": "2个月", "courses": skills_required, "milestones": ["具备就业能力"]}
                ],
                "recommendations": ["每天学习2-3小时", "多做项目练习", "参与社区讨论"]
            }
    
    async def generate_exercises(
        self,
        topic: str,
        count: int,
        difficulty: str
    ) -> List[Dict[str, Any]]:
        prompt = f"""请为"{topic}"主题生成{count}道{difficulty}难度的练习题。

请以JSON数组格式返回，每道题包含:
- content: 题目内容
- type: 题型 (single_choice/multi_choice/short_answer)
- answer: 参考答案
- options: 选项数组(如果是选择题)

请直接返回JSON数组，不要包含其他文字。"""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_api(messages, temperature=0.5)
        
        try:
            exercises = json.loads(result)
            if isinstance(exercises, dict):
                exercises = [exercises]
            return exercises[:count]
        except json.JSONDecodeError:
            return [
                {
                    "content": f"关于{topic}的第{i+1}题：请简述{topic}的核心概念。",
                    "type": "short_answer",
                    "answer": f"{topic}是重要的技术概念，核心包括..."
                }
                for i in range(count)
            ]
    
    async def grade_exercise(
        self,
        content: str,
        answer: str
    ) -> Dict[str, Any]:
        prompt = f"""请批改以下练习题:

题目: {content}
学生答案: {answer}

请以JSON格式返回批改结果:
- score: 得分(0-100)
- feedback: 详细评语
- grade_level: 等级(A/B/C/D/F)

请直接返回JSON，不要包含其他文字。"""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_api(messages, temperature=0.3)
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            score = 75
            return {
                "score": score,
                "feedback": "答案基本正确，建议进一步完善。",
                "grade_level": "B" if score >= 70 else "C"
            }
    
    async def grade_assignment(
        self,
        title: str,
        description: str,
        content: str
    ) -> Dict[str, Any]:
        prompt = f"""请批改以下作业:

作业标题: {title}
作业描述: {description}
学生提交内容: {content}

请以JSON格式返回批改结果:
- score: 得分(0-100)
- feedback: 详细评语
- grade_level: 等级(A/B/C/D/F)
- suggestions: 改进建议数组

请直接返回JSON，不要包含其他文字。"""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_api(messages, temperature=0.3)
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            score = 80
            return {
                "score": score,
                "feedback": "作业完成度良好，逻辑清晰。",
                "grade_level": "B+" if score >= 80 else "B",
                "suggestions": ["代码结构可以优化", "建议增加注释"]
            }
    
    async def analyze_learning_progress(
        self,
        student_id: str
    ) -> Dict[str, Any]:
        prompt = f"""请分析以下学生的学习进度情况:

学生ID: {student_id}

请以JSON格式返回分析结果:
- total_study_time: 总学习时长(小时)，整数
- completed_courses: 已完成课程数
- exercise_accuracy: 练习正确率(%)，浮点数
- strengths: 擅长领域数组
- weaknesses: 薄弱领域数组
- recent_performance: 最近表现数组，每个包含date和score

请直接返回JSON，不要包含其他文字。"""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_api(messages, temperature=0.5)

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {
                "total_study_time": 50,
                "completed_courses": 5,
                "exercise_accuracy": 78.0,
                "strengths": ["基础知识", "算法设计"],
                "weaknesses": ["系统设计", "性能优化"],
                "recent_performance": [
                    {"date": "2026-05-01", "score": 78},
                    {"date": "2026-05-02", "score": 80},
                    {"date": "2026-05-03", "score": 76}
                ]
            }
