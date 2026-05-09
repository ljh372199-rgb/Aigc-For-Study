#!/usr/bin/env python3
"""
Aigc For Study API 端点测试脚本
测试所有API端点的功能

使用方法:
    python tests/api_test.py --base-url http://localhost:38000
    python tests/api_test.py --base-url http://localhost:38000 --api-key sk-xxx
"""

import argparse
import sys
import json
from typing import Optional, Dict, Any
from datetime import datetime

try:
    import httpx
except ImportError:
    print("请先安装依赖: pip install httpx")
    sys.exit(1)

class APITester:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers["X-API-Key"] = api_key
        self.results = []
        self.token = None
        self.teacher_token = None
    
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
    
    def test_endpoint(self, method: str, path: str, data: Optional[Dict] = None, 
                     expected_status: int = 200, auth: bool = False,
                     content_type: str = "json", use_teacher_token: bool = False) -> Optional[Dict]:
        url = f"{self.base_url}{path}"
        headers = self.headers.copy()
        
        if use_teacher_token and self.teacher_token:
            headers["Authorization"] = f"Bearer {self.teacher_token}"
        elif auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            with httpx.Client(timeout=30.0) as client:
                if method.upper() == "GET":
                    response = client.get(url, headers=headers)
                elif method.upper() == "POST":
                    if content_type == "form":
                        response = client.post(url, headers=headers, data=data)
                    else:
                        response = client.post(url, headers=headers, json=data)
                elif method.upper() == "PUT":
                    response = client.put(url, headers=headers, json=data)
                elif method.upper() == "DELETE":
                    response = client.delete(url, headers=headers)
                else:
                    raise ValueError(f"不支持的方法: {method}")
                
                if response.status_code == expected_status:
                    try:
                        return response.json()
                    except:
                        return {"raw": response.text}
                else:
                    return {"error": f"状态码: {response.status_code}", "body": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def run_tests(self):
        print("\n" + "="*60)
        print("Aigc For Study API 端点测试")
        print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"测试地址: {self.base_url}")
        print("="*60 + "\n")
        
        self.test_health()
        self.test_auth()
        self.test_users()
        self.test_careers()
        self.test_learning_plans()
        self.test_check_ins()
        self.test_exercises()
        self.test_assignments()
        
        self.print_summary()
    
    def test_health(self):
        print("\n[1] 健康检查端点")
        result = self.test_endpoint("GET", "/health")
        if result and "status" in result:
            self.test_result("GET /health", True, f"响应: {result}")
        else:
            self.test_result("GET /health", False, f"响应异常: {result}")
    
    def test_auth(self):
        print("\n[2] 认证模块")
        
        self.test_user_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_user_password = "Test123456"
        
        print("\n  2.1 用户注册")
        register_data = {
            "username": self.test_user_username,
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": self.test_user_password,
            "role": "student"
        }
        result = self.test_endpoint("POST", "/api/v1/auth/register", register_data, 201)
        if result and "id" in result:
            self.test_result("POST /api/v1/auth/register", True, f"用户ID: {result.get('id')}")
            self.registered_user_id = result.get('id')
        else:
            self.test_result("POST /api/v1/auth/register", False, str(result))
            self.registered_user_id = None
        
        print("\n  2.2 用户登录")
        login_data = {
            "username": self.test_user_username,
            "password": self.test_user_password
        }
        result = self.test_endpoint("POST", "/api/v1/auth/login", login_data, expected_status=200, content_type="form")
        if result and "access_token" in result:
            self.token = result["access_token"]
            self.test_result("POST /api/v1/auth/login", True, "获取Token成功")
        else:
            self.test_result("POST /api/v1/auth/login", False, str(result))
        
        print("\n  2.3 教师账号注册")
        teacher_username = f"teacher_{datetime.now().strftime('%H%M%S')}"
        teacher_password = "Teacher123"
        teacher_register_data = {
            "username": teacher_username,
            "email": f"teacher_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": teacher_password,
            "role": "teacher"
        }
        result = self.test_endpoint("POST", "/api/v1/auth/register", teacher_register_data, 201)
        if result and "id" in result:
            self.test_result("POST /api/v1/auth/register (teacher)", True, f"教师ID: {result.get('id')}")
        else:
            self.test_result("POST /api/v1/auth/register (teacher)", False, str(result))
        
        print("\n  2.4 教师账号登录")
        teacher_login_data = {
            "username": teacher_username,
            "password": teacher_password
        }
        result = self.test_endpoint("POST", "/api/v1/auth/login", teacher_login_data, expected_status=200, content_type="form")
        if result and "access_token" in result:
            self.teacher_token = result["access_token"]
            self.test_result("POST /api/v1/auth/login (teacher)", True, "获取教师Token成功")
        else:
            self.test_result("POST /api/v1/auth/login (teacher)", False, str(result))
    
    def test_users(self):
        print("\n[3] 用户模块")
        
        print("\n  3.1 获取当前用户信息")
        result = self.test_endpoint("GET", "/api/v1/users/me", auth=True)
        if result and "id" in result:
            self.test_result("GET /api/v1/users/me", True, f"用户名: {result.get('username')}")
        else:
            self.test_result("GET /api/v1/users/me", False, str(result))
        
        print("\n  3.2 更新用户信息")
        update_data = {"email": f"updated_{datetime.now().strftime('%H%M%S')}@example.com"}
        result = self.test_endpoint("PUT", "/api/v1/users/me", update_data, auth=True)
        if result and result.get("email"):
            self.test_result("PUT /api/v1/users/me", True, "更新成功")
        else:
            self.test_result("PUT /api/v1/users/me", False, str(result))
    
    def test_careers(self):
        print("\n[4] 职业目标模块")
        
        print("\n  4.1 获取职业列表")
        result = self.test_endpoint("GET", "/api/v1/careers/", auth=True)
        if result and isinstance(result, list):
            self.test_result("GET /api/v1/careers/", True, f"获取到 {len(result)} 个职业")
            if result:
                self.career_id = result[0].get("id")
            else:
                self.career_id = None
        else:
            self.test_result("GET /api/v1/careers/", False, str(result))
            self.career_id = None
        
        if self.career_id:
            print("\n  4.2 获取职业详情")
            result = self.test_endpoint("GET", f"/api/v1/careers/{self.career_id}", auth=True)
            if result and "name" in result:
                self.test_result("GET /api/v1/careers/{id}", True, f"职业: {result.get('name')}")
            else:
                self.test_result("GET /api/v1/careers/{id}", False, str(result))
    
    def test_learning_plans(self):
        print("\n[5] 学习方案模块")
        
        if not self.career_id:
            self.test_result("POST /api/v1/learning-plans/", False, "跳过 - 无职业ID")
            return
        
        print("\n  5.1 创建学习方案")
        plan_data = {
            "career_goal_id": self.career_id,
            "title": f"测试学习方案 {datetime.now().strftime('%H%M%S')}"
        }
        result = self.test_endpoint("POST", "/api/v1/learning-plans/", plan_data, 201, auth=True)
        if result and "id" in result:
            self.test_result("POST /api/v1/learning-plans/", True, f"方案ID: {result.get('id')}")
            self.plan_id = result.get("id")
        else:
            self.test_result("POST /api/v1/learning-plans/", False, str(result))
            self.plan_id = None
        
        print("\n  5.2 获取学习方案列表")
        result = self.test_endpoint("GET", "/api/v1/learning-plans/", auth=True)
        if result and isinstance(result, list):
            self.test_result("GET /api/v1/learning-plans/", True, f"获取到 {len(result)} 个方案")
        else:
            self.test_result("GET /api/v1/learning-plans/", False, str(result))
    
    def test_check_ins(self):
        print("\n[6] 打卡模块")
        
        print("\n  6.1 创建打卡记录")
        from datetime import date
        checkin_data = {
            "check_in_date": date.today().isoformat(),
            "duration_minutes": 120,
            "content": "今天学习了Python基础和算法"
        }
        result = self.test_endpoint("POST", "/api/v1/check-ins/", checkin_data, 201, auth=True)
        if result and "id" in result:
            self.test_result("POST /api/v1/check-ins/", True, f"打卡ID: {result.get('id')}")
            self.checkin_id = result.get("id")
        else:
            self.test_result("POST /api/v1/check-ins/", False, str(result))
            self.checkin_id = None
        
        print("\n  6.2 获取打卡列表")
        result = self.test_endpoint("GET", "/api/v1/check-ins/", auth=True)
        if result and isinstance(result, list):
            self.test_result("GET /api/v1/check-ins/", True, f"获取到 {len(result)} 条记录")
        else:
            self.test_result("GET /api/v1/check-ins/", False, str(result))
    
    def test_exercises(self):
        print("\n[7] 练习题模块")
        
        print("\n  7.1 生成练习题")
        exercise_data = {
            "topic": "Python基础",
            "count": 3,
            "difficulty": "medium"
        }
        result = self.test_endpoint("POST", "/api/v1/exercises/generate", exercise_data, 201, auth=True)
        if result and isinstance(result, list):
            self.test_result("POST /api/v1/exercises/generate", True, f"生成 {len(result)} 道练习")
            if result:
                self.exercise_id = result[0].get("id")
            else:
                self.exercise_id = None
        else:
            self.test_result("POST /api/v1/exercises/generate", False, str(result))
            self.exercise_id = None
        
        print("\n  7.2 获取练习列表")
        result = self.test_endpoint("GET", "/api/v1/exercises/", auth=True)
        if result and isinstance(result, list):
            self.test_result("GET /api/v1/exercises/", True, f"获取到 {len(result)} 道练习")
        else:
            self.test_result("GET /api/v1/exercises/", False, str(result))
        
        if self.exercise_id:
            print("\n  7.3 提交练习答案")
            submit_data = {"answer": "Python是一种高级编程语言"}
            result = self.test_endpoint("POST", f"/api/v1/exercises/{self.exercise_id}/submit", submit_data, auth=True)
            if result:
                self.test_result("POST /api/v1/exercises/{id}/submit", True, "提交成功")
            else:
                self.test_result("POST /api/v1/exercises/{id}/submit", False, str(result))
    
    def test_assignments(self):
        print("\n[8] 作业模块")
        
        print("\n  8.1 创建作业 (教师)")
        assignment_data = {
            "title": f"测试作业 {datetime.now().strftime('%H%M%S')}",
            "description": "请完成以下Python练习",
            "max_score": 100.0
        }
        headers = self.headers.copy()
        if self.teacher_token:
            headers["Authorization"] = f"Bearer {self.teacher_token}"
        url = f"{self.base_url}/api/v1/assignments/"
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=assignment_data)
            if response.status_code == 201:
                result = response.json()
                self.test_result("POST /api/v1/assignments/", True, f"作业ID: {result.get('id')}")
                self.assignment_id = result.get("id")
            else:
                self.test_result("POST /api/v1/assignments/", False, f"状态码: {response.status_code}, {response.text}")
                self.assignment_id = None
        
        print("\n  8.2 获取作业列表 (教师)")
        result = self.test_endpoint("GET", "/api/v1/assignments/", auth=True, use_teacher_token=True)
        if result and isinstance(result, list):
            self.test_result("GET /api/v1/assignments/", True, f"获取到 {len(result)} 个作业")
        else:
            self.test_result("GET /api/v1/assignments/", False, str(result))
    
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
    parser = argparse.ArgumentParser(description="Aigc For Study API 测试工具")
    parser.add_argument("--base-url", "-u", default="http://localhost:38000", help="API基础URL")
    parser.add_argument("--api-key", "-k", default=None, help="API Key")
    args = parser.parse_args()
    
    tester = APITester(args.base_url, args.api_key)
    success = tester.run_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
