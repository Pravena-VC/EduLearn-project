import json
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction

from api.models import Student, Staff
from api.utils.jwt_utils import generate_access_token, generate_refresh_token, verify_token

@method_decorator(csrf_exempt, name='dispatch')
class StudentRegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
             
            if not all([username, password, email]):
                return JsonResponse({
                    'success': False,
                    'message': 'Username, password are required'
                }, status=400)
                 
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Username already exists'
                }, status=400)
                
            if Student.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)
            
            with transaction.atomic(): 
                user = User.objects.create_user(
                    username=email,
                    password=password,
                    email=email,
                )
                
                student = Student.objects.create(
                    user=user, 
                    email=email,
                )
                
            
            return JsonResponse({
                'success': True,
                'message': 'Student registered successfully',
                'data': {
                    'username': user.username, 
                    'email': user.email,
                },
               
            }, status=201)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class StaffRegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
            last_name = data.get('last_name', '-') 
 
           
             
            if not all([username, password]):
                return JsonResponse({
                    'success': False,
                    'message': 'Username, password are required'
                }, status=400)
                 
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Username already exists'
                }, status=400)
                
            
            
            with transaction.atomic(): 
                user = User.objects.create_user(
                    username=email,
                    password=password,
                    email=email,
                    first_name=username,
                    last_name=last_name
                )
                
                staff = Staff.objects.create(
                    user=user,  
                )
                 
            return JsonResponse({
                'success': True,
                'message': 'Staff registered successfully',
                'data': {
                    'username': user.username,
                    'staff_id': staff.staff_id,  
                    email : user.email,
                },
            }, status=201)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user_type = data.get('user_type', 'student')  
             
            if not all([email, password]):
                return JsonResponse({
                    'success': False,
                    'message': 'Username and password are required'
                }, status=400)
                 
            user = authenticate(username=email, password=password)
            
            if not user:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or password'
                }, status=401)
             
            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)
             
            if user_type.lower() == 'student':
                try:
                    student = Student.objects.get(user=user)
                    return JsonResponse({
                        'success': True,
                        'message': 'Login successful',
                        'data': {
                            'username': student.first_name if student.first_name else user.username,
                            'user_type': 'student',
                            'email': user.email
                        },
                        'tokens': {
                            'access_token': access_token,
                            'refresh_token': refresh_token
                        }
                    })
                except Student.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': 'User is not registered as a student'
                    }, status=403)
            elif user_type.lower() == 'staff':
                try:
                    staff = Staff.objects.get(user=user)
                    return JsonResponse({
                        'success': True,
                        'message': 'Login successful',
                        'data': {
                            'username': user.username,
                            'staff_id': staff.staff_id, 
                            "email" : user.email,
                            'user_type': 'staff'
                        },
                        'tokens': {
                            'access_token': access_token,
                            'refresh_token': refresh_token
                        }
                    })
                except Staff.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'message': 'User is not registered as staff'
                    }, status=403)
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid user type'
                }, status=400)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class TokenRefreshView(View):
    """
    View for refreshing access tokens using a valid refresh token
    """
    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh_token')
            
            if not refresh_token:
                return JsonResponse({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=400)
             
            payload = verify_token(refresh_token)
            if not payload:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid or expired refresh token'
                }, status=401)
             
            if payload.get('token_type') != 'refresh':
                return JsonResponse({
                    'success': False,
                    'message': 'Token is not a refresh token'
                }, status=401) 
            try:
                user = User.objects.get(id=payload['user_id'])
                 
                access_token = generate_access_token(user)
                new_refresh_token = generate_refresh_token(user)
                
                return JsonResponse({
                    'success': True,
                    'message': 'Token refreshed successfully',
                    'tokens': {
                        'access_token': access_token,
                        'refresh_token': new_refresh_token
                    }
                })
            except User.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User not found'
                }, status=401)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)