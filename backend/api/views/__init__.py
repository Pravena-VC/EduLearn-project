from .auth_views import StudentRegisterView, StaffRegisterView, LoginView, TokenRefreshView
from .course_views import (
    CourseListCreateView, 
    CourseDetailView, 
    CourseThumbnailUploadView,
    SectionView,
    LessonView,
    LessonVideoUploadView
)
from .application_views import CourseApplicationView, ManageApplicationView
from .course_discussions import CourseCommentsView
from .instructor_views import InstructorStatsView
from .notification_views import NotificationListView
from .debug_views import WebSocketDebugView
from .blog_views import BlogListCreateView, BlogDetailView