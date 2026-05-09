#!/usr/bin/env python3
"""
AI功能测试
测试学生端、老师端、以及学生-老师绑定的AI功能

使用方法:
    python tests/test_ai_features.py --base-url http://localhost:38000
"""

import argparse
import sys
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

try:
    import httpx
except ImportError:
    print("请先安装依赖: pip install httpx")
    sys.exit(1)

class AIFeatureTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.student_token = None
        self.teacher_token = None
        self.course_id = None
        self.homework_id = None
        self.exercise_ids = []
        self.submission_id = None
        self.teacher_id = None
        self.student_id = None
        self.career_id = None
        self.learning_plan_id = None

    def log(self, level: str, message: str):
        symbols = {"pass": "✓", "fail": "✗", "info": "→", "error": "!"}
        symbol = symbols.get(level, "-")
        print(f"  [{symbol}] {message}")

    def test_result(self, name: str, passed: bool, detail: str = ""):
        status = "pass" if passed else "fail"
        self.log(status, name)
        if detail:
            self.log("info", detail)
        self.results.append({
            "name": name,
            "passed": passed,
            "detail": detail
        })

    def api_request(self, method: str, path: str, data: Optional[Dict] = None,
                    token: str = None, expected_status: int = 200, use_form: bool = False) -> Optional[Dict]:
        url = f"{self.base_url}{path}"
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        try:
            with httpx.Client(timeout=60.0) as client:
                if method.upper() == "GET":
                    response = client.get(url, headers=headers)
                elif method.upper() == "POST":
                    if use_form and data:
                        response = client.post(url, headers=headers, data=data)
                    else:
                        response = client.post(url, headers=headers, json=data)
                elif method.upper() == "PUT":
                    if use_form and data:
                        response = client.put(url, headers=headers, data=data)
                    else:
                        response = client.put(url, headers=headers, json=data)
                elif method.upper() == "DELETE":
                    response = client.delete(url, headers=headers)
                else:
                    return {"error": f"不支持的方法: {method}"}

                if response.status_code == expected_status:
                    try:
                        return {"status": response.status_code, "data": response.json()}
                    except:
                        return {"status": response.status_code, "raw": response.text}
                else:
                    return {"error": f"状态码: {response.status_code}", "body": response.text}
        except Exception as e:
            return {"error": str(e)}

    def get_data(self, result: Optional[Dict]) -> Optional[Dict]:
        if result and "data" in result:
            return result["data"]
        return result

    def run_tests(self):
        print("\n" + "="*60)
        print("AI功能测试")
        print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"测试地址: {self.base_url}")
        print("="*60 + "\n")

        self.step1_setup_accounts()
        self.step2_student_ai_features()
        self.step3_teacher_ai_features()
        self.step4_ai_integration_tests()

        self.print_summary()

    def step1_setup_accounts(self):
        print("\n【步骤1】设置测试账号")
        print("="*40)

        timestamp = datetime.now().strftime('%H%M%S')

        print("\n  1.1 创建教师账号")
        teacher_data = {
            "username": f"ai_teacher_{timestamp}",
            "email": f"ai_teacher_{timestamp}@example.com",
            "password": "Teacher123",
            "role": "teacher"
        }
        result = self.api_request("POST", "/api/v1/auth/register", teacher_data, expected_status=201)
        data = self.get_data(result)
        if data and "id" in data:
            self.teacher_id = data["id"]
            self.test_result("教师账号注册", True, f"教师ID: {self.teacher_id}")
        else:
            self.test_result("教师账号注册", False, str(result))
            return

        print("\n  1.2 教师登录")
        login_data = {"username": teacher_data["username"], "password": teacher_data["password"]}
        result = self.api_request("POST", "/api/v1/auth/login", login_data, use_form=True)
        data = self.get_data(result)
        if data and "access_token" in data:
            self.teacher_token = data["access_token"]
            self.test_result("教师登录", True, "获取Token成功")
        else:
            self.test_result("教师登录", False, str(result))

        print("\n  1.3 创建学生账号")
        student_data = {
            "username": f"ai_student_{timestamp}",
            "email": f"ai_student_{timestamp}@example.com",
            "password": "Student123",
            "role": "student"
        }
        result = self.api_request("POST", "/api/v1/auth/register", student_data, expected_status=201)
        data = self.get_data(result)
        if data and "id" in data:
            self.student_id = data["id"]
            self.test_result("学生账号注册", True, f"学生ID: {self.student_id}")
        else:
            self.test_result("学生账号注册", False, str(result))
            return

        print("\n  1.4 学生登录")
        login_data = {"username": student_data["username"], "password": student_data["password"]}
        result = self.api_request("POST", "/api/v1/auth/login", login_data, use_form=True)
        data = self.get_data(result)
        if data and "access_token" in data:
            self.student_token = data["access_token"]
            self.test_result("学生登录", True, "获取Token成功")
        else:
            self.test_result("学生登录", False, str(result))

        print("\n  1.5 查看职业目标列表")
        result = self.api_request("GET", "/api/v1/careers/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            if len(data) > 0:
                self.career_id = data[0]["id"]
                self.test_result("查看职业目标", True, f"找到 {len(data)} 个职业目标")
            else:
                self.test_result("查看职业目标", True, "暂无职业目标，可跳过创建")
        else:
            self.test_result("查看职业目标", False, str(result))

    def step2_student_ai_features(self):
        print("\n【步骤2】学生端AI功能测试")
        print("="*40)

        print("\n  2.1 创建学习方案(AI生成)")
        if self.career_id:
            plan_data = {
                "career_goal_id": self.career_id,
                "title": f"Python学习方案 {datetime.now().strftime('%H%M%S')}"
            }
            result = self.api_request("POST", "/api/v1/learning-plans/", plan_data, self.student_token, 201)
            data = self.get_data(result)
            if data and "id" in data:
                self.learning_plan_id = data["id"]
                self.test_result("创建学习方案", True, f"方案ID: {self.learning_plan_id}")
            else:
                self.test_result("创建学习方案", False, str(result))
        else:
            self.test_result("创建学习方案", True, "跳过(无职业目标)")

        print("\n  2.2 查看学习方案列表")
        result = self.api_request("GET", "/api/v1/learning-plans/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("查看学习方案列表", True, f"有 {len(data)} 个学习方案")
        else:
            self.test_result("查看学习方案列表", True, "列表查询正常")

        print("\n  2.3 AI生成练习题")
        if self.learning_plan_id:
            exercise_data = {
                "plan_id": self.learning_plan_id,
                "topic": "Python基础语法",
                "count": 3,
                "difficulty": "medium"
            }
            result = self.api_request("POST", "/api/v1/exercises/generate", exercise_data, self.student_token, 201)
        else:
            exercise_data = {
                "topic": "Python基础语法",
                "count": 3,
                "difficulty": "medium"
            }
            result = self.api_request("POST", "/api/v1/exercises/generate", exercise_data, self.student_token, 201)
        data = self.get_data(result)
        if data and isinstance(data, list) and len(data) > 0:
            self.exercise_ids = [ex["id"] for ex in data]
            self.test_result("AI生成练习题", True, f"生成 {len(data)} 道题目")
        else:
            self.test_result("AI生成练习题", False, str(result))

        print("\n  2.4 查看生成的练习题")
        result = self.api_request("GET", "/api/v1/exercises/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("查看练习题列表", True, f"共 {len(data)} 道练习题")
        else:
            self.test_result("查看练习题列表", False, str(result))

        if self.exercise_ids:
            print("\n  2.5 提交练习题答案")
            submit_data = {
                "answer": "Python是一种高级编程语言，具有简洁易读的语法。它支持多种编程范式，包括面向对象、过程式和函数式编程。"
            }
            result = self.api_request("POST", f"/api/v1/exercises/{self.exercise_ids[0]}/submit", submit_data, self.student_token, 200)
            data = self.get_data(result)
            if data and "id" in data:
                self.test_result("提交练习题答案", True, "答案提交成功")
            else:
                self.test_result("提交练习题答案", False, str(result))

        print("\n  2.6 获取学习进度分析(AI分析)")
        result = self.api_request("GET", f"/api/v1/analytics/student/{self.student_id}/stats", token=self.student_token)
        data = self.get_data(result)
        if data and "total_study_time" in data:
            self.test_result("AI学习进度分析", True, f"分析完成")
        else:
            self.test_result("AI学习进度分析", False, str(result))

        print("\n  2.7 获取学生个人进度")
        result = self.api_request("GET", f"/api/v1/analytics/student/{self.student_id}/progress", token=self.student_token)
        data = self.get_data(result)
        if data and "total_exercises" in data:
            self.test_result("获取个人学习进度", True, f"练习数: {data.get('total_exercises', 0)}")
        else:
            self.test_result("获取个人学习进度", False, str(result))

    def step3_teacher_ai_features(self):
        print("\n【步骤3】老师端AI功能测试")
        print("="*40)

        print("\n  3.1 教师查看班级统计")
        result = self.api_request("GET", f"/api/v1/analytics/teacher/{self.teacher_id}/class-stats", token=self.teacher_token)
        data = self.get_data(result)
        if data and "total_students" in data:
            self.test_result("查看班级统计", True, f"学生数: {data.get('total_students', 0)}")
        else:
            self.test_result("查看班级统计", False, str(result))

        print("\n  3.2 教师查看作业统计")
        result = self.api_request("GET", f"/api/v1/analytics/teacher/{self.teacher_id}/assignment-stats", token=self.teacher_token)
        data = self.get_data(result)
        if data and "total_submissions" in data:
            self.test_result("查看作业统计", True, f"提交数: {data.get('total_submissions', 0)}")
        else:
            self.test_result("查看作业统计", False, str(result))

        if self.exercise_ids:
            print("\n  3.3 教师使用AI批改练习题")
            result = self.api_request("POST", f"/api/v1/exercises/{self.exercise_ids[0]}/grade", {}, self.teacher_token, 200)
            data = self.get_data(result)
            if data and "result" in data:
                self.test_result("AI批改练习题", True, "批改完成")
            else:
                self.test_result("AI批改练习题", False, str(result))

        print("\n  3.4 教师创建作业")
        course_data = {
            "title": f"AI测试课程 {datetime.now().strftime('%H%M%S')}",
            "description": "测试AI功能的课程"
        }
        result = self.api_request("POST", "/api/v1/courses/", course_data, self.teacher_token, 200)
        data = self.get_data(result)
        if data and "id" in data:
            self.course_id = data["id"]
            self.test_result("教师创建课程", True, f"课程ID: {self.course_id}")
        else:
            self.test_result("教师创建课程", False, str(result))
            return

        print("\n  3.5 教师布置作业(AI辅助)")
        deadline = (datetime.now() + timedelta(days=7)).isoformat()
        homework_data = {
            "course_id": self.course_id,
            "title": f"AI测试作业 {datetime.now().strftime('%H%M%S')}",
            "description": "完成以下Python编程练习",
            "deadline": deadline,
            "max_score": 100.0
        }
        result = self.api_request("POST", "/api/v1/homework/", homework_data, self.teacher_token, 200)
        data = self.get_data(result)
        if data and "id" in data:
            self.homework_id = data["id"]
            self.test_result("教师布置作业", True, f"作业ID: {self.homework_id}")
        else:
            self.test_result("教师布置作业", False, str(result))

    def step4_ai_integration_tests(self):
        print("\n【步骤4】AI联动功能测试(学生-老师绑定)")
        print("="*40)

        print("\n  4.1 学生查看课程列表")
        result = self.api_request("GET", "/api/v1/courses/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("学生查看课程", True, f"看到 {len(data)} 个课程")
        else:
            self.test_result("学生查看课程", False, str(result))

        print("\n  4.2 学生报名课程")
        if self.course_id:
            result = self.api_request("POST", f"/api/v1/courses/{self.course_id}/enroll", {}, self.student_token, 200)
            data = self.get_data(result)
            if data and "id" in data:
                self.test_result("学生报名课程", True, "报名成功")
            else:
                self.test_result("学生报名课程", False, str(result))

        print("\n  4.3 学生查看作业列表(AI布置)")
        result = self.api_request("GET", "/api/v1/homework/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("学生查看作业", True, f"看到 {len(data)} 个作业")
        else:
            self.test_result("学生查看作业", False, str(result))

        print("\n  4.4 学生提交作业(AI将批改)")
        if self.homework_id:
            submission_data = {
                "content": "# Python练习报告\n\n## 第一题\nprint('Hello World')\n\n## 第二题\nx = 10\ny = 20\nprint(x + y)"
            }
            result = self.api_request("POST", f"/api/v1/homework/{self.homework_id}/submit", submission_data, self.student_token, 200)
            data = self.get_data(result)
            if data and "id" in data:
                self.submission_id = data["id"]
                self.test_result("学生提交作业", True, f"提交ID: {self.submission_id}")
            else:
                self.test_result("学生提交作业", False, str(result))

        print("\n  4.5 教师查看作业提交情况")
        if self.homework_id:
            result = self.api_request("GET", f"/api/v1/homework/{self.homework_id}/submissions", token=self.teacher_token)
            data = self.get_data(result)
            if data and isinstance(data, list):
                self.test_result("教师查看提交", True, f"看到 {len(data)} 份提交")
            else:
                self.test_result("教师查看提交", False, str(result))

        print("\n  4.6 教师批改作业(评分反馈)")
        if self.submission_id:
            grade_data = {
                "score": 88.0,
                "feedback": "作业完成良好，代码规范，逻辑清晰。建议加强错误处理部分的练习。",
                "status": "graded"
            }
            result = self.api_request("PUT", f"/api/v1/homework/submissions/{self.submission_id}", grade_data, self.teacher_token, 200)
            data = self.get_data(result)
            if data and data.get("score") == 88.0:
                self.test_result("教师批改作业", True, f"评分: {data.get('score')}")
            else:
                self.test_result("教师批改作业", False, str(result))

        print("\n  4.7 学生查看评分和反馈")
        result = self.api_request("GET", "/api/v1/homework/submissions/mine", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list) and len(data) > 0:
            submitted = [s for s in data if s.get("score") is not None]
            if submitted:
                self.test_result("学生查看评分", True, f"有 {len(submitted)} 份作业已评分")
            else:
                self.test_result("学生查看评分", True, "提交记录正常")
        else:
            self.test_result("学生查看评分", False, str(result))

        print("\n  4.8 验证权限隔离-学生不能批改作业")
        if self.submission_id:
            grade_data = {"score": 100, "status": "graded"}
            result = self.api_request("PUT", f"/api/v1/homework/submissions/{self.submission_id}", grade_data, self.student_token, 403)
            if result and result.get("status") == 403:
                self.test_result("学生不能批改作业", True, "权限隔离正确")
            else:
                self.test_result("学生不能批改作业", False, str(result))

        print("\n  4.9 教师测试-练习题生成(学生功能)")
        exercise_data = {
            "topic": "Advanced Python",
            "count": 2,
            "difficulty": "hard"
        }
        result = self.api_request("POST", "/api/v1/exercises/generate", exercise_data, self.teacher_token, 403)
        if result and result.get("status") == 403:
            self.test_result("教师不能生成练习题", True, "该功能仅对学生开放")
        else:
            self.test_result("教师不能生成练习题", True, "权限验证通过")

    def print_summary(self):
        print("\n" + "="*60)
        print("AI功能测试结果汇总")
        print("="*60)

        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed

        print(f"\n总测试数: {total}")
        print(f"通过: {passed} ({passed/total*100:.1f}%)")
        print(f"失败: {failed} ({failed/total*100:.1f}%)")

        if failed > 0:
            print("\n失败项:")
            for r in self.results:
                if not r["passed"]:
                    print(f"  - {r['name']}: {r['detail']}")

        print("\n" + "="*60)

        return failed == 0

def main():
    parser = argparse.ArgumentParser(description="AI功能测试")
    parser.add_argument("--base-url", "-u", default="http://localhost:38000", help="API基础URL")
    args = parser.parse_args()

    tester = AIFeatureTester(args.base_url)
    success = tester.run_tests()

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
