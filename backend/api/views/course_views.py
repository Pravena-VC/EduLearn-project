from datetime import timezone, datetime
import json
import os
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle


from api.models import Course, Section, Lesson, Requirement, LearningObjective, Staff, Resource,Enrollment, Student, FavoriteCourse, LessonProgress
from api.utils.course_utils import get_course_with_details, get_lesson_details, mark_lesson_progress


@method_decorator(csrf_exempt, name='dispatch')
class PublicCoursesView(View):
    """
    View for retrieving published courses with pagination
    No authentication required - public endpoint
    """
    def get(self, request):
        try:
            category = request.GET.get('category')
            level = request.GET.get('level')
            search = request.GET.get('search')
            featured = request.GET.get('featured', '').lower() == 'true'
            
            courses = Course.objects.filter(is_published=True)
            
            if category:
                courses = courses.filter(category=category)
            
            if level:
                courses = courses.filter(level=level)
            
            if search:
                courses = courses.filter(title__icontains=search)
            
            if featured:
                courses = courses.filter(is_featured=True)
            
            courses = courses.order_by('-created_at')
            
            page = request.GET.get('page', 1)
            page_size = request.GET.get('page_size', 12)
            
            paginator = Paginator(courses, page_size)
            
            try:
                current_page = paginator.page(page)
            except PageNotAnInteger:
                current_page = paginator.page(1)
            except EmptyPage:
                current_page = paginator.page(paginator.num_pages)
            
            courses_data = []
            for course in current_page:
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'short_description': course.short_description or course.description[:150] + '...',
                    'description': course.description,
                    'instructor': {
                        'id': course.instructor.staff_id,
                        'name': f"{course.instructor.user.first_name} {course.instructor.user.last_name}".strip(),
                    },
                    'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                    'price': float(course.price),
                    'level': course.level,
                    'category': course.category,
                    'language': course.language,
                    'rating': float(course.rating),
                    'rating_count': course.rating_count,
                    'is_featured': course.is_featured,
                    'total_students': course.total_students,
                    'total_lessons': course.total_lessons,
                    'total_duration': course.total_duration,
                    'created_at': course.created_at.isoformat(),
                    'updated_at': course.updated_at.isoformat(),
                }
                courses_data.append(course_data)
                
            all_categories = Course.objects.filter(is_published=True).values_list('category', flat=True).distinct()
            all_categories = [category for category in all_categories if category]
            
            # Return paginated response
            return JsonResponse({
                'success': True,
                'data': courses_data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'total_courses': paginator.count,
                    'current_page': int(page),
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous(),
                },
                'filters': {
                    'categories': all_categories,
                    'levels': [level[0] for level in Course.LEVEL_CHOICES],
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch') 
class CourseListCreateView(View):
    def get(self, request):
        user = request.user

        try:
            instructor_id = request.GET.get('instructor')

            if instructor_id:
                # Show all active (not deleted) courses for instructor
                courses = Course.objects.filter(instructor__staff_id=instructor_id, is_active=True)
            else:
                # Only show published and active courses to others
                courses = Course.objects.filter(is_published=True, is_active=True)

            # Sort courses in reverse order (latest first)
            courses = courses.order_by('-created_at')

            courses_data = []
            for course in courses:
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'description': course.description,
                    'instructor': {
                        'id': course.instructor.staff_id,
                        'name': course.instructor.user.first_name,
                    },
                    'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                    'price': float(course.price),
                    'level': course.level,
                    'category': course.category,
                    'is_published': course.is_published,
                    'is_featured': course.is_featured,
                    'is_active': course.is_active,
                    'total_students': course.total_students,
                    'total_lessons': course.total_lessons,
                    'total_duration': course.total_duration,
                    'created_at': course.created_at.isoformat(),
                }
                courses_data.append(course_data)
 

            return JsonResponse({
                'success': True,
                'data': courses_data
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def post(self, request):
        """Create a new course"""
        user = request.user
        
        try: 
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can create courses'
                }, status=403)
             
            is_multipart = request.content_type and 'multipart/form-data' in request.content_type
            
            if is_multipart: 
                course_title = request.POST.get('title')
                course_description = request.POST.get('description', '')
                course_price = request.POST.get('price', 0)
                course_level = request.POST.get('level', 'all_levels')
                course_category = request.POST.get('category', '')
                is_published = request.POST.get('is_published', 'false').lower() == 'true'
                is_featured = request.POST.get('is_featured', 'false').lower() == 'true'
                 
                requirements_data = request.POST.get('requirements')
                objectives_data = request.POST.get('objectives')
                resources_data = request.POST.get('resources')
                 
                sections_data = request.POST.get('sections')
                if sections_data:
                    try:
                        sections = json.loads(sections_data)
                    except json.JSONDecodeError:
                        sections = None
                else:
                    sections = None
            else: 
                data = json.loads(request.body)
                course_title = data.get('title')
                course_description = data.get('description', '')
                course_price = data.get('price', 0)
                course_level = data.get('level', 'all_levels')
                course_category = data.get('category', '')
                is_published = data.get('is_published', False)
                is_featured = data.get('is_featured', False)
                
                requirements_data = json.dumps(data.get('requirements', [])) if 'requirements' in data else None
                objectives_data = json.dumps(data.get('objectives', [])) if 'objectives' in data else None
                resources_data = json.dumps(data.get('resources', [])) if 'resources' in data else None
                 
                sections = data.get('sections')
            
            if not course_title:
                return JsonResponse({
                    'success': False,
                    'message': 'Course title is required'
                }, status=400)
             
            with transaction.atomic(): 
                course = Course.objects.create(
                    title=course_title,
                    description=course_description,
                    instructor=staff,
                    price=course_price,
                    level=course_level,
                    category=course_category,
                    is_published=is_published,
                    is_featured=is_featured
                )
                 
                if is_multipart and 'thumbnail' in request.FILES:
                    thumbnail = request.FILES.get('thumbnail')
                    course.thumbnail = thumbnail
                    course.save()
                 
                if requirements_data:
                    try:
                        requirements = json.loads(requirements_data)
                        for i, req_text in enumerate(requirements):
                            if req_text and req_text.strip():  # Only add non-empty requirements
                                Requirement.objects.create(
                                    course=course,
                                    text=req_text,
                                    order=i
                                )
                    except json.JSONDecodeError:
                        pass
                 
                if objectives_data:
                    try:
                        objectives = json.loads(objectives_data)
                        for i, obj_text in enumerate(objectives):
                            if obj_text and obj_text.strip():
                                LearningObjective.objects.create(
                                    course=course,
                                    text=obj_text,
                                    order=i
                                )
                    except json.JSONDecodeError:
                        pass  # Skip if not valid JSON

                # Handle resources data
                if resources_data:
                    try:
                        resources = json.loads(resources_data)
                        for i, resource_data in enumerate(resources):
                            title = resource_data.get('title', '')
                            resource_type = resource_data.get('type', '')
                            description = resource_data.get('description', '')
                            url = resource_data.get('url', '')
                            
                            if not title:
                                continue
                            
                            resource = Resource.objects.create(
                                course=course,
                                title=title,
                                type=resource_type,
                                url=url,
                                description=description,
                                order=i
                            )
                            
                            if is_multipart and resource_type in ['file', 'pdf', 'doc', 'video']:
                                resource_id = resource_data.get('id', '')
                                if resource_id and f"file_{resource_id}" in request.FILES:
                                    resource.file = request.FILES[f"file_{resource_id}"]
                                    resource.save()
                    except json.JSONDecodeError:
                        pass
                 
                if sections:
                    lesson_id_map = {}
                    
                    for section_idx, section_data in enumerate(sections):
                        section = Section.objects.create(
                            course=course,
                            title=section_data.get('title', f"Section {section_idx + 1}"),
                            order=section_data.get('order', section_idx)
                        )
                         
                        if 'lessons' in section_data and section_data['lessons']:
                            for lesson_idx, lesson_data in enumerate(section_data['lessons']):
                                lesson_id = lesson_data.get('id', f"lesson-{lesson_idx}")
                                
                                lesson = Lesson.objects.create(
                                    section=section,
                                    title=lesson_data.get('title', f"Lesson {lesson_idx + 1}"),
                                    type=lesson_data.get('type', 'video'),
                                    content=lesson_data.get('content', ''),
                                    duration=lesson_data.get('duration', '00:00'),
                                    is_published=lesson_data.get('is_published', False),
                                    order=lesson_data.get('order', lesson_idx)
                                )
                                 
                                lesson_id_map[lesson_id] = lesson
                     
                    if is_multipart:
                        for key, file in request.FILES.items(): 
                            if key.startswith('video_'): 
                                frontend_lesson_id = key[6:]
                                 
                                if frontend_lesson_id in lesson_id_map:
                                    lesson = lesson_id_map[frontend_lesson_id]
                                    if lesson.type == 'video':
                                        lesson.video = file
                                        lesson.save()
             
            course_data = self._get_detailed_course_data(request, course)
            
            return JsonResponse({
                'success': True,
                'message': 'Course created successfully',
                'data': course_data
            }, status=201)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    def _get_detailed_course_data(self, request, course):
        """Helper method to get detailed course data including sections and lessons"""
        # Collect sections and lessons
        sections_data = []
        for section in course.sections.all().order_by('order'):
            lessons_data = []
            for lesson in section.lessons.all().order_by('order'):
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'is_published': lesson.is_published,
                    'content': lesson.content if lesson.type == 'article' else None,
                    'video_url': request.build_absolute_uri(lesson.video.url) if lesson.video else None,
                    'order': lesson.order
                }
                lessons_data.append(lesson_data)
            
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
        
       
        return {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'instructor': {
                'id': course.instructor.staff_id,
                'name': course.instructor.user.first_name,
                'email': course.instructor.user.email
            },
            'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
            'price': float(course.price),
            'level': course.level,
            'category': course.category,
            'is_published': course.is_published,
            'is_featured': course.is_featured,
            'total_students': course.total_students,
            'total_lessons': course.total_lessons,
            'total_duration': course.total_duration,
            'sections': sections_data,
            'requirements': requirements_data,
            'objectives': objectives_data,
            'resources': [],
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat()
        }


