from django.db import models
from django.contrib.auth.models import User
import uuid_utils as uuid

def generate_uuid():
    """
    Generate a UUIDv7 string.
    """
    return str(uuid.uuid7())


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    staff_id = models.UUIDField(max_length=20, unique=True, default=generate_uuid, editable=False)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    @property
    def name(self):
        """Get full name or username"""
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name} {self.user.last_name}"
        elif self.user.first_name:
            return self.user.first_name
        else:
            return self.user.username
    
    def __str__(self):
        return f"{self.user.username} - {self.staff_id}"