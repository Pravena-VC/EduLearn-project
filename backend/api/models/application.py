from django.db import models
from django.contrib.auth.models import User
import uuid_utils as uuid
from .course import Course
from .student import Student

def generate_uuid():
    """
    Generate a UUIDv7 string.
    """
    return str(uuid.uuid7())


class CourseApplication(models.Model):
    """
    Course application model representing a student's application to join a course
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    id = models.UUIDField(primary_key=True, default=generate_uuid, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student} - {self.course} - {self.status}"