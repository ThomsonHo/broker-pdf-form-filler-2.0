from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenBlacklistSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from broker_pdf_filler.users.models import UserActivity

User = get_user_model()


class LoginSerializer(TokenObtainPairSerializer):
    """Custom login serializer that includes user data in response."""
    
    def validate(self, attrs):
        """Validate credentials and add user data to token."""
        data = super().validate(attrs)
        
        # Include user data in response
        user = self.user
        data.update({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        })
        
        # Track login activity
        UserActivity.objects.create(
            user=user,
            action='login',
            ip_address=self._get_client_ip()
        )
        
        return data
    
    def _get_client_ip(self):
        """Extract client IP address from request."""
        request = self.context.get('request')
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            return ip
        return None


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that the email exists."""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # Don't reveal that the email doesn't exist for security
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True,
        min_length=10,
        help_text=_('Must be at least 10 characters long')
    )
    confirm_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True
    )
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": _("Passwords do not match.")})
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    current_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True
    )
    new_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True,
        min_length=10,
        help_text=_('Must be at least 10 characters long')
    )
    confirm_password = serializers.CharField(
        style={'input_type': 'password'},
        required=True
    )
    
    def validate(self, attrs):
        """Validate that old password is correct and new passwords match."""
        user = self.context['request'].user
        
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({"current_password": _("Current password is incorrect.")})
            
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": _("New passwords do not match.")})
            
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": _("New password cannot be the same as current password.")})
            
        return attrs


class TokenRefreshResponseSerializer(serializers.Serializer):
    """Serializer for token refresh response."""
    
    access = serializers.CharField()
    refresh = serializers.CharField()
    
    def create(self, validated_data):
        raise NotImplementedError()
    
    def update(self, instance, validated_data):
        raise NotImplementedError()


class LogoutSerializer(TokenBlacklistSerializer):
    """Serializer for logout."""
    pass 