@method_decorator(csrf_exempt, name='dispatch')
class CourseDetailView(View):
    """
    View for retrieving, updating and deleting a specific course
    """
    def get(self, request, course_id):
        """Get details of a specific course"""
        # Use our utility function that handles favorites and user data
        status_code, response_data = get_course_with_details(request, course_id)
        return JsonResponse(response_data, status=status_code)
    
    def put(self, request, course_id):
        """Update a specific course"""
        user = request.user
        try:
            # Get course and verify ownership
            course = Course.objects.get(id=course_id)
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Only staff can update courses'}, status=403)
            if course.instructor != staff:
                return JsonResponse({'success': False, 'message': 'You do not have permission to update this course'}, status=403)
            data = json.loads(request.body)
            # Update fields
            if 'title' in data:
                course.title = data['title']
            if 'description' in data:
                course.description = data['description']
            if 'price' in data:
                course.price = data['price']
            if 'level' in data:
                course.level = data['level']
            if 'category' in data:
                course.category = data['category']
            if 'is_published' in data:
                course.is_published = data['is_published']
            if 'is_featured' in data:
                course.is_featured = data['is_featured']
            if 'is_active' in data:
                course.is_active = data['is_active']
            course.save()
            # Update requirements if provided
            if 'requirements' in data:
                # Clear existing requirements
                course.requirements.all().delete()
                
                # Add new requirements
                for i, req_text in enumerate(data['requirements']):
                    if req_text and req_text.strip():  # Only add non-empty requirements
                        Requirement.objects.create(
                            course=course,
                            text=req_text,
                            order=i
                        )
            
            # Update learning objectives if provided
            if 'objectives' in data:
                # Clear existing objectives
                course.objectives.all().delete()
                
                # Add new objectives
                for i, obj_text in enumerate(data['objectives']):
                    if obj_text and obj_text.strip():  # Only add non-empty objectives
                        LearningObjective.objects.create(
                            course=course,
                            text=obj_text,
                            order=i
                        )
                        
            # Update sections and lessons if provided
            if 'sections' in data:
                with transaction.atomic():
                    # Get existing section IDs for cleanup later
                    existing_section_ids = set(course.sections.values_list('id', flat=True))
                    updated_section_ids = set()
                    
                    # Process all sections in the request
                    for section_idx, section_data in enumerate(data['sections']):
                        section_id = section_data.get('id')
                        
                        if section_id and Section.objects.filter(id=section_id, course=course).exists():
                            # Update existing section
                            section = Section.objects.get(id=section_id)
                            section.title = section_data.get('title', section.title)
                            section.order = section_data.get('order', section_idx)
                            section.save()
                            updated_section_ids.add(section.id)
                        else:
                            # Create new section
                            section = Section.objects.create(
                                course=course,
                                title=section_data.get('title', f"Section {section_idx + 1}"),
                                order=section_data.get('order', section_idx)
                            )
                            updated_section_ids.add(section.id)
                        
                        # Process lessons within this section
                        if 'lessons' in section_data and section_data['lessons']:
                            # Get existing lesson IDs for cleanup later
                            existing_lesson_ids = set(section.lessons.values_list('id', flat=True))
                            updated_lesson_ids = set()
                            
                            for lesson_idx, lesson_data in enumerate(section_data['lessons']):
                                lesson_id = lesson_data.get('id')
                                
                                if lesson_id and Lesson.objects.filter(id=lesson_id, section=section).exists():
                                    # Update existing lesson
                                    lesson = Lesson.objects.get(id=lesson_id)
                                    lesson.title = lesson_data.get('title', lesson.title)
                                    lesson.type = lesson_data.get('type', lesson.type)
                                    lesson.content = lesson_data.get('content', lesson.content)
                                    lesson.duration = lesson_data.get('duration', lesson.duration)
                                    lesson.is_published = lesson_data.get('is_published', lesson.is_published)
                                    lesson.order = lesson_data.get('order', lesson_idx)
                                    lesson.save()
                                    updated_lesson_ids.add(lesson.id)
                                else:
                                    # Create new lesson
                                    lesson = Lesson.objects.create(
                                        section=section,
                                        title=lesson_data.get('title', f"Lesson {lesson_idx + 1}"),
                                        type=lesson_data.get('type', 'video'),
                                        content=lesson_data.get('content', ''),
                                        duration=lesson_data.get('duration', '00:00'),
                                        is_published=lesson_data.get('is_published', False),
                                        order=lesson_data.get('order', lesson_idx)
                                    )
                                    updated_lesson_ids.add(lesson.id)
                            
                            # Remove lessons that are no longer in the data
                            lessons_to_delete = existing_lesson_ids - updated_lesson_ids
                            if lessons_to_delete:
                                Lesson.objects.filter(id__in=lessons_to_delete).delete()
                    
                    # Remove sections that are no longer in the data
                    sections_to_delete = existing_section_ids - updated_section_ids
                    if sections_to_delete:
                        Section.objects.filter(id__in=sections_to_delete).delete()
            
            
            # Get updated course data with sections
            course_data = self._get_detailed_course_data(request, course)
            
            return JsonResponse({
                'success': True,
                'message': 'Course updated successfully',
                'data': course_data
            })
            
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def delete(self, request, course_id):
        """Delete a specific course (soft delete)"""
        user = request.user
        try:
            course = Course.objects.get(id=course_id)
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Only staff can delete courses'}, status=403)
            if course.instructor != staff:
                return JsonResponse({'success': False, 'message': 'You do not have permission to delete this course'}, status=403)
            course.is_active = False
            course.save()
            return JsonResponse({'success': True, 'message': 'Course deleted successfully'})
        except Course.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Course not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
    def _get_detailed_course_data(self, request, course):
        """Helper method to get detailed course data including sections and lessons"""
        # Collect sections and lessons
        sections_data = []
        for section in course.sections.all().order_by('order'):
            lessons_data = []
            for lesson in section.lessons.all().order_by('order'):
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'is_published': lesson.is_published,
                    'content': lesson.content if lesson.type == 'article' else None,
                    'video_url': request.build_absolute_uri(lesson.video.url) if lesson.video else None,
                    'order': lesson.order
                }
                lessons_data.append(lesson_data)
            
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
        
        
       
        return {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'instructor': {
                'id': course.instructor.staff_id,
                'name': course.instructor.user.first_name,
                'email': course.instructor.user.email
            },
            'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
            'price': float(course.price),
            'level': course.level,
            'category': course.category,
            'is_published': course.is_published,
            'is_featured': course.is_featured,
            'total_students': course.total_students,
            'total_lessons': course.total_lessons,
            'total_duration': course.total_duration,
            'sections': sections_data,
            'requirements': requirements_data,
            'objectives': objectives_data,
            'resources': [],
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat()
        }


