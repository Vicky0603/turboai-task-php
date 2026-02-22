import pytest
from rest_framework.test import APIClient
from accounts.models import User
from notes.models import Category, Note


@pytest.fixture
def api_client():
    """API client for testing"""
    return APIClient()


@pytest.fixture
def create_user(db):
    """Factory to create test users"""
    def make_user(email="test@example.com", password="testpass123"):
        return User.objects.create_user(email=email, password=password)
    return make_user


@pytest.fixture
def user(create_user):
    """Create a default test user"""
    return create_user()


@pytest.fixture
def authenticated_client(api_client, user):
    """API client with authenticated user"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def create_category(db, user):
    """Factory to create categories"""
    def make_category(name="Test Category", color="peach"):
        return Category.objects.create(
            name=name,
            color=color,
            user=user
        )
    return make_category


@pytest.fixture
def category(create_category):
    """Create a default test category"""
    return create_category()


@pytest.fixture
def create_note(db, user, category):
    """Factory to create notes"""
    def make_note(title="Test Note", content="Test content"):
        return Note.objects.create(
            title=title,
            content=content,
            category=category,
            user=user
        )
    return make_note


@pytest.fixture
def note(create_note):
    """Create a default test note"""
    return create_note()

