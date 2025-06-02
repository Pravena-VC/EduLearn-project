from django.urls import path, include
from api.views import (
    StudentRegisterView, 
    StaffRegisterView, 
    LoginView,
    TokenRefreshView,
)
from api.views.course_discussions import CourseCommentsView
from api.views.staff_views import StaffUpdateView, StaffProfilePictureUploadView
from api.views.instructor_views import InstructorStatsView
from api.views.learning_path_views import LearningPathView, LearningPathDetailView
from api.views.notification_views import NotificationListView, NotificationReplyView
from api.views.profile_views import StudentProfileView, StudentProfilePictureUploadView
from api.views.course_views import (
    LessonDetailView,
    PublicCoursesView,
    CourseListCreateView, 
    CourseDetailView, 
    CourseThumbnailUploadView,
    SectionView,
    LessonView,
    MyCourseDetailsView,
    LessonVideoUploadView, 
    MyCertificatesView
)
from api.views.favoritecourse_views import FavoriteCourseView
from api.views.application_views import CourseApplicationView, ManageApplicationView
from api.views.blog_views import BlogListCreateView, BlogDetailView, MyBlogsView

urlpatterns = [
    # Authentication URLs
    path('auth/register/student/', StudentRegisterView.as_view(), name='register_student'),
    path('auth/register/staff/', StaffRegisterView.as_view(), name='register_staff'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Student Profile URL
    path('profile/student/', StudentProfileView.as_view(), name='student_profile'),

    # Public Course URLs (no auth required)
    path('public/courses/', PublicCoursesView.as_view(), name='public_courses'),
    
    # Course URLs
    path('courses/', CourseListCreateView.as_view(), name='course_list_create'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course_detail'),
    path('courses/<int:course_id>/thumbnail/', CourseThumbnailUploadView.as_view(), name='course_thumbnail_upload'),
    path('courses/<int:course_id>/view/', CourseDetailView.as_view(), name='course_viewing'),
    
    # Section URLs
    path('courses/<int:course_id>/sections/', SectionView.as_view(), name='section_create'),
    path('courses/<int:course_id>/sections/<int:section_id>/', SectionView.as_view(), name='section_detail'),
    
    # Lesson URLs
    path('courses/<int:course_id>/sections/<int:section_id>/lessons/', LessonView.as_view(), name='lesson_create'),
    path('courses/<int:course_id>/sections/<int:section_id>/lessons/<int:lesson_id>/', LessonView.as_view(), name='lesson_detail'),
    path('courses/<int:course_id>/sections/<int:section_id>/lessons/<int:lesson_id>/video/', LessonVideoUploadView.as_view(), name='lesson_video_upload'),
    path('lessons/<int:lesson_id>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('lessons/<int:lesson_id>/progress/', LessonDetailView.as_view(), name='lesson_progress'),
    
    # Course Discussion URLs
    path('courses/<int:course_id>/comments/', CourseCommentsView.as_view(), name='course_comments'),
    path('courses/<int:course_id>/comments/<str:comment_id>/', CourseCommentsView.as_view(), name='comment_detail'),
    
    # Staff URLs
    path('staff/update/', StaffUpdateView.as_view(), name='staff_update'),
    path('staff/profile-picture/', StaffProfilePictureUploadView.as_view(), name='staff_profile_picture_upload'),
    
    # Application URLs
    path('applications/', CourseApplicationView.as_view(), name='course_applications'),
    path('applications/<uuid:application_id>/', ManageApplicationView.as_view(), name='manage_application'),
    
    # Favorite Courses
    path('favorite-courses/', FavoriteCourseView.as_view(), name='favorite_courses'),

    # My Courses
    path('my-courses/', MyCourseDetailsView.as_view(), name='my_courses'),
    path('my-certificates/', MyCertificatesView.as_view(), name='my_certificates'),
    
    # Instructor Stats
    path('instructor/stats/', InstructorStatsView.as_view(), name='instructor_stats'),
    
    # Learning Paths
    path('learning-paths/', LearningPathView.as_view(), name='learning_paths'),
    path('learning-paths/<int:path_id>/', LearningPathDetailView.as_view(), name='learning_path_detail'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/reply/', NotificationReplyView.as_view(), name='notification_reply'),
    
    # Student Profile Picture
    path('profile/student/profile-picture/', StudentProfilePictureUploadView.as_view(), name='student_profile_picture_upload'),
    
    # Blog URLs
    path('blogs/', BlogListCreateView.as_view(), name='blog_list_create'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog_detail'),
    path('blogs/my/', MyBlogsView.as_view(), name='my_blogs'),
]