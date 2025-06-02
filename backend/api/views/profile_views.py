import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from api.models import Student
from django.contrib.auth.models import User
from django.core.files.storage import default_storage

@method_decorator(csrf_exempt, name='dispatch')
class StudentProfileView(View):

    @method_decorator(login_required)
    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            profile_data = {
                'email': student.user.email, # email is on User model
                'first_name': student.first_name,
                'last_name': student.last_name,
                'phone_number': student.phone_number,
                'location': student.location,
                'bio': student.bio,
                'skills': student.skills, # Assuming skills is a list
                'website_url': student.website_url,
                'github_url': student.github_url,
                'linkedin_url': student.linkedin_url,
                'twitter_url': student.twitter_url,
                'profile_picture_url': request.build_absolute_uri(student.profile_picture.url) if student.profile_picture else None,
                # Add other fields from Student model as needed
            }
            return JsonResponse({'success': True, 'data': profile_data})
        except Student.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Student profile not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    @method_decorator(login_required)
    def put(self, request):
        try:
            student = Student.objects.get(user=request.user)
            data = json.loads(request.body)

            # Update user's email if provided and different
            if 'email' in data and data['email'] != student.user.email:
                # Check if the new email is already in use by another user
                if User.objects.filter(email=data['email']).exclude(pk=student.user.pk).exists():
                    return JsonResponse({'success': False, 'message': 'Email already in use.'}, status=400)
                student.user.email = data.get('email', student.user.email)
                student.user.username = data.get('email', student.user.username) # Assuming username is email
                student.user.save()


            student.first_name = data.get('first_name', student.first_name)
            student.last_name = data.get('last_name', student.last_name)
            student.email = data.get('email', student.email) # Student model also has email
            student.phone_number = data.get('phone_number', student.phone_number)
            student.location = data.get('location', student.location)
            student.bio = data.get('bio', student.bio)
            student.skills = data.get('skills', student.skills) # Expecting a list
            student.website_url = data.get('website_url', student.website_url)
            student.github_url = data.get('github_url', student.github_url)
            student.linkedin_url = data.get('linkedin_url', student.linkedin_url)
            student.twitter_url = data.get('twitter_url', student.twitter_url)
            
            student.save()

            updated_profile_data = {
                'email': student.user.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'phone_number': student.phone_number,
                'location': student.location,
                'bio': student.bio,
                'skills': student.skills,
                'website_url': student.website_url,
                'github_url': student.github_url,
                'linkedin_url': student.linkedin_url,
                'twitter_url': student.twitter_url,
                'profile_picture_url': request.build_absolute_uri(student.profile_picture.url) if student.profile_picture else None,
            }
            return JsonResponse({'success': True, 'message': 'Profile updated successfully.', 'data': updated_profile_data})
        except Student.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Student profile not found.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class StudentProfilePictureUploadView(View):
    @method_decorator(login_required)
    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            if 'profile_picture' not in request.FILES:
                return JsonResponse({'success': False, 'message': 'No file uploaded.'}, status=400)
            file = request.FILES['profile_picture']
            # Delete old picture if exists
            if student.profile_picture:
                student.profile_picture.delete(save=False)
            student.profile_picture = file
            student.save()
            return JsonResponse({
                'success': True,
                'message': 'Profile picture updated.',
                'data': {
                    'profile_picture_url': request.build_absolute_uri(student.profile_picture.url)
                }
            })
        except Student.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Student profile not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
