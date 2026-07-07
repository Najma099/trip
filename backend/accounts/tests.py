import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"
        self.logout_url = "/api/auth/logout/"
        self.reset_url = "/api/auth/password-reset/"

        self.user_data = {
            "username": "testdriver",
            "email": "driver@test.com",
            "password": "securepass123",
        }

    def test_register_creates_user_and_returns_tokens(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "testdriver")
        self.assertTrue(User.objects.filter(username="testdriver").exists())

    def test_register_rejects_duplicate_username(self):
        self.client.post(self.register_url, self.user_data, format="json")
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_short_password(self):
        data = {**self.user_data, "password": "short"}
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens_for_valid_credentials(self):
        self.client.post(self.register_url, self.user_data, format="json")
        response = self.client.post(
            self.login_url,
            {"username": "testdriver", "password": "securepass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["username"], "testdriver")

    def test_login_rejects_wrong_password(self):
        self.client.post(self.register_url, self.user_data, format="json")
        response = self.client.post(
            self.login_url,
            {"username": "testdriver", "password": "wrongpassword"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_returns_user_when_authenticated(self):
        self.client.post(self.register_url, self.user_data, format="json")
        login_resp = self.client.post(
            self.login_url,
            {"username": "testdriver", "password": "securepass123"},
            format="json",
        )
        token = login_resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testdriver")

    def test_me_returns_401_when_not_authenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_accepts_valid_refresh_token(self):
        self.client.post(self.register_url, self.user_data, format="json")
        login_resp = self.client.post(
            self.login_url,
            {"username": "testdriver", "password": "securepass123"},
            format="json",
        )
        token = login_resp.data["access"]
        refresh = login_resp.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(
            self.logout_url, {"refresh": refresh}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_returns_message_with_valid_email(self):
        self.client.post(self.register_url, self.user_data, format="json")
        response = self.client.post(
            self.reset_url, {"email": "driver@test.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(
            "reset link", response.data["detail"].lower()
        )

    def test_password_reset_returns_message_for_unknown_email(self):
        response = self.client.post(
            self.reset_url, {"email": "unknown@test.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(
            "reset link", response.data["detail"].lower()
        )