@method_decorator(csrf_exempt, name='dispatch')
class CourseThumbnailUploadView(View):
    """
    View for uploading or updating course thumbnail
    """
    def post(self, request, course_id):
        user = request.user
        
        try:
            # Get course and verify ownership
            course = Course.objects.get(id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this course'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Check if thumbnail is provided
            if 'thumbnail' not in request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'No thumbnail file provided'
                }, status=400)
            
            thumbnail = request.FILES['thumbnail']
            
            # Delete old thumbnail if exists
            if course.thumbnail:
                if os.path.isfile(course.thumbnail.path):
                    os.remove(course.thumbnail.path)
            
            # Save new thumbnail
            course.thumbnail = thumbnail
            course.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Thumbnail updated successfully',
                'data': {
                    'thumbnail_url': request.build_absolute_uri(course.thumbnail.url)
                }
            })
            
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class SectionView(View):
    """
    View for creating, updating, and deleting course sections
    """
    def post(self, request, course_id):
        """Create a new section for a course"""
        user = request.user
        
        try:
            # Get course and verify ownership
            course = Course.objects.get(id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this course'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Process section data
            data = json.loads(request.body)
            title = data.get('title')
            order = data.get('order', 0)
            
            if not title:
                return JsonResponse({
                    'success': False,
                    'message': 'Section title is required'
                }, status=400)
            
            # Create the section
            section = Section.objects.create(
                title=title,
                course=course,
                order=order
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Section created successfully',
                'data': {
                    'id': section.id,
                    'title': section.title,
                    'order': section.order
                }
            }, status=201)
            
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request, course_id, section_id):
        """Update a specific section"""
        user = request.user
        
        try:
            # Get section and verify ownership
            section = Section.objects.get(id=section_id, course_id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != section.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this section'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Process section data
            data = json.loads(request.body)
            
            # Update section information
            if 'title' in data:
                section.title = data['title']
                
            if 'order' in data:
                section.order = data['order']
            
            # Save section changes
            section.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Section updated successfully',
                'data': {
                    'id': section.id,
                    'title': section.title,
                    'order': section.order
                }
            })
            
        except Section.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Section not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def delete(self, request, course_id, section_id):
        """Delete a specific section"""
        user = request.user
        
        try:
            # Get section and verify ownership
            section = Section.objects.get(id=section_id, course_id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != section.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to delete this section'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Delete the section
            section.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Section deleted successfully'
            })
            
        except Section.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Section not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class LessonView(View):
    """
    View for creating, updating, and deleting course lessons
    """
    def post(self, request, course_id, section_id):
        """Create a new lesson in a section"""
        user = request.user
        
        try:
            # Get section and verify ownership
            section = Section.objects.get(id=section_id, course_id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != section.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this course'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Process lesson data from multipart form
            title = request.POST.get('title')
            lesson_type = request.POST.get('type', 'video')
            order = request.POST.get('order', 0)
            content = request.POST.get('content', '')  # For article type
            is_published = request.POST.get('is_published', 'false').lower() == 'true'
            
            if not title:
                return JsonResponse({
                    'success': False,
                    'message': 'Lesson title is required'
                }, status=400)
            
            # Create the lesson
            lesson = Lesson.objects.create(
                title=title,
                section=section,
                type=lesson_type,
                content=content,
                is_published=is_published,
                order=order
            )
            
            # Handle video upload if provided
            video_file = request.FILES.get('video')
            if video_file and lesson_type == 'video':
                lesson.video = video_file
                
                # Handle duration if provided
                duration = request.POST.get('duration')
                if duration:
                    lesson.duration = duration
                    
                lesson.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Lesson created successfully',
                'data': {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'is_published': lesson.is_published,
                    'order': lesson.order
                }
            }, status=201)
            
        except Section.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Section not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request, course_id, section_id, lesson_id):
        """Update a specific lesson"""
        user = request.user
        
        try:
            # Get lesson and verify ownership
            lesson = Lesson.objects.get(id=lesson_id, section_id=section_id, section__course_id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != lesson.section.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this lesson'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Process data in a format suitable for both JSON and form data
            is_multipart = request.content_type and 'multipart/form-data' in request.content_type
            
            if is_multipart:
                # Handle multipart form data
                if 'title' in request.POST:
                    lesson.title = request.POST['title']
                    
                if 'type' in request.POST:
                    lesson.type = request.POST['type']
                    
                if 'content' in request.POST and lesson.type == 'article':
                    lesson.content = request.POST['content']
                    
                if 'is_published' in request.POST:
                    lesson.is_published = request.POST['is_published'].lower() == 'true'
                    
                if 'order' in request.POST:
                    lesson.order = int(request.POST['order'])
                    
                if 'duration' in request.POST:
                    lesson.duration = request.POST['duration']
                    
                # Handle video upload if provided
                video_file = request.FILES.get('video')
                if video_file and lesson.type == 'video':
                    # Delete old video if exists
                    if lesson.video:
                        if os.path.isfile(lesson.video.path):
                            os.remove(lesson.video.path)
                    
                    # Save new video
                    lesson.video = video_file
            else:
                # Handle JSON data
                data = json.loads(request.body)
                
                if 'title' in data:
                    lesson.title = data['title']
                    
                if 'type' in data:
                    lesson.type = data['type']
                    
                if 'content' in data and lesson.type == 'article':
                    lesson.content = data['content']
                    
                if 'is_published' in data:
                    lesson.is_published = data['is_published']
                    
                if 'order' in data:
                    lesson.order = data['order']
                    
                if 'duration' in data:
                    lesson.duration = data['duration']
            
            # Save lesson changes
            lesson.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Lesson updated successfully',
                'data': {
                    'id': lesson.id,
                    'title': lesson.title,
                    'type': lesson.type,
                    'duration': lesson.duration,
                    'is_published': lesson.is_published,
                    'order': lesson.order
                }
            })
            
        except Lesson.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Lesson not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def delete(self, request, course_id, section_id, lesson_id):
        """Delete a specific lesson"""
        user = request.user
        
        try:
            # Get lesson and verify ownership
            lesson = Lesson.objects.get(id=lesson_id, section_id=section_id, section__course_id=course_id)
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != lesson.section.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to delete this lesson'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Delete video file if exists
            if lesson.video:
                if os.path.isfile(lesson.video.path):
                    os.remove(lesson.video.path)
            
            # Delete the lesson
            lesson.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Lesson deleted successfully'
            })
            
        except Lesson.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Lesson not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class LessonVideoUploadView(View):
    """
    View for uploading or updating lesson video
    """
    def post(self, request, course_id, section_id, lesson_id):
        user = request.user
        
        try:
            # Get lesson and verify ownership
            lesson = Lesson.objects.get(id=lesson_id, section_id=section_id, section__course_id=course_id)
            course = lesson.section.course
            
            try:
                staff = Staff.objects.get(user=user)
                if staff.id != course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to update this lesson'
                    }, status=403)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only staff members can update courses'
                }, status=403)
            
            # Check if lesson type is video
            if lesson.type != 'video':
                return JsonResponse({
                    'success': False,
                    'message': 'Cannot upload video for non-video lesson'
                }, status=400)
            
            # Check if video is provided
            if 'video' not in request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'No video file provided'
                }, status=400)
            
            video_file = request.FILES['video']
            
            # Delete old video if exists
            if lesson.video:
                if os.path.isfile(lesson.video.path):
                    os.remove(lesson.video.path)
            
            # Save new video
            lesson.video = video_file
            
            # Handle duration if provided
            duration = request.POST.get('duration')
            if duration:
                lesson.duration = duration
                
            lesson.save()
            
            # Calculate the updated total duration for the course
            total_duration = course.total_duration
            
            return JsonResponse({
                'success': True,
                'message': 'Video uploaded successfully',
                'data': {
                    'video_url': request.build_absolute_uri(lesson.video.url),
                    'duration': lesson.duration,
                    'course_total_duration': total_duration
                }
            })
            
        except Lesson.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Lesson not found'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CourseViewingView(View):
    """
    View for providing optimized course viewing experience, including video details
    """
    def get(self, request, course_id):
        """
        Get complete details of a course with optimized video rendering support
        and user-specific data like progress and permissions
        """
        # Use our utility function that handles all the details
        status_code, response_data = get_course_with_details(request, course_id)
        return JsonResponse(response_data, status=status_code)


