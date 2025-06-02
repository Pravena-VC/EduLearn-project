import json
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from api.models.blog import Blog
from django.contrib.auth.decorators import login_required

@method_decorator(csrf_exempt, name='dispatch')
class BlogListCreateView(View):
    def get(self, request):
        blogs = Blog.objects.select_related('author').all().order_by('-created_at')
        data = [
            {
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at,
                'author': blog.author.id if blog.author else None,
                'author_username': blog.author.username if blog.author else None,
            }
            for blog in blogs
        ]
        return JsonResponse(data, safe=False)

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            if not title or not content:
                return JsonResponse({'detail': 'Title and content are required.'}, status=400)
            blog = Blog.objects.create(
                title=title,
                content=content,
                author=request.user
            )
            return JsonResponse({
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at,
                'author': blog.author.id,
                'author_username': blog.author.username,
            }, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class BlogDetailView(View):
    def get(self, request, pk):
        try:
            blog = Blog.objects.select_related('author').get(pk=pk)
            data = {
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at,
                'author': blog.author.id if blog.author else None,
                'author_username': blog.author.username if blog.author else None,
            }
            return JsonResponse(data, safe=False)
        except Blog.DoesNotExist:
            return JsonResponse({'detail': 'Not found'}, status=404)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication required'}, status=401)
        try:
            blog = Blog.objects.get(pk=pk)
            if blog.author != request.user:
                return JsonResponse({'detail': 'Not allowed.'}, status=403)
            blog.delete()
            return JsonResponse({'detail': 'Deleted'})
        except Blog.DoesNotExist:
            return JsonResponse({'detail': 'Not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class MyBlogsView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication required'}, status=401)
        blogs = Blog.objects.filter(author=request.user).order_by('-created_at')
        data = [
            {
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'created_at': blog.created_at,
                'author': blog.author.id if blog.author else None,
                'author_username': blog.author.username if blog.author else None,
            }
            for blog in blogs
        ]
        return JsonResponse(data, safe=False)
