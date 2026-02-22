import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.unit
@pytest.mark.django_db
class TestUserModel:
    """Test User model"""

    def test_create_user_with_email(self):
        """Test creating a user with email"""
        email = "test@example.com"
        password = "testpass123"
        user = User.objects.create_user(email=email, password=password)

        assert user.email == email
        assert user.check_password(password)
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_user_generates_username(self):
        """Test that username is auto-generated from email"""
        email = "john.doe@example.com"
        user = User.objects.create_user(email=email, password="pass123")

        assert user.username == "john.doe"

    def test_create_superuser(self):
        """Test creating a superuser"""
        email = "admin@example.com"
        password = "adminpass123"
        user = User.objects.create_superuser(email=email, password=password)

        assert user.email == email
        assert user.is_staff
        assert user.is_superuser
        assert user.is_active

    def test_user_str_representation(self):
        """Test user string representation"""
        email = "test@example.com"
        user = User.objects.create_user(email=email, password="pass123")

        assert str(user) == email

    def test_create_user_without_email_raises_error(self):
        """Test that creating user without email raises error"""
        with pytest.raises(ValueError, match="The Email field must be set"):
            User.objects.create_user(email="", password="pass123")

    def test_email_is_normalized(self):
        """Test that email is normalized"""
        email = "test@EXAMPLE.COM"
        user = User.objects.create_user(email=email, password="pass123")

        assert user.email == "test@example.com"

    def test_duplicate_email_not_allowed(self):
        """Test that duplicate emails are not allowed"""
        email = "test@example.com"
        User.objects.create_user(email=email, password="pass123")

        with pytest.raises(Exception):
            User.objects.create_user(email=email, password="pass456")

