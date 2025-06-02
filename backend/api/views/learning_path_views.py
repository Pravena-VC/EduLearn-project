import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction

from api.models import Student, LearningPath
from api.utils.jwt_utils import verify_token

@method_decorator(csrf_exempt, name='dispatch')
class LearningPathView(View):
    """
    View for creating and managing personalized learning paths
    """
    def get(self, request):
        """
        Get all learning paths for the authenticated student
        """
        user = request.user
        
        try:
            student = Student.objects.get(user=user)
            learning_paths = LearningPath.objects.filter(student=student)
            
            paths_data = []
            for path in learning_paths:
                paths_data.append({
                    'id': path.id,
                    'title': path.title or f"Learning Path {path.id}",
                    'created_at': path.created_at.isoformat(),
                    'updated_at': path.updated_at.isoformat(),
                    'learning_goal': path.learning_goal,
                    'is_favorite': path.is_favorite,
                })
            
            return JsonResponse({
                'success': True,
                'data': paths_data
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

    def post(self, request):
        """
        Create a new learning path for the authenticated student
        """
        user = request.user
        
        try:
            data = json.loads(request.body)
            path_data = data.get('path_data')
            learning_goal = data.get('learning_goal')
            background = data.get('background')
            time_commitment = data.get('time_commitment')
            preferred_style = data.get('preferred_style')
            title = data.get('title')
            
            if not path_data:
                return JsonResponse({
                    'success': False,
                    'message': 'Path data is required'
                }, status=400)
            
            student = Student.objects.get(user=user)
            
            # Create learning path
            learning_path = LearningPath.objects.create(
                student=student,
                title=title,
                learning_goal=learning_goal,
                background=background,
                time_commitment=time_commitment,
                preferred_style=preferred_style,
                path_data=path_data
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Learning path created successfully',
                'data': {
                    'id': learning_path.id,
                    'title': learning_path.title or f"Learning Path {learning_path.id}",
                    'created_at': learning_path.created_at.isoformat(),
                    'updated_at': learning_path.updated_at.isoformat(),
                }
            }, status=201)
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

@method_decorator(csrf_exempt, name='dispatch')
class LearningPathDetailView(View):
    """
    View for retrieving, updating, and deleting a specific learning path
    """
    def get(self, request, path_id):
        """
        Get details of a specific learning path
        """
        user = request.user
        
        try:
            student = Student.objects.get(user=user)
            learning_path = LearningPath.objects.get(id=path_id, student=student)
            
            return JsonResponse({
                'success': True,
                'data': {
                    'id': learning_path.id,
                    'title': learning_path.title or f"Learning Path {learning_path.id}",
                    'learning_goal': learning_path.learning_goal,
                    'background': learning_path.background,
                    'time_commitment': learning_path.time_commitment,
                    'preferred_style': learning_path.preferred_style,
                    'path_data': json.loads(learning_path.path_data),
                    'created_at': learning_path.created_at.isoformat(),
                    'updated_at': learning_path.updated_at.isoformat(),
                    'is_favorite': learning_path.is_favorite,
                }
            })
        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User is not registered as a student'
            }, status=403)
        except LearningPath.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Learning path not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def delete(self, request, path_id):
        """
        Delete a specific learning path
        """
        user = request.user
        
        try:
            student = Student.objects.get(user=user)
            learning_path = LearningPath.objects.get(id=path_id, student=student)
            learning_path.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Learning path deleted successfully'
            })
        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User is not registered as a student'
            }, status=403)
        except LearningPath.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Learning path not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request, path_id):
        """
        Update a specific learning path
        """
        user = request.user
        
        try:
            data = json.loads(request.body)
            title = data.get('title')
            is_favorite = data.get('is_favorite')
            
            student = Student.objects.get(user=user)
            learning_path = LearningPath.objects.get(id=path_id, student=student)
            
            # Update fields if provided
            if title is not None:
                learning_path.title = title
            if is_favorite is not None:
                learning_path.is_favorite = is_favorite
                
            learning_path.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Learning path updated successfully',
                'data': {
                    'id': learning_path.id,
                    'title': learning_path.title or f"Learning Path {learning_path.id}",
                    'is_favorite': learning_path.is_favorite,
                    'updated_at': learning_path.updated_at.isoformat(),
                }
            })
        except Student.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User is not registered as a student'
            }, status=403)
        except LearningPath.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Learning path not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)