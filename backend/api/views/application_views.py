import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction

from api.models import CourseApplication, Course, Student


@method_decorator(csrf_exempt, name='dispatch')
class CourseApplicationView(View):
    """
    View for handling course applications
    """
    def post(self, request):
        """Create a new application"""
        user = request.user
        
        if not user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            data = json.loads(request.body)
            course_id = data.get('course_id')
            message = data.get('message', '')
            
            if not course_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Course ID is required'
                }, status=400)
            
            # Verify the course exists
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Course not found'
                }, status=404)
             
            try:
                student = Student.objects.get(user=user)
            except Student.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not registered as a student'
                }, status=403)
             
            if CourseApplication.objects.filter(student=student, course=course).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'You have already applied to this course'
                }, status=400)
             
            with transaction.atomic():
                application = CourseApplication.objects.create(
                    student=student,
                    course=course,
                    message=message,
                    status='pending'
                )
            
            return JsonResponse({
                'success': True,
                'message': 'Application submitted successfully',
                'data': {
                    'id': application.id,
                    'status': application.status,
                    'created_at': application.created_at.isoformat()
                }
            }, status=201)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def get(self, request):
        """Get all applications for the current user"""
        user = request.user
        
        if not user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            # Get the student profile
            try:
                student = Student.objects.get(user=user)
                
                # Fetch all applications for the student
                applications = CourseApplication.objects.filter(student=student)
                
                applications_data = []
                for application in applications:
                    applications_data.append({
                        'id': application.id,
                        'course': {
                            'id': application.course.id,
                            'title': application.course.title,
                            'thumbnail': request.build_absolute_uri(application.course.thumbnail.url) if application.course.thumbnail else None,
                        },
                        'status': application.status,
                        'message': application.message,
                        'created_at': application.created_at.isoformat(),
                        'updated_at': application.updated_at.isoformat()
                    })
                
                return JsonResponse({
                    'success': True,
                    'data': applications_data
                })
                
            except Student.DoesNotExist:
                # Check if user is an instructor
                try:
                    from api.models import Staff
                    staff = Staff.objects.get(user=user)
                    
                    # Instructors can view applications for their courses
                    applications = CourseApplication.objects.filter(course__instructor=staff)
                    
                    applications_data = []
                    for application in applications:
                        applications_data.append({
                            'id': application.id,
                            'course': {
                                'id': application.course.id,
                                'title': application.course.title,
                            },
                            'student': {
                                'id': application.student.id,
                                'name': f"{application.student.first_name} {application.student.last_name}" if application.student.first_name else application.student.user.username,
                                'email': application.student.email
                            },
                            'status': application.status,
                            'message': application.message,
                            'created_at': application.created_at.isoformat(),
                            'updated_at': application.updated_at.isoformat()
                        })
                    
                    return JsonResponse({
                        'success': True,
                        'data': applications_data
                    })
                    
                except:
                    return JsonResponse({
                        'success': False,
                        'message': 'User is not registered as a student or instructor'
                    }, status=403)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ManageApplicationView(View):
    """
    View for instructors to approve or reject applications
    """
    def put(self, request, application_id):
        user = request.user
        
        if not user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            data = json.loads(request.body)
            status = data.get('status')
            
            if not status or status not in ['approved', 'rejected']:
                return JsonResponse({
                    'success': False,
                    'message': 'Valid status (approved/rejected) is required'
                }, status=400)
            
            # Get the application
            try:
                application = CourseApplication.objects.get(id=application_id)
            except CourseApplication.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Application not found'
                }, status=404)
            
            # Check if user is the instructor of the course
            try:
                from api.models import Staff, Enrollment
                staff = Staff.objects.get(user=user)
                
                if staff.id != application.course.instructor.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to manage this application'
                    }, status=403)
                
                with transaction.atomic():
                    # Update application status
                    application.status = status
                    application.save()
                    
                    # If approved, create enrollment
                    if status == 'approved':
                        # Create enrollment if it doesn't exist
                        enrollment, created = Enrollment.objects.get_or_create(
                            course=application.course,
                            student=application.student,
                            defaults={
                                'progress': 0,
                                'completed': False
                            }
                        )
                        
                        # If enrollment already existed, update the message in the response
                        enrollment_message = 'Student enrolled successfully' if created else 'Student was already enrolled'
                
                return JsonResponse({
                    'success': True,
                    'message': f'Application {status}' + (f' and {enrollment_message.lower()}' if status == 'approved' else ''),
                    'data': {
                        'id': application.id,
                        'status': application.status,
                        'enrollment_created': created if status == 'approved' else None
                    }
                })
                
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'message': f'Error managing application: {str(e)}'
                }, status=403)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    def delete(self, request, application_id):
        """Cancel/delete application (only by student who applied)"""
        user = request.user
        
        if not user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            # Get the application
            try:
                application = CourseApplication.objects.get(id=application_id)
            except CourseApplication.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Application not found'
                }, status=404)
            
            # Check if user is the student who applied
            try:
                student = Student.objects.get(user=user)
                
                if student.id != application.student.id:
                    return JsonResponse({
                        'success': False,
                        'message': 'You do not have permission to cancel this application'
                    }, status=403)
                
                # Delete the application
                application.delete()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Application cancelled successfully'
                })
                
            except Student.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not registered as a student'
                }, status=403)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)