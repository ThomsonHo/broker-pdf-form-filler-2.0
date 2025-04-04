from django.utils import timezone
from django.urls import resolve
from ..models import UserActivity


class UserActivityMiddleware:
    """Middleware to track user activity."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Process request before view is called
        response = self.get_response(request)
        
        # Track user activity after view is called
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                # Get the resolved URL match
                resolver_match = resolve(request.path)
                view_name = resolver_match.view_name if resolver_match else 'unknown'
                
                # Skip tracking for certain views
                if not view_name.startswith(('admin:', 'static:', 'media:')):
                    UserActivity.objects.create(
                        user=request.user,
                        action=f'{request.method.lower()}_{view_name}',
                        ip_address=self._get_client_ip(request),
                        timestamp=timezone.now()
                    )
            except Exception:
                # Log error but don't interrupt request processing
                pass
        
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """Process the view and log login/logout activities."""
        # Skip tracking for non-authenticated users except for login
        if not request.user.is_authenticated and not (
            hasattr(view_func, '__name__') and view_func.__name__ == 'LoginView'
        ):
            return None
            
        # Track login activity
        if hasattr(view_func, '__name__') and view_func.__name__ == 'LoginView' and request.method == 'POST':
            # The actual login tracking happens in the login view
            # This is just a placeholder for any pre-login tracking if needed
            pass
            
        # Track logout activity
        elif hasattr(view_func, '__name__') and view_func.__name__ == 'LogoutView' and request.user.is_authenticated:
            UserActivity.objects.create(
                user=request.user,
                action='logout',
                ip_address=self._get_client_ip(request),
                timestamp=timezone.now()
            )
            
        return None
        
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip