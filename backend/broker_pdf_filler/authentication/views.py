from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .serializers import (
    LoginSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordChangeSerializer, LogoutSerializer, TokenRefreshResponseSerializer
)
from broker_pdf_filler.users.models import UserActivity

User = get_user_model()


class LoginView(TokenObtainPairView):
    """Custom login view that includes user data in response."""
    serializer_class = LoginSerializer


class LogoutView(TokenBlacklistView):
    """View for handling user logout."""
    permission_classes = []
    serializer_class = LogoutSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle logout request."""
        try:
            # Track logout activity before blacklisting token
            refresh = RefreshToken(request.data.get('refresh'))
            user = User.objects.get(id=refresh['user_id'])
            
            UserActivity.objects.create(
                user=user,
                action='logout',
                ip_address=self._get_client_ip(request)
            )
            
            # Blacklist the token using parent class
            response = super().post(request, *args, **kwargs)
            
            return Response({"detail": _("Successfully logged out.")})
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TokenRefreshView(TokenRefreshView):
    """Custom token refresh view."""
    serializer_class = TokenRefreshResponseSerializer


class PasswordResetRequestView(views.APIView):
    """View for handling password reset requests."""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle password reset request."""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = self._generate_password_reset_token()
            
            # Store token and expiry in user model
            user.reset_password_token = token
            user.reset_password_token_expiry = timezone.now() + timedelta(hours=24)
            user.save(update_fields=['reset_password_token', 'reset_password_token_expiry'])
            
            # Track password reset request activity
            UserActivity.objects.create(
                user=user,
                action='password_reset_request',
                ip_address=self._get_client_ip(request)
            )
            
            # Send password reset email
            try:
                self._send_password_reset_email(user, token)
            except Exception as e:
                # Log the error but don't expose it to the user
                print(f"Error sending password reset email: {str(e)}")
            
            return Response({"detail": _("Password reset email sent if account exists.")})
        except User.DoesNotExist:
            # Return success even if user doesn't exist for security
            return Response({"detail": _("Password reset email sent if account exists.")})
    
    def _generate_password_reset_token(self):
        """Generate a random token for password reset."""
        return get_random_string(64)
    
    def _send_password_reset_email(self, user, token):
        """Send password reset email to user."""
        subject = _('Password Reset Request')
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        html_message = render_to_string(
            'authentication/password_reset_email.html',
            {
                'user': user,
                'reset_url': reset_url,
            }
        )
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetConfirmView(views.APIView):
    """View for handling password reset confirmation."""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle password reset confirmation."""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(
                reset_password_token=token,
                reset_password_token_expiry__gt=timezone.now()
            )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.reset_password_token = None
            user.reset_password_token_expiry = None
            user.save()
            
            # Track password reset activity
            UserActivity.objects.create(
                user=user,
                action='password_reset',
                ip_address=self._get_client_ip(request)
            )
            
            return Response({"detail": _("Password reset successful.")})
        except User.DoesNotExist:
            return Response(
                {"detail": _("Invalid or expired token.")},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordChangeView(views.APIView):
    """View for handling password change."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PasswordChangeSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle password change request."""
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Change password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Track password change activity
        UserActivity.objects.create(
            user=user,
            action='password_change',
            ip_address=self._get_client_ip(request)
        )
        
        return Response({"detail": _("Password changed successfully.")})
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
