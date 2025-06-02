from django.db import models
from django.contrib.auth.models import User
from .course import Course
import uuid_utils as uuid

def generate_uuid():
    """
    Generate a UUIDv7 string.
    """
    return str(uuid.uuid7())


class FavoriteCourse(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='favorites')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
