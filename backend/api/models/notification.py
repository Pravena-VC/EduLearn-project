from django.db import models
from api.models.student import Student
from api.models.staff import Staff
from django.utils import timezone

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('comment', 'Comment'),
        ('enrollment', 'Enrollment'),
        ('course_viewed', 'Course Viewed'),
        ('question', 'Question'),
        ('reply', 'Reply'),
        ('other', 'Other'),
    )

    recipient_staff = models.ForeignKey(Staff, on_delete=models.CASCADE, null=True, blank=True,
                                        related_name='received_notifications')
    recipient_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True,
                                         related_name='received_notifications')
    sender_staff = models.ForeignKey(Staff, on_delete=models.CASCADE, null=True, blank=True,
                                    related_name='sent_notifications_staff')
    sender_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True,
                                      related_name='sent_notifications_student')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.CharField(max_length=500)
    course_id = models.ForeignKey('Course', on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    related_item_id = models.UUIDField(null=True, blank=True)
    related_item_type = models.CharField(max_length=50, blank=True, null=True)  # 'course', 'comment', etc.
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        recipient = self.recipient_staff or self.recipient_student
        recipient_name = getattr(recipient, 'name', 'Unknown')
        return f"{self.notification_type} notification for {recipient_name}"
    
    class Meta:
        ordering = ['-created_at']
