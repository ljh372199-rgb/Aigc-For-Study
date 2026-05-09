#!/usr/bin/env python3
"""
Aigc For Study 课程绑定班级API测试
测试课程与班级的绑定、解绑、查询功能

使用方法:
    python tests/test_course_class_binding.py --base-url http://localhost:38000
"""

import argparse
import sys
import json
import httpx
import time


class CourseClassBindingTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.teacher_token = None
        self.student_token = None
        self.course_id = None
        self.class_id = None
        self.binding_id = None
    
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
            elif method == "DELETE":
                resp = httpx.delete(url, headers=headers, timeout=30.0)
            else:
                return None, None
            return resp.status_code, resp.json() if resp.text else {}
        except Exception as e:
            return None, {"error": str(e)}
    
    def timestamp(self):
        return str(int(time.time()))
    
    def test_auth(self):
        print("\n【步骤1】创建测试账号")
        print("=" * 50)
        
        status, resp = self.test_endpoint("POST", "/api/v1/auth/register", {
            "username": f"bindteacher_{self.timestamp()}",
            "email": f"bindteacher_{self.timestamp()}@test.com",
            "password": "Teacher123",
            "role": "teacher"
        })
        passed = status == 201
        self.test_result("教师账号注册", passed, f"状态码: {status}")
        
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
        
        status, resp = self.test_endpoint("POST", "/api/v1/auth/register", {
            "username": f"bindstudent_{self.timestamp()}",
            "email": f"bindstudent_{self.timestamp()}@test.com",
            "password": "Student123",
            "role": "student"
        })
        passed = status == 201
        self.test_result("学生账号注册", passed, f"状态码: {status}")
        
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
    
    def test_create_course_and_class(self):
        print("\n【步骤2】创建课程和班级")
        print("=" * 50)
        
        status, resp = self.test_endpoint("POST", "/api/v1/courses/", {
            "title": "测试绑定课程",
            "description": "用于测试课程绑定班级功能"
        }, self.teacher_token)
        passed = status == 200
        self.test_result("创建课程", passed, f"状态码: {status}")
        if passed:
            self.course_id = resp.get("id")
            self.log("info", f"课程ID: {self.course_id}")
        
        status, resp = self.test_endpoint("POST", "/api/v1/classes", {
            "name": "测试绑定班级",
            "description": "用于测试课程绑定班级功能"
        }, self.teacher_token)
        passed = status == 201
        self.test_result("创建班级", passed, f"状态码: {status}")
        if passed:
            self.class_id = resp.get("id")
            self.log("info", f"班级ID: {self.class_id}")
    
    def test_bind_course_to_class(self):
        print("\n【步骤3】绑定课程到班级")
        print("=" * 50)
        
        if not self.course_id or not self.class_id:
            self.test_result("绑定课程到班级", False, "缺少课程或班级ID")
            return
        
        status, resp = self.test_endpoint("POST", 
            f"/api/v1/courses/{self.course_id}/classes",
            {"class_id": self.class_id},
            self.teacher_token
        )
        passed = status == 200
        self.test_result("绑定课程到班级", passed, f"状态码: {status}")
        if passed:
            self.binding_id = resp.get("id")
            self.log("info", f"绑定ID: {self.binding_id}")
            self.test_result("响应包含班级名称", resp.get("class_name") == "测试绑定班级", f"班级名: {resp.get('class_name')}")
    
    def test_get_course_classes(self):
        print("\n【步骤4】查询课程绑定的班级")
        print("=" * 50)
        
        if not self.course_id:
            self.test_result("查询课程班级", False, "缺少课程ID")
            return
        
        status, resp = self.test_endpoint("GET",
            f"/api/v1/courses/{self.course_id}/classes",
            token=self.teacher_token
        )
        passed = status == 200 and isinstance(resp, list) and len(resp) > 0
        self.test_result("查询课程绑定的班级", passed, f"状态码: {status}, 数量: {len(resp) if isinstance(resp, list) else 0}")
    
    def test_get_class_courses(self):
        print("\n【步骤5】查询班级的课程")
        print("=" * 50)
        
        if not self.class_id:
            self.test_result("查询班级课程", False, "缺少班级ID")
            return
        
        status, resp = self.test_endpoint("GET",
            f"/api/v1/classes/{self.class_id}/courses",
            token=self.teacher_token
        )
        passed = status == 200 and isinstance(resp, list) and len(resp) > 0
        self.test_result("查询班级的课程", passed, f"状态码: {status}, 数量: {len(resp) if isinstance(resp, list) else 0}")
        if passed and len(resp) > 0:
            self.test_result("课程标题正确", resp[0].get("title") == "测试绑定课程", f"课程名: {resp[0].get('title')}")
    
    def test_duplicate_binding(self):
        print("\n【步骤6】重复绑定测试")
        print("=" * 50)
        
        if not self.course_id or not self.class_id:
            return
        
        status, resp = self.test_endpoint("POST",
            f"/api/v1/courses/{self.course_id}/classes",
            {"class_id": self.class_id},
            self.teacher_token
        )
        passed = status == 400
        self.test_result("重复绑定被拒绝", passed, f"状态码: {status}")
    
    def test_unbind_course(self):
        print("\n【步骤7】解绑课程与班级")
        print("=" * 50)
        
        if not self.course_id or not self.class_id:
            self.test_result("解绑课程", False, "缺少课程或班级ID")
            return
        
        status, resp = self.test_endpoint("DELETE",
            f"/api/v1/courses/{self.course_id}/classes/{self.class_id}",
            token=self.teacher_token
        )
        passed = status == 200
        self.test_result("解绑课程与班级", passed, f"状态码: {status}")
        
        status, resp = self.test_endpoint("GET",
            f"/api/v1/courses/{self.course_id}/classes",
            token=self.teacher_token
        )
        passed = status == 200 and len(resp) == 0
        self.test_result("解绑后班级列表为空", passed, f"数量: {len(resp) if isinstance(resp, list) else 'N/A'}")
    
    def test_permission_control(self):
        print("\n【步骤8】权限控制测试")
        print("=" * 50)
        
        if not self.course_id or not self.class_id:
            return
        
        status, resp = self.test_endpoint("POST",
            f"/api/v1/courses/{self.course_id}/classes",
            {"class_id": self.class_id},
            self.student_token
        )
        passed = status == 403
        self.test_result("学生不能绑定课程", passed, f"状态码: {status}")
    
    def run_tests(self):
        print("=" * 60)
        print("Aigc For Study 课程绑定班级API测试")
        print(f"测试地址: {self.base_url}")
        print("=" * 60)
        
        self.test_auth()
        self.test_create_course_and_class()
        self.test_bind_course_to_class()
        self.test_get_course_classes()
        self.test_get_class_courses()
        self.test_duplicate_binding()
        self.test_unbind_course()
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
    parser = argparse.ArgumentParser(description="课程绑定班级API测试")
    parser.add_argument("--base-url", default="http://localhost:38000", help="API基础URL")
    args = parser.parse_args()
    
    tester = CourseClassBindingTester(args.base_url)
    success = tester.run_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
