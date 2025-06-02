import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from api.models import FavoriteCourse


@method_decorator(csrf_exempt, name='dispatch')
class FavoriteCourseView(View):
    def get(self, request):
        """Get all favorite courses for the current user"""
        try:
            user = request.user
            
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
            
            favorite_courses = FavoriteCourse.objects.filter(user=user)
            
            favorites_data = []
            for favorite in favorite_courses:
                favorites_data.append({
                    'id': favorite.id,
                    'course_id': favorite.course.id,
                    'course_title': favorite.course.title,
                    'course_thumbnail': request.build_absolute_uri(favorite.course.thumbnail.url) if favorite.course.thumbnail else None,
                    'course_description': favorite.course.description,
                    'created_at': favorite.created_at.isoformat(),
                })
            
            return JsonResponse({
                'success': True,
                'data': favorites_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            course_id = data.get('course_id')
            user = request.user
            
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
            
            if not course_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Course ID is required'
                }, status=400)
            
            # Check if already in favorites to avoid duplicates
            if FavoriteCourse.objects.filter(course_id=course_id, user=user).exists():
                return JsonResponse({
                    'success': True,
                    'message': 'Course is already in favorites',
                    'data': {
                        'course_id': course_id,
                        'user_id': user.id
                    }
                }, status=200)
            
            with transaction.atomic():
                favorite_course = FavoriteCourse.objects.create(
                    course_id=course_id,
                    user=user
                )
            
            return JsonResponse({
                'success': True,
                'message': 'Course added to favorites successfully',
                'data': {
                    'course_id': course_id,
                    'user_id': user.id
                }
            }, status=201)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

    def delete(self, request):
        try:
            data = json.loads(request.body)
            course_id = data.get('course_id')
            user = request.user
            
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
            
            if not course_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Course ID is required'
                }, status=400)
            
            favorite_course = FavoriteCourse.objects.filter(course_id=course_id, user=user)
            
            if favorite_course.exists():
                favorite_course.delete()
                return JsonResponse({
                    'success': True,
                    'message': 'Course removed from favorites successfully',
                    'data': {
                        'course_id': course_id,
                        'user_id': user.id
                    }
                }, status=200)
            
            return JsonResponse({
                'success': False,
                'message': 'Course not found in favorites'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)