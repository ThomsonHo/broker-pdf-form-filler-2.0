from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class BrokerCompany(models.Model):
    """Model to store broker company information."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('company name'), max_length=255, unique=True)
    code = models.CharField(_('company code'), max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('broker company')
        verbose_name_plural = _('broker companies')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class InsuranceCompanyAccount(models.Model):
    """Model to store broker company's insurance company account codes."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    broker_company = models.ForeignKey(BrokerCompany, on_delete=models.CASCADE, related_name='insurance_accounts')
    insurance_company = models.CharField(_('insurance company name'), max_length=255)
    account_code = models.CharField(_('account code'), max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('insurance company account')
        verbose_name_plural = _('insurance company accounts')
        unique_together = ['broker_company', 'insurance_company']
        ordering = ['insurance_company']
    
    def __str__(self):
        return f"{self.insurance_company} - {self.account_code}"


class User(AbstractUser):
    """Custom User model with email as the unique identifier."""

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    ROLE_CHOICES = [
        ('admin', _('Administrator')),
        ('standard', _('Standard User')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # Remove username field
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='standard')
    broker_company = models.ForeignKey(BrokerCompany, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    # TR-specific fields
    tr_name = models.CharField(_('TR name'), max_length=255, null=True, blank=True)
    tr_license_number = models.CharField(_('TR license number'), max_length=50, null=True, blank=True)
    tr_phone_number = models.CharField(_('TR phone number'), max_length=20, null=True, blank=True)
    
    daily_form_quota = models.PositiveIntegerField(default=10, help_text=_('Maximum number of form sets allowed per day'))
    monthly_form_quota = models.PositiveIntegerField(default=300, help_text=_('Maximum number of form sets allowed per month'))
    reset_password_token = models.CharField(max_length=64, null=True, blank=True)
    reset_password_token_expiry = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_tr(self):
        """Check if the user has TR-specific information filled out."""
        return bool(self.tr_name and self.tr_license_number and self.tr_phone_number)


class UserActivity(models.Model):
    """Model to track user activity for monitoring purposes."""

    ACTION_CHOICES = [
        ('login', _('Login')),
        ('logout', _('Logout')),
        ('password_change', _('Password Change')),
        ('password_reset_request', _('Password Reset Request')),
        ('password_reset', _('Password Reset')),
        ('form_generated', _('Form Generated')),
        ('client_added', _('Client Added')),
        ('client_updated', _('Client Updated')),
        ('client_exported', _('Client Data Exported')),
        ('llm_extraction', _('LLM Data Extraction')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=64, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.JSONField(null=True, blank=True, help_text=_('Additional details about the activity'))
    
    class Meta:
        verbose_name = _('user activity')
        verbose_name_plural = _('user activities')
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_action_display()} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


class UserQuotaUsage(models.Model):
    """Model to track daily and monthly form generation quotas."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quota_usage')
    date = models.DateField(default=timezone.now)
    daily_usage = models.PositiveIntegerField(default=0)
    monthly_usage = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = _('user quota usage')
        verbose_name_plural = _('user quota usages')
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - Daily: {self.daily_usage}/{self.user.daily_form_quota} - Monthly: {self.monthly_usage}/{self.user.monthly_form_quota}"

    def has_daily_quota_available(self):
        return self.daily_usage < self.user.daily_form_quota
    
    def has_monthly_quota_available(self):
        return self.monthly_usage < self.user.monthly_form_quota
