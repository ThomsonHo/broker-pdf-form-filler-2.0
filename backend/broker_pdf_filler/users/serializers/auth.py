from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..models import UserActivity, BrokerCompany
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    token = serializers.CharField(required=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    id = serializers.UUIDField(read_only=True)
    broker_company = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'broker_company',
            'tr_name', 'tr_license_number', 'tr_phone_number', 'is_tr',
            'daily_form_quota', 'monthly_form_quota', 'email_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'email_verified']
    
    def validate_broker_company(self, value):
        if value:
            try:
                BrokerCompany.objects.get(ia_reg_code=value)
            except BrokerCompany.DoesNotExist:
                raise serializers.ValidationError("Invalid broker company code.")
        return value
    
    def update(self, instance, validated_data):
        # Handle broker_company separately
        broker_company_code = validated_data.pop('broker_company', None)
        if broker_company_code:
            try:
                broker_company = BrokerCompany.objects.get(ia_reg_code=broker_company_code)
                instance.broker_company = broker_company
            except BrokerCompany.DoesNotExist:
                raise serializers.ValidationError({"broker_company": "Invalid broker company code."})
        elif broker_company_code is None:  # Allow setting to None
            instance.broker_company = None
            
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Customize the serialized representation of the user."""
        data = super().to_representation(instance)
        # Convert broker_company from object to string (ia_reg_code)
        if instance.broker_company:
            data['broker_company'] = instance.broker_company.ia_reg_code
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    broker_company = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name', 'last_name',
            'role', 'broker_company', 'tr_name', 'tr_license_number', 'tr_phone_number'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_broker_company(self, value):
        # Check if we're in a registration context (no authenticated user)
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            # For new registrations, broker_company is required for non-admin users
            if not value and self.initial_data.get('role') != 'admin':
                raise serializers.ValidationError("Broker company is required for non-admin users.")
            return value
        
        # For authenticated users, broker_company is required for non-admin users
        if not value and request.user.role != 'admin':
            raise serializers.ValidationError("Broker company is required for non-admin users.")
        return value
    
    def create(self, validated_data):
        # Handle broker_company separately
        broker_company_code = validated_data.pop('broker_company', None)
        if broker_company_code:
            try:
                broker_company = BrokerCompany.objects.get(ia_reg_code=broker_company_code)
                validated_data['broker_company'] = broker_company
            except BrokerCompany.DoesNotExist:
                raise serializers.ValidationError({"broker_company": "Invalid broker company code."})
        
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    
    def to_representation(self, instance):
        """Customize the serialized representation of the user."""
        data = super().to_representation(instance)
        # Convert broker_company from object to string (ia_reg_code)
        if instance.broker_company:
            data['broker_company'] = instance.broker_company.ia_reg_code
        return data


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """Custom token serializer that includes user data."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                if not user.email_verified:
                    raise serializers.ValidationError(
                        {"email": "Please verify your email address before logging in."}
                    )
                return attrs
            raise serializers.ValidationError(
                {"email": "Invalid email or password."}
            )
        raise serializers.ValidationError(
            {"email": "Must include 'email' and 'password'."}
        )


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs