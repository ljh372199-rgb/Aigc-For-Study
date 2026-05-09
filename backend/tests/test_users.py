import pytest
from app.models import User

def test_get_current_user(client, test_user, db):
    login_response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

def test_update_current_user(client, test_user):
    login_response = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "newemail@example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newemail@example.com"
