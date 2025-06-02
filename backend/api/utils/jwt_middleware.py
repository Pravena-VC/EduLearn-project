from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .jwt_utils import verify_token

class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
         
        exempt_paths = [
            '/api/auth/register/student',
            '/api/auth/register/staff',
            '/api/auth/login',
            '/api/auth/refresh',
            '/courses/thumbnails/',
            '/courses/videos/',
            '/profile_pictures/',
            '/static/',
            '/media/',
            '/api/public/courses/',
            '/ws/',
            '/connection/'
            '/ws/connection/',
        ]
 
        
        path = request.path_info

        print(f"Request path: {path}")
         
        if any(path.startswith(exempt) for exempt in exempt_paths):
            return None
        
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'success': False,
                'message': 'Authorization header must start with Bearer'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        
        payload = verify_token(token)
        if not payload:
            return JsonResponse({
                'success': False,
                'message': 'Invalid or expired token'
            }, status=401)
        
        try:
            user = User.objects.get(id=payload['user_id'])
            request.user = user
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'User not found'
            }, status=401)
        
        return None