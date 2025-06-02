from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from api.socket.consumer import active_connections

@method_decorator(csrf_exempt, name='dispatch')
class WebSocketDebugView(View):
    """Debug view to check active WebSocket connections"""
    
    def get(self, request):
        """Return information about active WebSocket connections"""
        # Only allow in development
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({
                'success': False,
                'message': 'Not authorized'
            }, status=403)
        
        connections = []
        for user_id, connection in active_connections.items():
            connections.append({
                'user_id': user_id,
                'connected_since': getattr(connection, 'connection_time', 'unknown')
            })
        
        return JsonResponse({
            'success': True,
            'active_connections': len(active_connections),
            'connections': connections
        })
