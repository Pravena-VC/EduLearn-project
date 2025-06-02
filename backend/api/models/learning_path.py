from django.db import models
from .student import Student

class LearningPath(models.Model):
    """
    Store personalized learning paths generated for students.
    The path_data field stores the entire JSON response from the AI service.
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='learning_paths')
    title = models.CharField(max_length=255, blank=True, null=True)
    learning_goal = models.TextField(blank=True, null=True)
    background = models.CharField(max_length=100, blank=True, null=True)
    time_commitment = models.CharField(max_length=100, blank=True, null=True)
    preferred_style = models.CharField(max_length=100, blank=True, null=True)
    path_data = models.TextField()  # Stores the entire JSON response
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Learning Path for {self.student.user.username} - {self.title or 'Untitled'}"
