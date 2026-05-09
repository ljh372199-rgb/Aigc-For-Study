import pytest

def test_list_exercises_requires_auth(client):
    response = client.get("/api/v1/exercises/")
    assert response.status_code == 401
