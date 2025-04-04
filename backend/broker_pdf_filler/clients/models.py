from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid

class Client(models.Model):
    """Model to store client information."""
    
    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other')),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', _('Single')),
        ('married', _('Married')),
        ('divorced', _('Divorced')),
        ('widowed', _('Widowed')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clients')
    
    # Personal Information
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100)
    date_of_birth = models.DateField(_('date of birth'))
    gender = models.CharField(_('gender'), max_length=1, choices=GENDER_CHOICES)
    marital_status = models.CharField(_('marital status'), max_length=20, choices=MARITAL_STATUS_CHOICES)
    id_number = models.CharField(_('ID number'), max_length=50, unique=True)
    nationality = models.CharField(_('nationality'), max_length=100)
    
    # Contact Information
    phone_number = models.CharField(_('phone number'), max_length=20)
    email = models.EmailField(_('email address'), blank=True)
    address_line1 = models.CharField(_('address line 1'), max_length=255)
    address_line2 = models.CharField(_('address line 2'), max_length=255, blank=True)
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state/province'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=20)
    country = models.CharField(_('country'), max_length=100)
    
    # Employment Information
    employer = models.CharField(_('employer'), max_length=255, blank=True)
    occupation = models.CharField(_('occupation'), max_length=255, blank=True)
    work_address = models.CharField(_('work address'), max_length=255, blank=True)
    
    # Financial Information
    annual_income = models.DecimalField(_('annual income'), max_digits=12, decimal_places=2, null=True, blank=True)
    monthly_expenses = models.DecimalField(_('monthly expenses'), max_digits=12, decimal_places=2, null=True, blank=True)
    tax_residency = models.CharField(_('tax residency'), max_length=100, blank=True)
    
    # Payment Information
    payment_method = models.CharField(_('payment method'), max_length=50, blank=True)
    payment_period = models.CharField(_('payment period'), max_length=50, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('client')
        verbose_name_plural = _('clients')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['id_number']),
            models.Index(fields=['first_name', 'last_name']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id_number})"
    
    @property
    def full_name(self):
        """Return the client's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_address(self):
        """Return the client's full address."""
        address_parts = [self.address_line1]
        if self.address_line2:
            address_parts.append(self.address_line2)
        address_parts.extend([
            self.city,
            self.state,
            self.postal_code,
            self.country
        ])
        return ", ".join(filter(None, address_parts))
