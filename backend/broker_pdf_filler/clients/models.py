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
    
    # Minimal required fixed field
    id_number = models.CharField(_('ID number'), max_length=50, unique=True)
    
    # Dynamic data storage
    data = models.JSONField(default=dict)
    
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
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id_number})"
    
    # Helper methods for dynamic data access
    def get_field_value(self, field_name, default=None):
        """Get a value from the dynamic data field."""
        return self.data.get(field_name, default)
    
    def set_field_value(self, field_name, value):
        """Set a value in the dynamic data field."""
        self.data[field_name] = value
        
    # Property-based backward compatibility for common fields
    @property
    def first_name(self):
        """Return the client's first name."""
        return self.get_field_value('first_name', '')
        
    @property
    def last_name(self):
        """Return the client's last name."""
        return self.get_field_value('last_name', '')
    
    @property
    def full_name(self):
        """Return the client's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def date_of_birth(self):
        """Return the client's date of birth."""
        return self.get_field_value('date_of_birth', '')
    
    @property
    def gender(self):
        """Return the client's gender."""
        return self.get_field_value('gender', '')
    
    @property
    def marital_status(self):
        """Return the client's marital status."""
        return self.get_field_value('marital_status', '')
    
    @property
    def nationality(self):
        """Return the client's nationality."""
        return self.get_field_value('nationality', '')
    
    @property
    def phone_number(self):
        """Return the client's phone number."""
        return self.get_field_value('phone_number', '')
    
    @property
    def email(self):
        """Return the client's email."""
        return self.get_field_value('email', '')
    
    @property
    def address_line1(self):
        """Return the client's address line 1."""
        return self.get_field_value('address_line1', '')
    
    @property
    def address_line2(self):
        """Return the client's address line 2."""
        return self.get_field_value('address_line2', '')
    
    @property
    def city(self):
        """Return the client's city."""
        return self.get_field_value('city', '')
    
    @property
    def state(self):
        """Return the client's state/province."""
        return self.get_field_value('state', '')
    
    @property
    def postal_code(self):
        """Return the client's postal code."""
        return self.get_field_value('postal_code', '')
    
    @property
    def country(self):
        """Return the client's country."""
        return self.get_field_value('country', '')
    
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
