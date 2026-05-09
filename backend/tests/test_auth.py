import pytest
from app.models import User

def test_register_success(client):
    response = client.post("/api/v1/auth/register", json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "role": "student"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"

def test_register_duplicate_username(client, test_user):
    response = client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "email": "another@example.com",
        "password": "password123",
        "role": "student"
    })
    assert response.status_code == 400

def test_login_success(client, test_user):
    response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_login_wrong_password(client, test_user):
    response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
