from django.urls import path, re_path
from .socket.consumer import MyConsumer

websocket_urlpatterns = [
    re_path(r"^ws/connection/?$", MyConsumer.as_asgi()),
    path("connection/", MyConsumer.as_asgi()),
]
