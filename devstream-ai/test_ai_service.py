from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_summarize_endpoint():
    payload = {
        "content_markdown": "# Building Scalable Spring Boot APIs\nSpring Boot provides robust features for building REST APIs with Security and JPA.",
        "max_length": 100
    }
    response = client.post("/api/v1/ai/summarize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "bullet_points" in data
    assert data["estimated_read_time_minutes"] >= 1

def test_auto_tag_endpoint():
    payload = {
        "title": "Full-Stack Development with React, Spring Boot, and PostgreSQL",
        "content_markdown": "In this tutorial we deploy Docker containers to AWS using MongoDB Atlas and FastAPI."
    }
    response = client.post("/api/v1/ai/auto-tag", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tags" in data
    assert len(data["tags"]) > 0
    assert "react" in data["tags"] or "spring-boot" in data["tags"] or "docker" in data["tags"]
