from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import login_view, logout_view, me_view, password_reset_view, register_view

urlpatterns = [
    path("register/", register_view, name="auth-register"),
    path("login/", login_view, name="auth-login"),
    path("logout/", logout_view, name="auth-logout"),
    path("me/", me_view, name="auth-me"),
    path("password-reset/", password_reset_view, name="auth-password-reset"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
