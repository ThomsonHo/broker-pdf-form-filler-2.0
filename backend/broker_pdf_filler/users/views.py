from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import UserActivity, UserQuotaUsage, BrokerCompany, InsuranceCompanyAccount
from .serializers.auth import (
    UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailVerificationSerializer
)
from .serializers.company import BrokerCompanySerializer, InsuranceCompanyAccountSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that includes user data in response."""
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'register', 'verify_email']:
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        if user.is_superuser:
            return User.objects.all().order_by('id')
        elif user.role == 'admin':
            return User.objects.filter(broker_company=user.broker_company).order_by('id')
        else:
            return User.objects.filter(id=user.id).order_by('id')
    
    def list(self, request, *args, **kwargs):
        """Override list method to apply filtering."""
        queryset = self.get_queryset()
        
        # Apply search filter if provided
        search_query = request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                models.Q(email__icontains=search_query) |
                models.Q(first_name__icontains=search_query) |
                models.Q(last_name__icontains=search_query)
            )
        
        # Apply role filter if provided
        role_filter = request.query_params.get('role', '')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        
        # Get paginated response
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Generate and send email verification token
                token = user.generate_email_verification_token()
                self._send_verification_email(user, token)
                
                # Track user creation activity
                UserActivity.objects.create(
                    user=user,
                    action='user_created',
                    ip_address=self._get_client_ip(request),
                    details={'created_by': request.user.id if request.user.is_authenticated else None}
                )
                
                # Create initial quota usage record
                UserQuotaUsage.objects.create(user=user)
                
                return Response(
                    UserSerializer(user).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        """Verify user email address."""
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            try:
                user = User.objects.get(email_verification_token=token)
                if user.verify_email_token(token):
                    # Track email verification activity
                    UserActivity.objects.create(
                        user=user,
                        action='email_verified',
                        ip_address=self._get_client_ip(request)
                    )
                    return Response({'detail': 'Email verified successfully.'})
                return Response(
                    {'error': 'Invalid or expired token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """Change user password."""
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Track password change activity
            UserActivity.objects.create(
                user=user,
                action='password_change',
                ip_address=self._get_client_ip(request)
            )
            
            return Response({'detail': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def reset_password_request(self, request):
        """Request password reset."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = user.generate_password_reset_token()
                self._send_password_reset_email(user, token)
                
                # Track password reset request activity
                UserActivity.objects.create(
                    user=user,
                    action='password_reset_request',
                    ip_address=self._get_client_ip(request)
                )
                
                return Response({'detail': 'Password reset email sent if account exists.'})
            except User.DoesNotExist:
                # Return success even if user doesn't exist for security
                return Response({'detail': 'Password reset email sent if account exists.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def reset_password_confirm(self, request):
        """Confirm password reset."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(reset_password_token=token)
                if user.verify_password_reset_token(token):
                    user.set_password(new_password)
                    user.reset_password_token = None
                    user.reset_password_token_expiry = None
                    user.save()
                    
                    # Track password reset activity
                    UserActivity.objects.create(
                        user=user,
                        action='password_reset',
                        ip_address=self._get_client_ip(request)
                    )
                    
                    return Response({'detail': 'Password reset successful.'})
                return Response(
                    {'error': 'Invalid or expired token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user information."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def quota_usage(self, request):
        """Get current user's quota usage."""
        today = timezone.now().date()
        quota_usage, created = UserQuotaUsage.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={'daily_usage': 0, 'monthly_usage': 0}
        )
        
        return Response({
            'daily_usage': quota_usage.daily_usage,
            'daily_quota': request.user.daily_form_quota,
            'monthly_usage': quota_usage.monthly_usage,
            'monthly_quota': request.user.monthly_form_quota,
            'has_daily_quota': quota_usage.has_daily_quota_available(),
            'has_monthly_quota': quota_usage.has_monthly_quota_available()
        })
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _send_verification_email(self, user, token):
        """Send email verification link."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Verify your email address',
            f'Please click the following link to verify your email address: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    
    def _send_password_reset_email(self, user, token):
        """Send password reset link."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_mail(
            'Reset your password',
            f'Please click the following link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )


class BrokerCompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for broker company management."""
    queryset = BrokerCompany.objects.all()
    serializer_class = BrokerCompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class InsuranceCompanyAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for insurance company account management."""
    queryset = InsuranceCompanyAccount.objects.all()
    serializer_class = InsuranceCompanyAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        if user.is_superuser:
            return InsuranceCompanyAccount.objects.all()
        elif user.role == 'admin':
            return InsuranceCompanyAccount.objects.filter(broker_company=user.broker_company)
        else:
            return InsuranceCompanyAccount.objects.none()
