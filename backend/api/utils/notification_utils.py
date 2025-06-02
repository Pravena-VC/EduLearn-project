import json
import logging
from api.models import Notification, Staff
from api.socket.consumer import active_connections

# Set up logging
logger = logging.getLogger(__name__)

def send_notification(user_id, notification_data):
    """
    Send a notification to a user via WebSocket if they are connected
    """
    # Debug connection status
    logger.info(f"Attempting to send notification to user_id: {user_id}")
    logger.info(f"Active connections: {list(active_connections.keys())}")
    
    if user_id in active_connections:
        connection = active_connections[user_id]
        logger.info(f"Found connection for user {user_id}, sending notification")
        async_to_sync = import_async_to_sync()
        try:
            async_to_sync(connection.send)(text_data=json.dumps({
                "type": "notification",
                "data": notification_data
            }))
            logger.info(f"Notification sent successfully to {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False
    else:
        logger.warning(f"User {user_id} not connected, notification will be stored only")
        return False

def import_async_to_sync():
    """Import async_to_sync lazily to avoid circular imports"""
    from asgiref.sync import async_to_sync
    return async_to_sync

def create_course_watch_notification(course, student):
    """
    Create notification for instructor when a student watches their course
    """
    # Get the course instructor
    instructor = course.instructor
    
    if not instructor:
        return None
        
    # Create notification record
    notification = Notification.objects.create(
        recipient_staff=instructor,
        sender_student=student,
        notification_type="course_viewed",
        title=f"Course Viewed",
        message=f"{student.name} has viewed your course: {course.title}",
        related_item_id=course.id,
        related_item_type="course"
    )
    
    # Try to send real-time notification
    notification_data = {
        "id": notification.id,
        "type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "created_at": notification.created_at.isoformat(),
        "related_item_id": notification.related_item_id,
        "related_item_type": notification.related_item_type,
        "sender_name": student.name if student else "Unknown",
        "sender_profile_picture": student.profile_picture.url if student and student.profile_picture else None,
    }
    
    send_notification(str(instructor.staff_id), notification_data)
    return notification

def create_comment_notification(comment_data, recipient_staff=None):
    """
    Create notification for a comment
    comment_data can be either a Comment object or a dictionary with comment data
    """
    logger.info(f"Creating comment notification with data: {comment_data}")
    
    # Handle comment data properly based on its type
    is_dict = isinstance(comment_data, dict)
    
    if not recipient_staff:
        # If no specific staff provided, this is likely a course comment
        # Get the course instructor
        if is_dict:
            course = comment_data.get('course')
            if course:
                recipient_staff = course.instructor
                logger.info(f"Found instructor from course: {recipient_staff}")
        else:
            # Assuming comment is an object with course attribute
            course = getattr(comment_data, 'course', None)
            if course:
                recipient_staff = course.instructor
                logger.info(f"Found instructor from course object: {recipient_staff}")
    
    if not recipient_staff:
        logger.warning("No recipient staff found for notification")
        return None
    
    # Get the sender info (could be student or staff)
    if is_dict:
        sender_student = comment_data.get('student')
        sender_staff = comment_data.get('staff')
        content = comment_data.get('content', '')
        comment_id = comment_data.get('id')
        course = comment_data.get('course')
        course_id = comment_data.get('course_id')
        course_title = course.title if course else 'content'
    else:
        sender_student = getattr(comment_data, 'student', None)
        sender_staff = getattr(comment_data, 'staff', None)
        content = getattr(comment_data, 'content', '')
        course_id = getattr(comment_data, 'course_id', None)
        comment_id = getattr(comment_data, 'id', None)
        course = getattr(comment_data, 'course', None)
        course_title = course.title if course else 'content'
    
    # Log recipient and sender info
    logger.info(f"Notification recipient: {recipient_staff}, Sender student: {sender_student}, Sender staff: {sender_staff}")
    
    try: 
        # Create notification record
        notification = Notification.objects.create(
            recipient_staff=recipient_staff,
            sender_student=sender_student,
            sender_staff=sender_staff,
            notification_type="comment",
            title="New Comment",
            message=f"New comment on {course_title}: {content[:50] + '...' if len(content) > 50 else content}",
            related_item_id=comment_id,
            related_item_type="comment",
            course_id=course,
        ) 
        logger.info(f"Created notification record: {notification.id}")
    except Exception as e:
        logger.error(f"Failed to create notification record: {e}")
        return None
    
    # Prepare data for websocket
    sender_name = "Unknown"
    sender_profile_picture = None
    
    if sender_student:
        sender_name = sender_student.name
        sender_profile_picture = sender_student.profile_picture.url if sender_student.profile_picture else None
    elif sender_staff:
        sender_name = sender_staff.name
        sender_profile_picture = sender_staff.profile_picture.url if sender_staff.profile_picture else None
        
    notification_data = {
        "id": notification.id,
        "type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "created_at": notification.created_at.isoformat(),
        "related_item_id": notification.related_item_id,
        "related_item_type": notification.related_item_type,
        "sender_name": sender_name,
        "sender_profile_picture": sender_profile_picture,
    }
    
    # Try to send real-time notification
    send_notification(str(recipient_staff.staff_id), notification_data)
    return notification
