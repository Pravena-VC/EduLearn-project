import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import uuid
from datetime import datetime
from uuid import UUID

from api.models import Notification, Staff, Student

@method_decorator(csrf_exempt, name='dispatch')
class NotificationListView(View):
    """View for retrieving and managing user notifications"""
    
    def get(self, request):
        """Get notifications for the current user"""
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            # Determine if user is staff or student
            notifications = []
            
            if hasattr(request.user, 'staff'):
                staff = request.user.staff
                notifications = Notification.objects.filter(recipient_staff=staff)
            elif hasattr(request.user, 'student'):
                student = request.user.student
                notifications = Notification.objects.filter(recipient_student=student)
            
            # Prepare notifications data
            notifications_data = []
            for notification in notifications:
                sender_name = "System"
                if notification.sender_staff:
                    sender_name = notification.sender_staff.name
                elif notification.sender_student:
                    sender_name = notification.sender_student.name
                
                sender_image = None
                request_host = request.get_host()
                protocol = "https" if request.is_secure() else "http"
                
                if notification.sender_staff and notification.sender_staff.profile_picture:
                    sender_image = f"{protocol}://{request_host}{notification.sender_staff.profile_picture.url}"
                elif notification.sender_student and notification.sender_student.profile_picture:
                    sender_image = f"{protocol}://{request_host}{notification.sender_student.profile_picture.url}"
                    
                notifications_data.append({
                    'id': notification.id,
                    'type': notification.notification_type,
                    'title': notification.title,
                    'message': notification.message,
                    'is_read': notification.is_read,
                    'created_at': notification.created_at.isoformat(),
                    'related_item_id': notification.related_item_id,
                    'related_item_type': notification.related_item_type,
                    'course_id': notification.course_id.id if notification.course_id else None,
                    'course_title': notification.course_id.title if notification.course_id else None,
                    'sender_name': sender_name,
                    'sender_image': sender_image,
                })
            
            return JsonResponse({
                'success': True,
                'data': notifications_data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    def put(self, request):
        """Mark notifications as read"""
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            data = json.loads(request.body)
            notification_ids = data.get('notification_ids', [])
            
            if not notification_ids:
                return JsonResponse({
                    'success': False,
                    'message': 'No notification IDs provided'
                }, status=400)
            
            # Determine if user is staff or student
            user_filter = {}
            if hasattr(request.user, 'staff'):
                user_filter['recipient_staff'] = request.user.staff
            elif hasattr(request.user, 'student'):
                user_filter['recipient_student'] = request.user.student
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'User is neither staff nor student'
                }, status=403)
            
            # Update notifications
            updated = Notification.objects.filter(
                id__in=notification_ids,
                **user_filter,
                is_read=False
            ).update(is_read=True)
            
            return JsonResponse({
                'success': True,
                'message': f'Marked {updated} notifications as read'
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class NotificationReplyView(View):
    """Allow staff to reply to a notification (e.g., a course discussion comment notification)"""
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            comment_id = data.get('related_item_id') or data.get('comment_id') or data.get('id')
            course_id = data.get('course_id')
            message = data.get('message')
            if not comment_id or not course_id or not message:
                return JsonResponse({'success': False, 'message': 'Missing comment_id, course_id, or message'}, status=400)
            if not hasattr(request.user, 'staff'):
                return JsonResponse({'success': False, 'message': 'Only staff can reply to notifications'}, status=403)
            staff = request.user.staff
            from pathlib import Path
            COMMENTS_FILE = Path(__file__).resolve().parent.parent.parent.parent / 'data' / 'comments.json'
            if not COMMENTS_FILE.exists():
                comments = {}
            else:
                with open(COMMENTS_FILE, 'r') as f:
                    try:
                        comments = json.load(f)
                    except Exception:
                        comments = {}
            course_id_str = str(course_id)
            if course_id_str not in comments:
                return JsonResponse({'success': False, 'message': 'Course not found in comments'}, status=404)
            found = False
            for comment in comments[course_id_str]:
                if str(comment['id']) == str(comment_id):
                    if 'replies' not in comment:
                        comment['replies'] = []
                    comment['replies'].append({
                        'id': str(uuid.uuid4()),
                        'staff_id': staff.staff_id,
                        'staff_name': staff.user.get_full_name() or staff.user.username,
                        'content': message,
                        'timestamp': datetime.utcnow().isoformat(),
                    })
                    found = True
                    break
            if found:
                # Convert any UUIDs in comments to strings before saving
                def convert_uuids(obj):
                    if isinstance(obj, dict):
                        return {k: convert_uuids(v) for k, v in obj.items()}
                    elif isinstance(obj, list):
                        return [convert_uuids(i) for i in obj]
                    elif isinstance(obj, UUID):
                        return str(obj)
                    else:
                        return obj
                comments_to_save = convert_uuids(comments)
                with open(COMMENTS_FILE, 'w') as f:
                    json.dump(comments_to_save, f, indent=2)
                return JsonResponse({'success': True, 'message': 'Reply saved to comment'}, status=200)
            return JsonResponse({'success': False, 'message': 'Comment not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
