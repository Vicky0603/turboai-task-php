from typing import Optional

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.http import HttpRequest

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using email instead of username.
    """
    def authenticate(self, request: Optional[HttpRequest], username: str | None = None, password: str | None = None, **kwargs):
        """Authenticate a user by email/password and return the user if valid."""
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        if user.check_password(password):
            return user
        return None
    
    def get_user(self, user_id: int):
        """Fetch a user by primary key or return None."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
