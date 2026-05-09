import pytest

def test_list_assignments_requires_auth(client):
    response = client.get("/api/v1/assignments/")
    assert response.status_code == 401

def test_teacher_can_create_assignment(client, test_teacher):
    login_response = client.post("/api/v1/auth/login", data={
        "username": "testteacher",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    response = client.post(
        "/api/v1/assignments/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Test Assignment",
            "description": "Test Description",
            "max_score": 100
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Assignment"
