from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch, FormSet, StandardizedField

@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'form_type', 'form_affiliation', 'version', 'is_active', 'created_at')
    list_filter = ('category', 'form_type', 'form_affiliation', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'form_type', 'form_affiliation', 'version')
        }),
        (_('File'), {
            'fields': ('template_file',)
        }),
        (_('Settings'), {
            'fields': ('is_active', 'metadata')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(FormSet)
class FormSetAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    filter_horizontal = ('forms',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'forms')
        }),
        (_('Metadata'), {
            'fields': ('created_by',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(StandardizedField)
class StandardizedFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'field_type', 'field_category', 'is_required', 'created_by', 'created_at')
    list_filter = ('field_type', 'field_category', 'is_required')
    search_fields = ('name', 'description', 'field_definition')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'field_type', 'field_category', 'is_required')
        }),
        (_('Validation'), {
            'fields': ('validation_rules',)
        }),
        (_('Documentation'), {
            'fields': ('field_definition', 'llm_guide')
        }),
        (_('Metadata'), {
            'fields': ('metadata', 'created_by')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(FormFieldMapping)
class FormFieldMappingAdmin(admin.ModelAdmin):
    list_display = ('template', 'pdf_field_name', 'system_field_name', 'standardized_field', 'created_at')
    list_filter = ('template__category', 'template__form_type')
    search_fields = ('pdf_field_name', 'system_field_name', 'template__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('template', 'pdf_field_name', 'system_field_name', 'standardized_field')
        }),
        (_('Rules'), {
            'fields': ('validation_rules', 'transformation_rules')
        }),
        (_('Documentation'), {
            'fields': ('field_definition_override',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(GeneratedForm)
class GeneratedFormAdmin(admin.ModelAdmin):
    list_display = ('template', 'client', 'user', 'status', 'created_at')
    list_filter = ('status', 'template__category', 'created_at')
    search_fields = ('template__name', 'client__name', 'user__email')
    readonly_fields = ('created_at',)
    fieldsets = (
        (None, {
            'fields': ('template', 'client', 'user', 'batch')
        }),
        (_('File'), {
            'fields': ('form_file',)
        }),
        (_('Status'), {
            'fields': ('status', 'error_message')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(FormGenerationBatch)
class FormGenerationBatchAdmin(admin.ModelAdmin):
    list_display = ('client', 'user', 'status', 'download_count', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('client__name', 'user__email')
    readonly_fields = ('created_at',)
    fieldsets = (
        (None, {
            'fields': ('client', 'user', 'status')
        }),
        (_('File'), {
            'fields': ('zip_file',)
        }),
        (_('Metadata'), {
            'fields': ('download_count', 'insurer')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
