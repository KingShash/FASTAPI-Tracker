"""Tests for the Item Tracker API."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Item Tracker API is running"}


def test_create_item(client):
    payload = {"title": "Buy groceries", "priority": "high"}
    response = client.post("/items", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["priority"] == "high"
    assert data["completed"] is False
    assert "id" in data


def test_list_items(client):
    client.post("/items", json={"title": "Task 1"})
    client.post("/items", json={"title": "Task 2"})
    response = client.get("/items")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_item(client):
    created = client.post("/items", json={"title": "Test item"}).json()
    response = client.get(f"/items/{created['id']}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test item"


def test_get_item_not_found(client):
    response = client.get("/items/99999")
    assert response.status_code == 404


def test_update_item(client):
    created = client.post("/items", json={"title": "Old title"}).json()
    response = client.put(f"/items/{created['id']}", json={"title": "New title", "completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New title"
    assert data["completed"] is True


def test_update_item_not_found(client):
    response = client.put("/items/99999", json={"title": "x"})
    assert response.status_code == 404


def test_delete_item(client):
    created = client.post("/items", json={"title": "Delete me"}).json()
    response = client.delete(f"/items/{created['id']}")
    assert response.status_code == 204
    response = client.get(f"/items/{created['id']}")
    assert response.status_code == 404


def test_delete_item_not_found(client):
    response = client.delete("/items/99999")
    assert response.status_code == 404


def test_filter_by_completed(client):
    client.post("/items", json={"title": "Done", "completed": True})
    client.post("/items", json={"title": "Pending"})
    response = client.get("/items?completed=true")
    assert response.status_code == 200
    items = response.json()
    assert all(i["completed"] for i in items)


def test_filter_by_priority(client):
    client.post("/items", json={"title": "High priority item", "priority": "high"})
    client.post("/items", json={"title": "Low priority item", "priority": "low"})
    response = client.get("/items?priority=high")
    assert response.status_code == 200
    items = response.json()
    assert all(i["priority"] == "high" for i in items)


def test_invalid_priority(client):
    response = client.post("/items", json={"title": "Bad", "priority": "urgent"})
    assert response.status_code == 422


def test_empty_title(client):
    response = client.post("/items", json={"title": "   "})
    assert response.status_code == 422
