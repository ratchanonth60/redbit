from django.urls import path
from .views import social_login_callback

urlpatterns = [
    path("callback/", social_login_callback, name="social_login_callback"),
]
