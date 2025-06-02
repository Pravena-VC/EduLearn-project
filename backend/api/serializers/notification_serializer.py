from rest_framework import serializers
from api.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 
                  'created_at', 'related_item_id', 'related_item_type', 
                  'sender_name', 'sender_profile_picture']
    
    def get_sender_name(self, obj):
        if obj.sender_staff:
            return obj.sender_staff.name
        elif obj.sender_student:
            return obj.sender_student.name
        return "System"
    
    def get_sender_profile_picture(self, obj):
        request = self.context.get('request')
        if not request:
            return None
            
        if obj.sender_staff and obj.sender_staff.profile_picture:
            return request.build_absolute_uri(obj.sender_staff.profile_picture.url)
        elif obj.sender_student and obj.sender_student.profile_picture:
            return request.build_absolute_uri(obj.sender_student.profile_picture.url)
        return None
