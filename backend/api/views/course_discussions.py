import json
import os
from datetime import datetime
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from pathlib import Path
import uuid
from django.contrib.auth.models import User
from api.models import Student
from api.models import Course
from api.utils.notification_utils import create_comment_notification


DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / 'data'
COMMENTS_FILE = DATA_DIR / 'comments.json'

os.makedirs(DATA_DIR, exist_ok=True)

def load_comments():
    if not COMMENTS_FILE.exists():
        return {}
    try:
        with open(COMMENTS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_comments(comments):
    with open(COMMENTS_FILE, 'w') as f:
        json.dump(comments, f, indent=2)

@method_decorator(csrf_exempt, name='dispatch')
class CourseCommentsView(View):
    """
    View for managing course comments
    """
    
    def get(self, request, course_id=None, comment_id=None):
        """
        Get all comments for a course or a specific comment
        """
        comments = load_comments()
        
        if comment_id:
            for course_comments in comments.values():
                for comment in course_comments:
                    if comment['id'] == comment_id:
                        # Ensure replies key exists and is a list
                        if 'replies' not in comment:
                            comment['replies'] = []
                        return JsonResponse(comment, status=200)
            return JsonResponse({'error': 'Comment not found'}, status=404)
        
        course_id = str(course_id)
        course_comments = comments.get(course_id, [])
        # Ensure replies key exists for all comments
        for comment in course_comments:
            if 'replies' not in comment:
                comment['replies'] = []
        return JsonResponse({'comments': course_comments}, status=200)
    
    def post(self, request, course_id):
        """
        Add a new comment to a course
        """ 
        try:
            data = json.loads(request.body)
            content = data.get('content')

            user = request.user
            
            if not all([content]):
                return JsonResponse(
                    {'error': 'content is required'}, 
                    status=400
                )
            
            comments = load_comments()
            course_id = str(course_id)
            
            if course_id not in comments:
                comments[course_id] = []

            user_details = User.objects.get(username=user.username)
            student_details = Student.objects.get(user=user_details)
            
            new_comment = {
                'id': str(uuid.uuid4()),
                'student_id': user_details.id, 
                'username': user_details.username,
                'first_name': student_details.first_name,
                'last_name': student_details.last_name,
                'content': content,
                'timestamp': datetime.utcnow().isoformat(),
                'course_id': course_id
            }
            
            comments[course_id].append(new_comment)
            save_comments(comments)
            
             
            course = Course.objects.get(id=course_id)
             
            instructor_id = course.instructor.staff_id if course.instructor else "None"
            print(f"[COMMENT] Creating notification for course {course_id}, instructor ID: {instructor_id}")
            print(f"[COMMENT] Student info - ID: {student_details.id}, Name: {student_details.name if hasattr(student_details, 'name') else 'Unknown'}")
            
            from api.models import Notification
            
            existing_count = Notification.objects.all().count()
            print(f"[DEBUG] Current notification count in database: {existing_count}")
             
            notification = create_comment_notification({
                'course': course,
                'content': content,
                'student': student_details,
                'id': new_comment['id'],
                'staff': None,
                'course_id' : course_id,
            })
            
            if notification:
                print(f"[SUCCESS] Created notification ID: {notification.id} for instructor {instructor_id}")
            else:
                print("[ERROR] Failed to create notification - returned None")
                
            return JsonResponse(new_comment, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse(
                {'error': 'Invalid JSON data'}, 
                status=400
            )
        except Exception as e:
            return JsonResponse(
                {'error': str(e)}, 
                status=500
            )
    
    def delete(self, request, course_id, comment_id):
        """
        Delete a comment
        """
        comments = load_comments()
        course_id = str(course_id)
        
        if course_id not in comments:
            return JsonResponse(
                {'error': 'Course not found'}, 
                status=404
            )
        
        for i, comment in enumerate(comments[course_id]):
            if comment['id'] == comment_id:
                deleted_comment = comments[course_id].pop(i)
                save_comments(comments)
                return JsonResponse(
                    {'message': 'Comment deleted successfully'}, 
                    status=200
                )
        
        return JsonResponse(
            {'error': 'Comment not found'}, 
            status=404
        )