import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.api
@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test authentication endpoints"""

    def test_register_user_success(self, api_client):
        """Test successful user registration"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == data['email']

        # Verify user was created in database
        user = User.objects.get(email=data['email'])
        assert user.email == data['email']

    def test_register_user_duplicate_email(self, api_client, user):
        """Test registration with duplicate email"""
        url = reverse('register')
        data = {
            'email': user.email,
            'password': 'pass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_invalid_email(self, api_client):
        """Test registration with invalid email"""
        url = reverse('register')
        data = {
            'email': 'invalid-email',
            'password': 'pass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_missing_password(self, api_client):
        """Test registration without password"""
        url = reverse('register')
        data = {
            'email': 'test@example.com'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, api_client, user):
        """Test successful login"""
        url = reverse('login')
        data = {
            'email': user.email,
            'password': 'testpass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == user.email

    def test_login_invalid_credentials(self, api_client, user):
        """Test login with invalid password"""
        url = reverse('login')
        data = {
            'email': user.email,
            'password': 'wrongpassword'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent user"""
        url = reverse('login')
        data = {
            'email': 'nonexistent@example.com',
            'password': 'pass123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh(self, api_client, user):
        """Refresh token returns a new access token."""
        login_url = reverse('login')
        login_resp = api_client.post(login_url, {'email': user.email, 'password': 'testpass123'}, format='json')
        assert login_resp.status_code == status.HTTP_200_OK
        refresh = login_resp.data['refresh']

        refresh_url = reverse('token_refresh')
        refresh_resp = api_client.post(refresh_url, {'refresh': refresh}, format='json')
        assert refresh_resp.status_code == status.HTTP_200_OK
        assert 'access' in refresh_resp.data

    def test_get_user_details_authenticated(self, authenticated_client, user):
        """Test getting user details when authenticated"""
        url = reverse('user_detail')

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert 'password' not in response.data

    def test_get_user_details_unauthenticated(self, api_client):
        """Test getting user details without authentication"""
        url = reverse('user_detail')

        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
