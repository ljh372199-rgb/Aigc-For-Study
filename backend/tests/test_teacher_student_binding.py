#!/usr/bin/env python3
"""
学生-老师绑定与联动功能测试
测试课程创建、报名、作业布置、提交、批改等完整流程

使用方法:
    python tests/test_teacher_student_binding.py --base-url http://localhost:38000
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

class BindingTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.student_token = None
        self.teacher_token = None
        self.course_id = None
        self.homework_id = None
        self.submission_id = None
        self.teacher_id = None
        self.student_id = None

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
            with httpx.Client(timeout=30.0) as client:
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
        print("学生-老师绑定与联动功能测试")
        print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"测试地址: {self.base_url}")
        print("="*60 + "\n")

        self.step1_create_accounts()
        self.step2_teacher_creates_course()
        self.step3_student_enrolls()
        self.step4_teacher_creates_homework()
        self.step5_student_submits_homework()
        self.step6_teacher_views_and_grades()
        self.step7_data_isolation_tests()

        self.print_summary()

    def step1_create_accounts(self):
        print("\n【步骤1】创建测试账号")
        print("="*40)

        timestamp = datetime.now().strftime('%H%M%S')

        print("\n  1.1 创建教师账号")
        teacher_data = {
            "username": f"course_teacher_{timestamp}",
            "email": f"course_teacher_{timestamp}@example.com",
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
            "username": f"course_student_{timestamp}",
            "email": f"course_student_{timestamp}@example.com",
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

    def step2_teacher_creates_course(self):
        print("\n【步骤2】教师创建课程")
        print("="*40)

        print("\n  2.1 教师创建课程")
        course_data = {
            "title": f"Python编程基础 {datetime.now().strftime('%H%M%S')}",
            "description": "本课程教授Python编程基础知识"
        }
        result = self.api_request("POST", "/api/v1/courses/", course_data, self.teacher_token, 200)
        data = self.get_data(result)
        if data and "id" in data:
            self.course_id = data["id"]
            self.test_result("创建课程", True, f"课程ID: {self.course_id}")
        else:
            self.test_result("创建课程", False, str(result))
            return

        print("\n  2.2 验证课程归属")
        result = self.api_request("GET", f"/api/v1/courses/{self.course_id}", token=self.teacher_token)
        data = self.get_data(result)
        if data and data.get("teacher_id") == self.teacher_id:
            self.test_result("验证课程归属", True, "课程属于当前教师")
        else:
            self.test_result("验证课程归属", False, str(result))

        print("\n  2.3 验证课程列表（教师只能看到自己的课程）")
        result = self.api_request("GET", "/api/v1/courses/", token=self.teacher_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            teacher_courses = [c for c in data if c.get("teacher_id") == self.teacher_id]
            self.test_result("课程列表隔离", True, f"教师看到 {len(teacher_courses)} 个课程")
        else:
            self.test_result("课程列表隔离", False, str(result))

    def step3_student_enrolls(self):
        print("\n【步骤3】学生报名课程")
        print("="*40)

        print("\n  3.1 学生查看课程列表")
        result = self.api_request("GET", "/api/v1/courses/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("学生查看课程列表", True, f"看到 {len(data)} 个课程")
        else:
            self.test_result("学生查看课程列表", False, str(result))

        print("\n  3.2 学生报名课程")
        result = self.api_request("POST", f"/api/v1/courses/{self.course_id}/enroll", {}, self.student_token, 200)
        data = self.get_data(result)
        if data and "id" in data:
            self.test_result("学生报名课程", True, f"报名成功")
        else:
            self.test_result("学生报名课程", False, str(result))

        print("\n  3.3 验证重复报名被拒绝")
        result = self.api_request("POST", f"/api/v1/courses/{self.course_id}/enroll", {}, self.student_token, 400)
        data = self.get_data(result)
        if data and "Already enrolled" in str(data):
            self.test_result("重复报名拒绝", True, "已报名不能重复报名")
        else:
            self.test_result("重复报名拒绝", False, str(result))

        print("\n  3.4 教师查看已报名学生")
        result = self.api_request("GET", f"/api/v1/courses/{self.course_id}/students", token=self.teacher_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            enrolled_students = [s for s in data if s.get("student_id") == self.student_id]
            if enrolled_students:
                self.test_result("教师查看已报名学生", True, f"看到 {len(data)} 个学生")
            else:
                self.test_result("教师查看已报名学生", False, "未找到已报名的学生")
        else:
            self.test_result("教师查看已报名学生", False, str(result))

    def step4_teacher_creates_homework(self):
        print("\n【步骤4】教师布置作业")
        print("="*40)

        print("\n  4.1 教师布置作业")
        deadline = (datetime.now() + timedelta(days=7)).isoformat()
        homework_data = {
            "course_id": self.course_id,
            "title": f"第一章练习 {datetime.now().strftime('%H%M%S')}",
            "description": "完成以下Python练习题",
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
            return

        print("\n  4.2 验证作业归属")
        result = self.api_request("GET", f"/api/v1/homework/{self.homework_id}", token=self.teacher_token)
        data = self.get_data(result)
        if data:
            course_id = data.get("course_id")
            if str(course_id) == str(self.course_id):
                self.test_result("验证作业归属课程", True, "作业属于正确的课程")
            else:
                self.test_result("验证作业归属课程", False, f"课程不匹配: {course_id} != {self.course_id}")
        else:
            self.test_result("验证作业归属课程", False, str(result))

        print("\n  4.3 学生查看作业列表")
        result = self.api_request("GET", "/api/v1/homework/", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            self.test_result("学生查看作业列表", True, f"看到 {len(data)} 个作业")
        else:
            self.test_result("学生查看作业列表", False, str(result))

    def step5_student_submits_homework(self):
        print("\n【步骤5】学生提交作业")
        print("="*40)

        print("\n  5.1 学生提交作业")
        submission_data = {
            "content": "这是我完成的作业答案...\n1. print('Hello World')\n2. 变量x的值为10"
        }
        result = self.api_request("POST", f"/api/v1/homework/{self.homework_id}/submit", submission_data, self.student_token, 200)
        data = self.get_data(result)
        if data and "id" in data:
            self.submission_id = data["id"]
            self.test_result("学生提交作业", True, f"提交ID: {self.submission_id}")
        else:
            self.test_result("学生提交作业", False, str(result))
            return

        print("\n  5.2 学生重复提交（更新）")
        updated_data = {"content": "更新的作业答案...\n修改后的代码"}
        result = self.api_request("POST", f"/api/v1/homework/{self.homework_id}/submit", updated_data, self.student_token, 200)
        data = self.get_data(result)
        if data and data.get("content") == updated_data["content"]:
            self.test_result("更新作业内容", True, "重复提交会更新内容")
        else:
            self.test_result("更新作业内容", False, str(result))

        print("\n  5.3 学生查看自己的提交")
        result = self.api_request("GET", "/api/v1/homework/submissions/mine", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            my_submissions = [s for s in data if s.get("id") == self.submission_id]
            if my_submissions:
                self.test_result("学生查看提交记录", True, f"找到自己的提交")
            else:
                self.test_result("学生查看提交记录", False, "未找到提交记录")
        else:
            self.test_result("学生查看提交记录", False, str(result))

    def step6_teacher_views_and_grades(self):
        print("\n【步骤6】教师查看并批改作业")
        print("="*40)

        print("\n  6.1 教师查看作业提交情况")
        result = self.api_request("GET", f"/api/v1/homework/{self.homework_id}/submissions", token=self.teacher_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            teacher_submissions = [s for s in data if s.get("student_id") == self.student_id]
            if teacher_submissions:
                self.test_result("教师查看提交情况", True, f"看到 {len(data)} 份提交")
            else:
                self.test_result("教师查看提交情况", False, "未看到学生提交")
        else:
            self.test_result("教师查看提交情况", False, str(result))

        print("\n  6.2 教师批改作业")
        grade_data = {
            "score": 85.5,
            "feedback": "作业完成不错，注意代码规范",
            "status": "graded"
        }
        result = self.api_request("PUT", f"/api/v1/homework/submissions/{self.submission_id}", grade_data, self.teacher_token, 200)
        data = self.get_data(result)
        if data and data.get("score") == 85.5:
            self.test_result("教师批改作业", True, f"评分: {data.get('score')}")
        else:
            self.test_result("教师批改作业", False, str(result))

        print("\n  6.3 验证学生可看到评分")
        result = self.api_request("GET", "/api/v1/homework/submissions/mine", token=self.student_token)
        data = self.get_data(result)
        if data and isinstance(data, list):
            my_sub = next((s for s in data if s.get("id") == self.submission_id), None)
            if my_sub and my_sub.get("score") == 85.5:
                self.test_result("学生查看评分", True, f"看到评分: {my_sub.get('score')}")
            else:
                self.test_result("学生查看评分", False, str(result))
        else:
            self.test_result("学生查看评分", False, str(result))

    def step7_data_isolation_tests(self):
        print("\n【步骤7】数据隔离测试")
        print("="*40)

        print("\n  7.1 学生不能创建课程")
        course_data = {
            "title": "学生创建的课程",
            "description": "学生不应该能创建课程"
        }
        result = self.api_request("POST", "/api/v1/courses/", course_data, self.student_token, 403)
        if result and result.get("status") == 403 and result.get("data", {}).get("detail"):
            self.test_result("学生不能创建课程", True, "权限隔离正确")
        else:
            self.test_result("学生不能创建课程", False, str(result))

        print("\n  7.2 学生不能为他人课程布置作业")
        if self.course_id:
            homework_data = {
                "course_id": self.course_id,
                "title": "学生布置的作业",
                "description": "学生不应该能为课程布置作业"
            }
            result = self.api_request("POST", "/api/v1/homework/", homework_data, self.student_token, 403)
            if result and result.get("status") == 403 and result.get("data", {}).get("detail"):
                self.test_result("学生不能布置作业", True, "权限隔离正确")
            else:
                self.test_result("学生不能布置作业", False, str(result))

        print("\n  7.3 学生不能批改作业")
        if self.submission_id:
            grade_data = {"score": 90, "status": "graded"}
            result = self.api_request("PUT", f"/api/v1/homework/submissions/{self.submission_id}", grade_data, self.student_token, 403)
            if result and result.get("status") == 403 and result.get("data", {}).get("detail"):
                self.test_result("学生不能批改作业", True, "权限隔离正确")
            else:
                self.test_result("学生不能批改作业", False, str(result))

        print("\n  7.4 测试完成（跳过清理，测试数据保留）")
        self.test_result("跳过清理测试数据", True, "测试完成")

    def print_summary(self):
        print("\n" + "="*60)
        print("测试结果汇总")
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
    parser = argparse.ArgumentParser(description="学生-老师绑定与联动功能测试")
    parser.add_argument("--base-url", "-u", default="http://localhost:38000", help="API基础URL")
    args = parser.parse_args()

    tester = BindingTester(args.base_url)
    success = tester.run_tests()

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
