#!/usr/bin/env python3
"""
Aigc For Study 班级API测试
测试班级创建、邀请码、学生加入等功能

使用方法:
    python tests/test_classes.py --base-url http://localhost:38000
"""

import argparse
import sys
import json
import httpx


class ClassesAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.teacher_token = None
        self.student_token = None
        self.class_id = None
        self.invite_code = None
    
    def log(self, level: str, message: str):
        symbols = {"pass": "✓", "fail": "✗", "info": "→"}
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
        return passed
    
    def test_endpoint(self, method: str, path: str, data=None, token=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        url = f"{self.base_url}{path}"
        try:
            if method == "GET":
                resp = httpx.get(url, headers=headers, timeout=30.0)
            elif method == "POST":
                resp = httpx.post(url, json=data, headers=headers, timeout=30.0)
            elif method == "PUT":
                resp = httpx.put(url, json=data, headers=headers, timeout=30.0)
            elif method == "DELETE":
                resp = httpx.delete(url, headers=headers, timeout=30.0)
            else:
                return None, None
            return resp.status_code, resp.json() if resp.text else {}
        except Exception as e:
            return None, {"error": str(e)}
    
    def test_auth(self):
        print("\n【步骤1】创建测试账号")
        print("=" * 50)
        
        # 注册教师
        status, resp = self.test_endpoint("POST", "/api/v1/auth/register", {
            "username": f"classteacher_{self.timestamp()}",
            "email": f"classteacher_{self.timestamp()}@test.com",
            "password": "Teacher123",
            "role": "teacher"
        })
        passed = status == 201
        self.test_result("教师账号注册", passed, f"状态码: {status}")
        teacher_id = resp.get("id") if passed else None
        
        # 教师登录
        resp = httpx.post(
            f"{self.base_url}/api/v1/auth/login",
            data={"username": resp.get("username"), "password": "Teacher123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30.0
        )
        if resp.status_code == 200:
            self.teacher_token = resp.json()["access_token"]
            self.test_result("教师登录", True, "获取Token成功")
        else:
            self.test_result("教师登录", False, f"状态码: {resp.status_code}")
        
        # 注册学生
        status, resp = self.test_endpoint("POST", "/api/v1/auth/register", {
            "username": f"classstudent_{self.timestamp()}",
            "email": f"classstudent_{self.timestamp()}@test.com",
            "password": "Student123",
            "role": "student"
        })
        passed = status == 201
        self.test_result("学生账号注册", passed, f"状态码: {status}")
        
        # 学生登录
        resp = httpx.post(
            f"{self.base_url}/api/v1/auth/login",
            data={"username": resp.get("username"), "password": "Student123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30.0
        )
        if resp.status_code == 200:
            self.student_token = resp.json()["access_token"]
            self.test_result("学生登录", True, "获取Token成功")
        else:
            self.test_result("学生登录", False, f"状态码: {resp.status_code}")
    
    def timestamp(self):
        from datetime import datetime
        return datetime.now().strftime("%H%M%S")
    
    def test_create_class(self):
        print("\n【步骤2】创建班级")
        print("=" * 50)
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes", {
            "name": "Python编程基础班",
            "description": "学习Python编程语言的基础课程"
        }, self.teacher_token)
        
        passed = status == 201
        self.test_result("创建班级", passed, f"状态码: {status}")
        
        if passed and "invite_code" in resp:
            self.class_id = resp.get("id")
            self.invite_code = resp.get("invite_code")
            self.test_result("班级邀请码生成", True, f"邀请码: {self.invite_code}")
            self.test_result("邀请码格式正确", len(self.invite_code) == 8, f"长度: {len(self.invite_code)}")
        else:
            self.test_result("班级邀请码生成", False, "响应中无邀请码")
    
    def test_get_classes(self):
        print("\n【步骤3】获取班级列表")
        print("=" * 50)
        
        status, resp = self.test_endpoint("GET", "/api/v1/classes", token=self.teacher_token)
        passed = status == 200 and isinstance(resp, list)
        self.test_result("教师获取班级列表", passed, f"状态码: {status}, 数量: {len(resp) if isinstance(resp, list) else 0}")
    
    def test_get_class_detail(self):
        print("\n【步骤4】获取班级详情")
        print("=" * 50)
        
        if not self.class_id:
            self.test_result("获取班级详情", False, "无班级ID")
            return
        
        status, resp = self.test_endpoint("GET", f"/api/v1/classes/{self.class_id}", token=self.teacher_token)
        passed = status == 200 and resp.get("id") == self.class_id
        self.test_result("获取班级详情", passed, f"状态码: {status}")
    
    def test_get_invite_code(self):
        print("\n【步骤5】获取班级邀请码")
        print("=" * 50)
        
        if not self.class_id:
            self.test_result("获取邀请码", False, "无班级ID")
            return
        
        status, resp = self.test_endpoint("GET", f"/api/v1/classes/{self.class_id}/invite-code", token=self.teacher_token)
        passed = status == 200 and resp.get("invite_code") == self.invite_code
        self.test_result("获取邀请码", passed, f"状态码: {status}")
        self.test_result("邀请码匹配", resp.get("invite_code") == self.invite_code, f"邀请码: {resp.get('invite_code')}")
    
    def test_join_class(self):
        print("\n【步骤6】学生加入班级")
        print("=" * 50)
        
        if not self.invite_code:
            self.test_result("学生加入班级", False, "无邀请码")
            return
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes/join", {
            "invite_code": self.invite_code
        }, self.student_token)
        
        passed = status == 200
        self.test_result("学生加入班级", passed, f"状态码: {status}")
        self.test_result("加入响应包含班级信息", resp.get("class_name") == "Python编程基础班", f"班级名: {resp.get('class_name')}")
    
    def test_join_invalid_code(self):
        print("\n【步骤7】无效邀请码测试")
        print("=" * 50)
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes/join", {
            "invite_code": "INVALID1"
        }, self.student_token)
        
        passed = status in [400, 404]
        self.test_result("无效邀请码拒绝", passed, f"状态码: {status}")
    
    def test_join_duplicate(self):
        print("\n【步骤8】重复加入测试")
        print("=" * 50)
        
        if not self.invite_code:
            return
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes/join", {
            "invite_code": self.invite_code
        }, self.student_token)
        
        passed = status in [400, 409]
        self.test_result("重复加入被拒绝", passed, f"状态码: {status}")
    
    def test_get_my_classes(self):
        print("\n【步骤9】获取已加入的班级")
        print("=" * 50)
        
        status, resp = self.test_endpoint("GET", "/api/v1/classes/my", token=self.student_token)
        passed = status == 200 and isinstance(resp, list) and len(resp) > 0
        self.test_result("学生获取已加入班级", passed, f"状态码: {status}, 数量: {len(resp) if isinstance(resp, list) else 0}")
    
    def test_permission_control(self):
        print("\n【步骤10】权限控制测试")
        print("=" * 50)
        
        if not self.student_token:
            return
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes", {
            "name": "学生创建的班级",
            "description": "这不应该成功"
        }, self.student_token)
        
        passed = status == 403
        self.test_result("学生不能创建班级", passed, f"状态码: {status}")
    
    def run_tests(self):
        print("=" * 60)
        print("Aigc For Study 班级API测试")
        print(f"测试地址: {self.base_url}")
        print("=" * 60)
        
        self.test_auth()
        self.test_create_class()
        self.test_get_classes()
        self.test_get_class_detail()
        self.test_get_invite_code()
        self.test_join_class()
        self.test_join_invalid_code()
        self.test_join_duplicate()
        self.test_get_my_classes()
        self.test_permission_control()
        
        print("\n" + "=" * 60)
        print("测试结果汇总")
        print("=" * 60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        
        print(f"\n总测试数: {total}")
        print(f"通过: {passed} ({passed*100//total if total else 0}%)")
        print(f"失败: {failed} ({failed*100//total if total else 0}%)")
        
        if failed > 0:
            print("\n失败测试:")
            for r in self.results:
                if not r["passed"]:
                    print(f"  - {r['name']}: {r['detail']}")
        
        return failed == 0


def main():
    parser = argparse.ArgumentParser(description="班级API测试")
    parser.add_argument("--base-url", default="http://localhost:38000", help="API基础URL")
    args = parser.parse_args()
    
    tester = ClassesAPITester(args.base_url)
    success = tester.run_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
