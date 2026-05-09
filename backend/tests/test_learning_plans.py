import pytest
from app.models import User

def test_create_learning_plan_requires_auth(client):
    response = client.post("/api/v1/learning-plans/", json={
        "career_goal_id": "123e4567-e89b-12d3-a456-426614174000"
    })
    assert response.status_code == 401

def test_get_learning_plans(client, test_user):
    login_response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/v1/learning-plans/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
