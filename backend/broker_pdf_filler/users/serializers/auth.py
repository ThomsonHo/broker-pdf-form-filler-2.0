from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..models import UserActivity

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'daily_form_quota', 'monthly_form_quota', 
                  'is_active', 'is_staff', 'last_login', 'date_joined']
        read_only_fields = ['id', 'is_staff', 'last_login', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=10,
        help_text=_('Must be at least 10 characters long')
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': False}
        }
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": _("Passwords do not match.")})
        return attrs
    
    def create(self, validated_data):
        """Create a new user with encrypted password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'standard')
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user data in response."""
    
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
        ip_address = self.context['request'].META.get('REMOTE_ADDR', None)
        UserActivity.objects.create(
            user=user,
            action='login',
            ip_address=ip_address
        )
        
        # Update last login IP
        user.last_login_ip = ip_address
        user.save(update_fields=['last_login_ip'])
        
        return data


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


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField(required=True)


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