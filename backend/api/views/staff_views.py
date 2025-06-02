import json
import os
import uuid
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.contrib.auth.models import User

from api.models import Staff
from api.utils.jwt_utils import verify_token


@method_decorator(csrf_exempt, name='dispatch')
class StaffUpdateView(View):
    """
    View for updating staff profile information and profile picture
    """
    def get(self, request):
        """Get staff profile information"""
        user = request.user
        
        try:
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
                
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Staff profile not found'
                }, status=404)
            
            # Get profile data
            profile_data = {
                'staff_id': staff.staff_id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'bio': staff.bio or '',
                'profile_picture': request.build_absolute_uri(staff.profile_picture.url) if staff.profile_picture else None,
                'created_at': staff.created_at.isoformat(),
            }
            
            return JsonResponse({
                'success': True,
                'data': profile_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request):
        """Update staff profile information"""
        user = request.user
        
        try:
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
                
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Staff profile not found'
                }, status=404)
            
            is_multipart = request.content_type and 'multipart/form-data' in request.content_type
            
            with transaction.atomic():
                if is_multipart:
                    if 'bio' in request.POST:
                        staff.bio = request.POST.get('bio')
                    
                    if 'email' in request.POST:
                        user.email = request.POST.get('email')
                    
                    if 'first_name' in request.POST:
                        user.first_name = request.POST.get('first_name')
                    
                    if 'last_name' in request.POST:
                        user.last_name = request.POST.get('last_name')
                    
                    # Handle profile picture upload
                    if 'profile_picture' in request.FILES:
                        # Delete old profile picture if exists
                        if staff.profile_picture:
                            if os.path.isfile(staff.profile_picture.path):
                                os.remove(staff.profile_picture.path)
                         
                        filename = f"{uuid.uuid4()}{os.path.splitext(request.FILES['profile_picture'].name)[1]}"
                        staff.profile_picture.save(filename, request.FILES['profile_picture'], save=True)
                else:
                    # Handle JSON data
                    data = json.loads(request.body)
                    
                    if 'bio' in data:
                        staff.bio = data['bio']
                    
                    if 'email' in data:
                        user.email = data['email']
                    
                    if 'first_name' in data:
                        user.first_name = data['first_name']
                    
                    if 'last_name' in data:
                        user.last_name = data['last_name']
                
                # Save changes
                user.save()
                staff.save()
            
            # Return updated profile data
            profile_data = {
                'staff_id': staff.staff_id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'bio': staff.bio or '',
                'profile_picture': request.build_absolute_uri(staff.profile_picture.url) if staff.profile_picture else None,
            }
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully',
                'data': profile_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class StaffProfilePictureUploadView(View):
    """
    View specifically for uploading or updating staff profile picture
    """
    def post(self, request):
        user = request.user
        
        try:
            if not user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'message': 'Authentication required'
                }, status=401)
                
            try:
                staff = Staff.objects.get(user=user)
            except Staff.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Staff profile not found'
                }, status=404)
            
            # Check if profile picture is provided
            if 'profile_picture' not in request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'No profile picture provided'
                }, status=400)
            
            profile_picture = request.FILES['profile_picture']
            
            # Delete old profile picture if exists
            if staff.profile_picture:
                if os.path.isfile(staff.profile_picture.path):
                    os.remove(staff.profile_picture.path)
            
            # Save new profile picture with a unique name
            filename = f"{uuid.uuid4()}{os.path.splitext(profile_picture.name)[1]}"
            staff.profile_picture.save(filename, profile_picture, save=True)
            
            return JsonResponse({
                'success': True,
                'message': 'Profile picture updated successfully',
                'data': {
                    'profile_picture_url': request.build_absolute_uri(staff.profile_picture.url)
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)