@method_decorator(csrf_exempt, name='dispatch')
class LessonDetailView(View):
    """
    View for accessing individual lesson details with proper video configuration
    """
    def get(self, request, lesson_id):
        """
        Get complete details of a specific lesson with optimized video rendering
        """
        status_code, response_data = get_lesson_details(request, lesson_id)
        return JsonResponse(response_data, status=status_code)
    
    def post(self, request, lesson_id):
        """
        Mark a lesson as complete or incomplete
        """
        try:
            data = json.loads(request.body)
            is_completed = data.get('completed', True)
            
            status_code, response_data = mark_lesson_progress(
                request, lesson_id, is_completed=is_completed
            )
            return JsonResponse(response_data, status=status_code)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        


@method_decorator(csrf_exempt, name='dispatch')
class MyCourseDetailsView(View):
    """
    View for accessing the details of a user's enrolled courses
    """
    def get(self, request):
        """
        Get details of all courses the user is enrolled in
        """
        user = request.user
        
        try:
            student = Student.objects.get(user=user)
             
            enrollments = Enrollment.objects.filter(student=student)
            
            courses_data = []
            for enrollment in enrollments:
                course = enrollment.course
                course_data = {
                    'id': course.id,
                    'title': course.title,
                    'description': course.short_description or course.description[:150] + '...' if len(course.description) > 150 else course.description,
                    'instructor': {
                        'id': course.instructor.staff_id,
                        'name': f"{course.instructor.user.first_name} {course.instructor.user.last_name}".strip(),
                    },
                    'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                    'level': course.level,
                    'category': course.category,
                    'enrollment_date': enrollment.enrolled_at.isoformat(),
                    'progress': enrollment.progress,
                    'completed': enrollment.completed,
                }
                courses_data.append(course_data)
             
            favorite_courses = FavoriteCourse.objects.filter(user=user)
            
            favorites_data = []
            for favorite in favorite_courses:
                course = favorite.course
                favorite_data = {
                    'id': favorite.id,
                    'course_id': course.id,
                    'title': course.title,
                    'description': course.short_description or course.description[:150] + '...' if len(course.description) > 150 else course.description,
                    'instructor': {
                        'id': course.instructor.staff_id,
                        'name': f"{course.instructor.user.first_name} {course.instructor.user.last_name}".strip(),
                    },
                    'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                    'level': course.level,
                    'category': course.category,
                    'created_at': favorite.created_at.isoformat(),
                }
                favorites_data.append(favorite_data)
             
            from django.db.models import Count, Q, F
             
            courses_with_progress = Course.objects.filter(
                sections__lessons__progress_records__student=student,
            ).distinct()
            
            completed_courses_data = []
            for course in courses_with_progress: 
                total_lessons = Lesson.objects.filter(
                    section__course=course, 
                    is_published=True
                ).count()
                 
                completed_lessons = LessonProgress.objects.filter(
                    student=student,
                    lesson__section__course=course,
                    is_completed=True
                ).count()
                 
                completion_percentage = 0
                if total_lessons > 0:
                    completion_percentage = (completed_lessons / total_lessons) * 100
                
                is_completed = (completed_lessons == total_lessons) and (total_lessons > 0)
                
                if completed_lessons > 0:
                    course_data = {
                        'id': course.id,
                        'title': course.title,
                        'description': course.short_description or course.description[:150] + '...' if len(course.description) > 150 else course.description,
                        'instructor': {
                            'id': course.instructor.staff_id,
                            'name': f"{course.instructor.user.first_name} {course.instructor.user.last_name}".strip(),
                        },
                        'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                        'level': course.level,
                        'category': course.category,
                        'progress': round(completion_percentage, 1),
                        'completed': is_completed,
                        'total_lessons': total_lessons,
                        'completed_lessons': completed_lessons,
                    }
                    completed_courses_data.append(course_data)
              
            return JsonResponse({
                'success': True,
                'data': {
                    'courses': courses_data,
                    'favorites': favorites_data,
                    'completed_courses': completed_courses_data
                }
            })
            
        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Student profile not found'
            }, status=404)
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class MyCertificatesView(View):
    def get(self, request):
        user = request.user
        
        try:
            student = Student.objects.get(user=user)
             
            courses_with_progress = Course.objects.filter(
                sections__lessons__progress_records__student=student,
            ).distinct()
            
            completed_courses_data = []
            for course in courses_with_progress: 
                total_lessons = Lesson.objects.filter(
                    section__course=course, 
                    is_published=True
                ).count()
                 
                completed_lessons = LessonProgress.objects.filter(
                    student=student,
                    lesson__section__course=course,
                    is_completed=True
                ).count()
                 
                completion_percentage = 0
                if total_lessons > 0:
                    completion_percentage = (completed_lessons / total_lessons) * 100
                
                is_completed = (completed_lessons == total_lessons) and (total_lessons > 0)
                
                if completed_lessons > 0:
                    course_data = {
                        'id': course.id,
                        'title': course.title,
                        'description': course.short_description or course.description[:150] + '...' if len(course.description) > 150 else course.description,
                        'instructor': {
                            'id': course.instructor.staff_id,
                            'name': f"{course.instructor.user.first_name} {course.instructor.user.last_name}".strip(),
                        },
                        'thumbnail': request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
                        'level': course.level,
                        'category': course.category,
                        'progress': round(completion_percentage, 1),
                        'completed': is_completed,
                        'total_lessons': total_lessons,
                        'completed_lessons': completed_lessons,
                    }
                    completed_courses_data.append(course_data)

            return JsonResponse({
                'success': True,
                'data': completed_courses_data
            })
            
        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Student profile not found'
            }, status=404)
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
        
    def post(self, request):
        user = request.user
        data = json.loads(request.body)
        course_id = data.get('course_id')
        print(user, "😎")
        print(course_id, "😍")

        try:
            student = Student.objects.get(user=user)
            course = Course.objects.get(id=course_id)

            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)

            p.setFont("Helvetica-Bold", 24)
            p.drawCentredString(300, 700, "Certificate of Completion")

            p.setFont("Helvetica", 16)
            p.drawCentredString(300, 650, f"This certifies that {user.get_full_name()}")

            p.setFont("Helvetica", 16)
            p.drawCentredString(300, 600, f"has successfully completed the course")

            p.setFont("Helvetica-Bold", 18)
            p.drawCentredString(300, 550, f"{course.title}")

            p.setFont("Helvetica", 14)
            p.drawCentredString(300, 500, f"Instructor: {course.instructor.user.get_full_name()}")

            p.setFont("Helvetica", 12)
            p.drawCentredString(300, 450, f"Issued on: {datetime.now().strftime('%Y-%m-%d')}")

            p.showPage()
            p.save()

            buffer.seek(0)
            return HttpResponse(buffer, content_type='application/pdf')

        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Student profile not found'
            }, status=404)
        except Course.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Course not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)



