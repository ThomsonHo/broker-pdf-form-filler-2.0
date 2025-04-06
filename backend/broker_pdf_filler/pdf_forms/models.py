from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid
import os
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class FormTemplate(models.Model):
    """Model to store PDF form templates and their field mappings."""
    
    CATEGORY_CHOICES = [
        ('broker', _('Broker')),
        ('boclife', _('BOC Life')),
        ('chubb', _('Chubb')),
    ]
    
    FORM_TYPE_CHOICES = [
        ('fna', _('Financial Needs Analysis')),
        ('application', _('Application Form')),
        ('agreement', _('Agreement')),
        ('payment', _('Payment Form')),
    ]
    
    FORM_AFFILIATION_CHOICES = [
        ('broker', _('Broker')),
        ('insurance', _('Insurance Company')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    file_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    form_type = models.CharField(max_length=20, choices=FORM_TYPE_CHOICES, default='application')
    form_affiliation = models.CharField(max_length=20, choices=FORM_AFFILIATION_CHOICES, default='broker')
    version = models.CharField(max_length=20, default='1.0')
    template_file = models.FileField(upload_to='templates/pdf_forms/')
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = _('form template')
        verbose_name_plural = _('form templates')
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class FormSet(models.Model):
    """Model to group PDF forms into sets."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    forms = models.ManyToManyField(FormTemplate, related_name='form_sets')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_form_sets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('form set')
        verbose_name_plural = _('form sets')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class StandardizedFieldCategory(models.Model):
    """Model to store categories for standardized fields."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('standardized field category')
        verbose_name_plural = _('standardized field categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class StandardizedField(models.Model):
    """Model to store standardized fields for mapping."""
    
    FIELD_TYPE_CHOICES = [
        ('text', _('Text')),
        ('number', _('Number')),
        ('date', _('Date')),
        ('email', _('Email')),
        ('phone', _('Phone')),
        ('address', _('Address')),
        ('select', _('Select')),
        ('multiselect', _('Multi-select')),
        ('checkbox', _('Checkbox')),
        ('radio', _('Radio')),
    ]
    
    FIELD_CATEGORY_CHOICES = [
        ('client', _('Client Standardized Field')),
        ('broker', _('Broker-Specific Field')),
        ('user', _('User-Specific Field')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text')
    required = models.BooleanField(default=False)
    validation = models.JSONField(default=dict, blank=True, null=True)
    relationships = models.JSONField(default=dict, blank=True, null=True)
    description = models.TextField(blank=True)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text')
    field_category = models.CharField(max_length=20, choices=FIELD_CATEGORY_CHOICES, default='client')
    category = models.ForeignKey(StandardizedFieldCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='standardized_fields')
    validation_rules = models.TextField(blank=True)
    is_required = models.BooleanField(default=False)
    field_definition = models.TextField(blank=True)
    llm_guide = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_standardized_fields')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('standardized field')
        verbose_name_plural = _('standardized fields')
        ordering = ['field_category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_field_category_display()})"


class FormFieldMapping(models.Model):
    """Model to store the mapping between PDF form fields and system fields."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name='field_mappings')
    pdf_field_name = models.CharField(max_length=100)
    system_field_name = models.CharField(max_length=100, null=True, blank=True)
    standardized_field = models.ForeignKey(StandardizedField, on_delete=models.SET_NULL, null=True, blank=True, related_name='form_mappings')
    validation_rules = models.TextField(blank=True)
    transformation_rules = models.TextField(blank=True)
    field_definition_override = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = _('form field mapping')
        verbose_name_plural = _('form field mappings')
        unique_together = ['template', 'pdf_field_name']
    
    def __str__(self):
        return f"{self.pdf_field_name} → {self.system_field_name or 'Not mapped'}"


class GeneratedForm(models.Model):
    """Model to store generated PDF forms."""
    
    STATUS_CHOICES = [
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_forms')
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='forms')
    template = models.ForeignKey(FormTemplate, on_delete=models.SET_NULL, null=True, related_name='generated_forms')
    batch = models.ForeignKey('FormGenerationBatch', on_delete=models.CASCADE, related_name='batch_forms', null=True)
    form_file = models.FileField(upload_to='pdf_forms/generated/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('generated form')
        verbose_name_plural = _('generated forms')
        ordering = ['-created_at']
    
    def __str__(self):
        template_name = self.template.name if self.template else 'Unknown'
        return f"{template_name} - {self.client} - {self.created_at.strftime('%Y-%m-%d')}"
    
    def delete_file(self):
        """Delete the physical file from storage."""
        if self.form_file:
            if os.path.isfile(self.form_file.path):
                os.remove(self.form_file.path)
    
    def is_expired(self):
        """Check if the form has exceeded the retention period."""
        retention_days = settings.PDF_FORM_RETENTION_DAYS
        expiry_date = self.created_at + timedelta(days=retention_days)
        return timezone.now() > expiry_date


class FormGenerationBatch(models.Model):
    """Model to group together forms generated in a single batch."""
    
    STATUS_CHOICES = [
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('partial', _('Partially Completed')),
        ('failed', _('Failed')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='form_batches')
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='form_batches')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    zip_file = models.FileField(upload_to='pdf_forms/batches/', null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    insurer = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('form generation batch')
        verbose_name_plural = _('form generation batches')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Batch {self.id} - {self.client} - {self.created_at.strftime('%Y-%m-%d')}"
    
    @property
    def forms(self):
        """Return all forms in this batch."""
        return GeneratedForm.objects.filter(batch=self)
    
    def delete_zip_file(self):
        """Delete the physical ZIP file from storage."""
        if self.zip_file:
            if os.path.isfile(self.zip_file.path):
                os.remove(self.zip_file.path)
