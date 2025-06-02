import os
from django.http import JsonResponse
from django.conf import settings

from api.models import Course, Section, Lesson, Enrollment, FavoriteCourse


def get_course_with_details(request, course_id):
    """
    Get complete details of a course including sections, lessons, requirements, etc.
    Also includes user-specific data if the user is authenticated.
    
    Returns a tuple: (status_code, response_data)
    """
    try:
        course = Course.objects.get(id=course_id)
        
        # Check if course is published or user has special access
        is_published = course.is_published
        is_instructor = False
        is_enrolled = False
        application_status = None
        has_access = is_published
        
        user = request.user
        if user.is_authenticated:
            # Check if user is the instructor
            if hasattr(user, 'staff'):
                is_instructor = (user.staff.id == course.instructor.id)
                
                # Instructors always have access to their own courses
                if is_instructor:
                    has_access = True
            
            # Check if student is enrolled - using enrollments relationship
            if hasattr(user, 'student'):
                # Fix: Use enrollments relationship instead of students
                is_enrolled = course.enrollments.filter(student=user.student).exists()
                
                # Enrolled students have access even if not published
                if is_enrolled:
                    has_access = True
                
                # Check for application status if not enrolled
                if not is_enrolled:
                    from api.models import CourseApplication
                    application = CourseApplication.objects.filter(
                        course=course,
                        student=user.student
                    ).first()
                    
                    if application:
                        application_status = application.status
                        # Note: having an application doesn't grant access to course content
                        # that's handled separately in get_lesson_details
        
        if not has_access and not is_instructor and not is_enrolled and not application_status:
            return 403, {
                'success': False,
                'message': 'You do not have access to this course'
            }
        
        # Collect sections and lessons data
        sections_data = []
        for section in course.sections.all().order_by('order'):
            lessons_data = []
            for lesson in section.lessons.all().order_by('order'):
                # Only show unpublished lessons to instructor
                if not lesson.is_published and not is_instructor:
                    continue
                    
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'is_published': lesson.is_published,
                    'order': lesson.order
                }
                
                # Add content for article type lessons
                if lesson.type == 'article' and (is_instructor or is_enrolled):
                    lesson_data['content'] = lesson.content
                
                # Add video URL for video lessons
                if lesson.video:
                    lesson_data['video_url'] = request.build_absolute_uri(lesson.video.url)
                
                # Add progress data if user is a student and enrolled
                if is_enrolled and hasattr(user, 'student'):
                    from api.models import LessonProgress
                    try:
                        progress = LessonProgress.objects.get(
                            student=user.student, 
                            lesson=lesson
                        )
                        lesson_data['completed'] = progress.is_completed
                        lesson_data['last_viewed'] = progress.updated_at.isoformat()
                    except LessonProgress.DoesNotExist:
                        lesson_data['completed'] = False
                        lesson_data['last_viewed'] = None
                
                lessons_data.append(lesson_data)
            
            # Skip empty sections for non-instructors
            if not is_instructor and not lessons_data:
                continue
                
            section_data = {
                'id': section.id,
                'title': section.title,
                'order': section.order,
                'lessons': lessons_data
            }
            sections_data.append(section_data)
        
        # Collect requirements
        requirements_data = [
            {'id': req.id, 'text': req.text, 'order': req.order}
            for req in course.requirements.all().order_by('order')
        ]
        
        # Collect learning objectives
        objectives_data = [
            {'id': obj.id, 'text': obj.text, 'order': obj.order}
            for obj in course.objectives.all().order_by('order')
        ]
        
        # Get instructor details
        instructor = course.instructor
        instructor_data = {
            'id': instructor.staff_id,
            'name': f"{instructor.user.first_name} {instructor.user.last_name}".strip(),
            'bio': instructor.bio,
            'email': instructor.user.email if is_instructor else None,  # Only show email to instructor
            'profile_picture': request.build_absolute_uri(instructor.profile_picture.url) if instructor.profile_picture else None
        }

        is_favorited = False
        if user.is_authenticated and hasattr(user, 'student'):
            is_favorited = FavoriteCourse.objects.filter(
                user=user, course=course
            ).exists()
        
        progress_percentage = 0
        completed_lessons = []
        if is_enrolled and hasattr(user, 'student'):
            from api.models import LessonProgress
            total_lessons = sum(len(section.lessons.all()) for section in course.sections.all())
            if total_lessons > 0:
                progress_records = LessonProgress.objects.filter(
                    student=user.student,
                    lesson__section__course=course,
                    is_completed=True
                )
                completed_count = progress_records.count()
                progress_percentage = int((completed_count / total_lessons) * 100)
                completed_lessons = list(progress_records.values_list('lesson_id', flat=True))
        
        # Build the course data structure
        course_data = {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'instructor': instructor_data,
            'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
            'price': float(course.price),
            'level': course.level,
            'category': course.category,
            'language': course.language,
            'rating': float(course.rating),
            'rating_count': course.rating_count,
            'is_published': course.is_published,
            'is_featured': course.is_featured,
            'total_students': course.total_students,
            'total_lessons': course.total_lessons,
            'total_duration': course.total_duration,
            'sections': sections_data,
            'requirements': requirements_data,
            'objectives': objectives_data,
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat(),
            
            'user_data': {
                'is_enrolled': is_enrolled,
                'is_instructor': is_instructor,
                'is_favorite': is_favorited,
                'application_status': application_status,
                'progress_percentage': progress_percentage,
                'has_access': has_access,
                'progress': {
                    'percent_complete': progress_percentage,
                    'completed_lessons': completed_lessons
                } if is_enrolled else None
            }
        }
        
        return 200, {
            'success': True,
            'data': course_data
        }
        
    except Course.DoesNotExist:
        return 404, {
            'success': False,
            'message': 'Course not found'
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return 500, {
            'success': False,
            'message': str(e)
        }


def _format_course_detail(request, course, include_unpublished=False):
    """
    Helper function to format course details including video URLs optimized for streaming.
    
    Args:
        request: The HTTP request object
        course: Course model instance
        include_unpublished: Whether to include unpublished lessons
    
    Returns:
        Dictionary with complete formatted course data
    """
    # Collect sections and lessons with proper video URL configuration
    sections_data = []
    total_lessons = 0
    total_duration_seconds = 0
    
    for section in course.sections.all().order_by('order'):
        lessons_data = []
        for lesson in section.lessons.all().order_by('order'):
            # Skip unpublished lessons if not requested
            if not include_unpublished and not lesson.is_published:
                continue
                
            # Format video URL with proper access token if needed
            video_url = None
            if lesson.video:
                video_url = request.build_absolute_uri(lesson.video.url)
                
                # Add video metadata for optimized playback
                video_metadata = {}
                if lesson.video.name:
                    file_path = os.path.join(settings.MEDIA_ROOT, lesson.video.name)
                    try:
                        video_metadata['size'] = os.path.getsize(file_path)
                        # You could use a library like python-magic to detect MIME type
                        # or ffmpeg to get more detailed video information
                    except OSError:
                        pass
            
            # Parse duration into seconds for calculations
            duration_seconds = 0
            if lesson.duration:
                try:
                    minutes, seconds = lesson.duration.split(':')
                    duration_seconds = (int(minutes) * 60) + int(seconds)
                    total_duration_seconds += duration_seconds
                except ValueError:
                    pass
                    
            # Increment total lesson count
            total_lessons += 1
            
            # Check if the lesson has the 'preview' attribute, otherwise default to False
            is_preview = False
            if hasattr(lesson, 'preview'):
                is_preview = lesson.preview
            
            lesson_data = {
                'id': lesson.id,
                'title': lesson.title,
                'type': lesson.type,
                'duration': lesson.duration,
                'duration_seconds': duration_seconds,
                'is_published': lesson.is_published,
                'content': lesson.content if lesson.type == 'article' else None,
                'video_url': video_url,
                'order': lesson.order,
                'preview': is_preview,
            }
            lessons_data.append(lesson_data)
        
        if lessons_data or include_unpublished:
            section_data = {
                'id': section.id,
                'title': section.title,
                'order': section.order,
                'lessons': lessons_data
            }
            sections_data.append(section_data)
    
    # Format total duration
    hours = total_duration_seconds // 3600
    minutes = (total_duration_seconds % 3600) // 60
    seconds = total_duration_seconds % 60
    
    if hours > 0:
        formatted_duration = f"{hours}h {minutes}m"
    else:
        formatted_duration = f"{minutes}m {seconds}s"
    
    # Collect requirements
    requirements_data = [
        {'id': req.id, 'text': req.text, 'order': req.order}
        for req in course.requirements.all().order_by('order')
    ]
    
    # Collect learning objectives
    objectives_data = [
        {'id': obj.id, 'text': obj.text, 'order': obj.order}
        for obj in course.objectives.all().order_by('order')
    ]
    
    # Ensure we have a proper instructor name, defaulting to username if first/last not available
    instructor_name = ""
    if hasattr(course.instructor.user, 'first_name') and course.instructor.user.first_name:
        instructor_name = course.instructor.user.first_name
        if hasattr(course.instructor.user, 'last_name') and course.instructor.user.last_name:
            instructor_name += f" {course.instructor.user.last_name}"
    
    if not instructor_name.strip():
        instructor_name = course.instructor.user.username
    
    # Add fields with default values if they don't exist
    short_description = course.description
    if len(short_description) > 150:
        short_description = short_description[:147] + "..."
    
    # Ensure these fields exist, even with default values
    course_language = getattr(course, 'language', 'English')
    course_rating = float(getattr(course, 'rating', 0.0))
    course_rating_count = getattr(course, 'rating_count', 0)
    
    # Build the complete course data object
    return {
        'id': course.id,
        'title': course.title,
        'short_description': getattr(course, 'short_description', short_description),
        'description': course.description,
        'instructor': {
            'id': getattr(course.instructor, 'staff_id', str(course.instructor.id)),
            'name': instructor_name,
            'email': course.instructor.user.email,
            'bio': getattr(course.instructor, 'bio', None),
            'profile_picture': request.build_absolute_uri(course.instructor.profile_picture.url) 
                              if hasattr(course.instructor, 'profile_picture') and course.instructor.profile_picture else None,
        },
        'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
        'price': float(course.price),
        'level': course.level,
        'category': course.category,
        'language': course_language,
        'rating': course_rating,
        'rating_count': course_rating_count,
        'is_published': course.is_published,
        'is_featured': course.is_featured,
        'total_students': course.total_students,
        'total_lessons': total_lessons,
        'total_duration': formatted_duration,
        'total_duration_seconds': total_duration_seconds,
        'sections': sections_data,
        'requirements': requirements_data,
        'objectives': objectives_data,
        'created_at': course.created_at.isoformat(),
        'updated_at': course.updated_at.isoformat()
    }


def get_lesson_details(request, lesson_id, check_permissions=True):
    """
    Get detailed lesson information including optimized video URL
    
    Args:
        request: The HTTP request object
        lesson_id: ID of the lesson to retrieve
        check_permissions: Whether to check user permissions
    
    Returns:
        Tuple containing (status_code, response_data)
    """
    try:
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            course = lesson.section.course
        except Lesson.DoesNotExist:
            return 404, {
                'success': False,
                'message': 'Lesson not found'
            }
        
        if check_permissions:
            # Check user permissions
            is_instructor = False
            is_enrolled = False
            has_pending_application = False
            
            if request.user.is_authenticated:
                # Check if user is the instructor
                try:
                    from api.models import Staff
                    staff = Staff.objects.get(user=request.user)
                    is_instructor = (staff.id == course.instructor.id)
                except Staff.DoesNotExist:
                    pass
                    
                # Check if user is enrolled or has pending application
                try:
                    from api.models import Student, CourseApplication
                    student = Student.objects.get(user=request.user)
                    is_enrolled = Enrollment.objects.filter(course=course, student=student).exists()
                    
                    # Check if user has a pending application
                    if not is_enrolled:
                        application = CourseApplication.objects.filter(
                            course=course, 
                            student=student
                        ).first()
                        
                        if application and application.status == 'pending':
                            has_pending_application = True
                except Student.DoesNotExist:
                    pass
            
            # If lesson is not published or course is not published 
            # and user is not instructor or enrolled student, deny access
            if (not lesson.is_published or not course.is_published) and not is_instructor and not is_enrolled:
                if hasattr(lesson, 'preview') and lesson.preview:
                    # Allow access to preview lessons
                    pass
                else:
                    return 403, {
                        'success': False,
                        'message': 'You do not have permission to access this lesson'
                    }
            
            # If user has a pending application but is not enrolled,
            # allow only basic lesson info but not video content
            if has_pending_application and not is_enrolled and not is_instructor:
                # Format video URL with proper access
                video_metadata = {}
                
                # Parse duration into seconds
                duration_seconds = 0
                if lesson.duration:
                    try:
                        minutes, seconds = lesson.duration.split(':')
                        duration_seconds = (int(minutes) * 60) + int(seconds)
                    except ValueError:
                        pass
                
                # Get the position of this lesson within the course
                lesson_position = {
                    'section_id': lesson.section.id,
                    'section_title': lesson.section.title,
                    'section_order': lesson.section.order,
                    'lesson_order': lesson.order,
                }
                
                # Check if the lesson has the 'preview' attribute, otherwise default to False
                is_preview = False
                if hasattr(lesson, 'preview'):
                    is_preview = lesson.preview
                
                # Return limited information for pending applications
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'duration_seconds': duration_seconds,
                    'is_published': lesson.is_published,
                    'content': None,  # Don't provide full content
                    'video_url': None,  # Don't provide video URL
                    'order': lesson.order,
                    'preview': is_preview,
                    'position': lesson_position,
                    'next_lesson': None,  # Don't provide navigation
                    'prev_lesson': None,  # Don't provide navigation
                    'course': {
                        'id': course.id,
                        'title': course.title
                    },
                    'access_restricted': True,  # Flag to indicate restricted access
                    'application_status': 'pending'
                }
                
                return 200, {
                    'success': True,
                    'data': lesson_data
                }
        
        # Format video URL with proper access
        video_url = None
        if lesson.video:
            video_url = request.build_absolute_uri(lesson.video.url)
            
            # Add video metadata for optimized playback
            video_metadata = {}
            if lesson.video.name:
                file_path = os.path.join(settings.MEDIA_ROOT, lesson.video.name)
                try:
                    video_metadata['size'] = os.path.getsize(file_path)
                except OSError:
                    pass
        
        # Parse duration into seconds
        duration_seconds = 0
        if lesson.duration:
            try:
                minutes, seconds = lesson.duration.split(':')
                duration_seconds = (int(minutes) * 60) + int(seconds)
            except ValueError:
                pass
                
        # Get the position of this lesson within the course
        lesson_position = {
            'section_id': lesson.section.id,
            'section_title': lesson.section.title,
            'section_order': lesson.section.order,
            'lesson_order': lesson.order,
        }
        
        # Get next and previous lessons
        next_lesson = None
        prev_lesson = None
        
        # Find all lessons in the course, sorted by section order then lesson order
        all_lessons = []
        for section in course.sections.all().order_by('order'):
            for l in section.lessons.all().order_by('order'):
                all_lessons.append(l)
        
        # Find current lesson index
        current_index = -1
        for i, l in enumerate(all_lessons):
            if l.id == lesson.id:
                current_index = i
                break
        
        # Get previous and next lessons
        if current_index > 0:
            prev_l = all_lessons[current_index - 1]
            prev_lesson = {
                'id': prev_l.id,
                'title': prev_l.title,
                'section_id': prev_l.section.id,
                'section_title': prev_l.section.title
            }
        
        if current_index < len(all_lessons) - 1:
            next_l = all_lessons[current_index + 1]
            next_lesson = {
                'id': next_l.id,
                'title': next_l.title,
                'section_id': next_l.section.id,
                'section_title': next_l.section.title
            }
        
        # Check if the lesson has the 'preview' attribute, otherwise default to False
        is_preview = False
        if hasattr(lesson, 'preview'):
            is_preview = lesson.preview
        
        lesson_data = {
            'id': lesson.id,
            'title': lesson.title,
            'type': lesson.type,
            'duration': lesson.duration,
            'duration_seconds': duration_seconds,
            'is_published': lesson.is_published,
            'content': lesson.content if lesson.type == 'article' else None,
            'video_url': video_url,
            'order': lesson.order,
            'preview': is_preview,
            'position': lesson_position,
            'next_lesson': next_lesson,
            'prev_lesson': prev_lesson,
            'course': {
                'id': course.id,
                'title': course.title
            },
            'access_restricted': False
        }
        
        return 200, {
            'success': True,
            'data': lesson_data
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return 500, {
            'success': False,
            'message': str(e)
        }


def mark_lesson_progress(request, lesson_id, is_completed=True):
    """
    Mark a lesson as completed or uncompleted for a student
    
    Args:
        request: The HTTP request object
        lesson_id: ID of the lesson to mark
        is_completed: Whether the lesson is completed (True) or not (False)
    
    Returns:
        Tuple containing (status_code, response_data)
    """
    if not request.user.is_authenticated:
        return 401, {
            'success': False,
            'message': 'Authentication required'
        }
    
    try:
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            course = lesson.section.course
        except Lesson.DoesNotExist:
            return 404, {
                'success': False,
                'message': 'Lesson not found'
            }
        
        # Check if user is enrolled in the course
        try:
            from api.models import Student, LessonProgress
            student = Student.objects.get(user=request.user)
            
            if not Enrollment.objects.filter(course=course, student=student).exists():
                return 403, {
                    'success': False,
                    'message': 'You are not enrolled in this course'
                }
            
            # Update or create lesson progress
            progress, created = LessonProgress.objects.update_or_create(
                student=student,
                lesson=lesson,
                defaults={'is_completed': is_completed}
            )
            
            # Send notification to instructor when a student watches their course
            # Only send on first view of the lesson
            if created:
                try:
                    # Import the function here to avoid circular imports
                    from api.utils.notification_utils import create_course_watch_notification
                    create_course_watch_notification(course, student)
                except Exception as e:
                    # Log the error but don't break the flow
                    print(f"Failed to send course watch notification: {e}")
                    
            # Calculate overall course progress
            total_lessons = Lesson.objects.filter(
                section__course=course,
                is_published=True
            ).count()
            
            completed_lessons = LessonProgress.objects.filter(
                student=student,
                lesson__section__course=course,
                is_completed=True
            ).count()
            
            percent_complete = 0
            if total_lessons > 0:
                percent_complete = (completed_lessons / total_lessons) * 100
            
            # Return a consistent response structure with all required fields
            return 200, {
                'success': True,
                'data': {
                    'lesson_id': lesson.id,
                    'is_completed': is_completed,
                    'course_progress': {
                        'total_lessons': total_lessons,
                        'completed_lessons': completed_lessons,
                        'percent_complete': round(percent_complete, 1)
                    }
                }
            }
            
        except Student.DoesNotExist:
            return 403, {
                'success': False,
                'message': 'User is not registered as a student'
            }
        except Exception as e:
            import traceback
            traceback.print_exc()
            # Return a fail-safe progress response with default values
            return 200, {
                'success': True,
                'data': {
                    'lesson_id': lesson.id,
                    'is_completed': is_completed,
                    'course_progress': {
                        'total_lessons': 1, 
                        'completed_lessons': 1 if is_completed else 0,
                        'percent_complete': 100 if is_completed else 0
                    }
                }
            }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return 500, {
            'success': False,
            'message': str(e)
        }