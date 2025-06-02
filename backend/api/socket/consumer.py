from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)

# Dictionary to store active WebSocket connections
active_connections = {}

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Debug info
        client_ip = self.scope.get('client', ['unknown', 0])[0]
        path = self.scope.get('path', 'unknown')
        query_string = self.scope.get('query_string', b'').decode()
        
        # Enhanced logging
        logger.info(f"WebSocket connection attempt from {client_ip}")
        logger.info(f"Path: {path}")
        logger.info(f"Query string: {query_string}")
        print(f"[WS] New connection from {client_ip} at {path}")
        print(f"[WS] Active connections before accept: {len(active_connections)} - {list(active_connections.keys())}")
        
        # Always accept the connection - no authentication required
        await self.accept()
        
        # Store connection with temporary ID
        # User identification will happen on login message
        self.user_id = None
        self.connection_time = datetime.now().isoformat()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "WebSocket connection established",
            "timestamp": self.connection_time
        }))
        
        logger.info("WebSocket connection established and accepted")

    async def disconnect(self, close_code):
        # Clean up connection from active connections
        if self.user_id and self.user_id in active_connections:
            del active_connections[self.user_id]
            print(f"[WS] Removed connection for user {self.user_id}")
            
        # Log disconnection for debugging purposes
        print(f"[WS] WebSocket disconnected with code: {close_code}")
        print(f"[WS] Active connections after disconnect: {len(active_connections)} - {list(active_connections.keys())}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')
            
            # Handle login message to associate user with connection
            if message_type == 'login':
                user_id = data.get('user_id')
                if user_id:
                    # Store the user_id in the consumer instance
                    self.user_id = user_id
                    
                    # If user already has a connection, log it and close the old one
                    if user_id in active_connections:
                        print(f"[WS] WARNING: User {user_id} already has an active connection! Will replace it.")
                    
                    # Add to active connections dictionary
                    active_connections[user_id] = self
                    
                    # Log all active connections for debugging
                    logger.info(f"User {user_id} logged in via WebSocket")
                    logger.info(f"Current active connections: {list(active_connections.keys())}")
                    print(f"[WS] User {user_id} connected. Active connections: {len(active_connections)}")
                    print(f"[WS] Connection IDs: {list(active_connections.keys())}")
                    print(f"[WS] Active connections dictionary: {active_connections}")
                    
                    # Confirm login connection
                    await self.send(text_data=json.dumps({
                        "type": "login_confirmed",
                        "message": "Login connection successful",
                        "user_id": user_id
                    }))
                else:
                    logger.warning("Login attempt with missing user_id")
                    await self.send(text_data=json.dumps({
                        "type": "error",
                        "message": "Missing user_id in login message"
                    }))
            
            # Handle ping/heartbeat to keep connection alive
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }))
                
            # Notification message handling
            elif message_type == 'notification':
                # Handle notification messages
                recipient_id = data.get('recipient_id')
                notification_data = data.get('notification_data')
                
                if recipient_id and recipient_id in active_connections:
                    # Forward notification to the recipient
                    recipient_connection = active_connections[recipient_id]
                    await recipient_connection.send(text_data=json.dumps({
                        "type": "notification",
                        "data": notification_data
                    }))
                    
                    # Send acknowledgement back to sender
                    await self.send(text_data=json.dumps({
                        "type": "notification_delivered",
                        "recipient_id": recipient_id
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        "type": "notification_pending",
                        "message": "User not connected, notification will be delivered when they reconnect",
                        "recipient_id": recipient_id
                    }))
            
            # Generic message handling
            else:
                await self.send(text_data=json.dumps({
                    "type": "acknowledgment",
                    "message": "Message received",
                    "received_type": message_type
                }))
                
        except json.JSONDecodeError:
            # Handle invalid JSON
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))
        except Exception as e:
            # General error handling
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": str(e)
            }))

