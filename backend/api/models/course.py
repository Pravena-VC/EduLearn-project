from django.db import models
from django.contrib.auth.models import User
import uuid
import os
from .staff import Staff


def course_thumbnail_path(instance, filename):
    """Generate file path for course thumbnails"""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}_{uuid.uuid4()}.{ext}"
    return os.path.join('courses', 'thumbnails', filename)


def lesson_video_path(instance, filename):
    """Generate file path for lesson videos"""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}_{uuid.uuid4()}.{ext}"
    return os.path.join('courses', 'videos', filename)


class Course(models.Model):
    """
    Course model representing a course created by an instructor
    """
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all_levels', 'All Levels'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='courses')
    thumbnail = models.ImageField(upload_to=course_thumbnail_path, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='all_levels')
    category = models.CharField(max_length=100, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)  # Soft delete flag
    
    # New rating fields
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    rating_count = models.PositiveIntegerField(default=0)
    
    # Course metadata
    language = models.CharField(max_length=100, default='English')
    short_description = models.CharField(max_length=255, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    @property
    def total_students(self):
        """Return the total number of enrolled students"""
        return self.enrollments.count()
    
    @property
    def total_lessons(self):
        """Return the total number of lessons in the course"""
        return Lesson.objects.filter(section__course=self).count()
    
    @property
    def total_duration(self):
        """Return the total duration of all lessons in the course"""
        total_seconds = 0
        lessons = Lesson.objects.filter(section__course=self)
        for lesson in lessons:
            if lesson.duration:
                try:
                    # Parse duration in minutes:seconds format
                    minutes, seconds = lesson.duration.split(':')
                    total_seconds += int(minutes) * 60 + int(seconds)
                except (ValueError, AttributeError):
                    pass
        
        # Format the total duration back to minutes:seconds
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"
    
    @property
    def average_rating(self):
        """Return the average rating (formatted)"""
        if self.rating_count > 0:
            return self.rating
        return 0
    
    @property
    def reviews_count(self):
        """Return the number of reviews"""
        return self.rating_count


class Section(models.Model):
    """
    Section model representing a chapter or module in a course
    """
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """
    Lesson model representing individual lessons within a section
    """
    LESSON_TYPE_CHOICES = (
        ('video', 'Video'),
        ('article', 'Article'),
    )
    
    title = models.CharField(max_length=255)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    type = models.CharField(max_length=10, choices=LESSON_TYPE_CHOICES, default='video')
    video = models.FileField(upload_to=lesson_video_path, null=True, blank=True)
    content = models.TextField(null=True, blank=True)  # For text-based lessons or additional notes
    duration = models.CharField(max_length=10, null=True, blank=True)  # Format: "mm:ss"
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title


class Requirement(models.Model):
    """
    Requirement model for prerequisites needed for a course
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='requirements')
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Requirement for {self.course.title}"

class Resource(models.Model):
    """
    Resource model for additional materials related to a course
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    type= models.CharField(max_length=50, choices=[
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('file', 'File'),
    ])
    file = models.FileField(upload_to='resources/', null=True, blank=True)  # For file uploads
    url = models.URLField(null=True, blank=True)  # For external links
    description = models.TextField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)  # Added order field
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Resource: {self.title} for {self.course.title}"


class LearningObjective(models.Model):
    """
    Learning objective or outcome for a course
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='objectives')
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Objective for {self.course.title}"


class Enrollment(models.Model):
    """
    Enrollment model to track student enrollments in courses
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='enrollments')
    progress = models.PositiveIntegerField(default=0)  # Progress percentage (0-100)
    completed = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['course', 'student']
    
    def __str__(self):
        return f"{self.student} enrolled in {self.course}"


class LessonProgress(models.Model):
    """
    Tracks student progress on individual lessons
    """
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress_records')
    is_completed = models.BooleanField(default=False)
    progress_percent = models.PositiveIntegerField(default=0)  # For partial completion (e.g., video watched 50%)
    last_position = models.PositiveIntegerField(default=0)  # Last position in the video (seconds)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'lesson']
    
    def __str__(self):
        status = "completed" if self.is_completed else "in progress"
        return f"Lesson {self.lesson.id} {status} by {self.student}"