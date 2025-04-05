from django.contrib import admin
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch

@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'created_at', 'updated_at')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(FormFieldMapping)
class FormFieldMappingAdmin(admin.ModelAdmin):
    list_display = ('template', 'pdf_field_name', 'system_field_name')
    list_filter = ('template',)
    search_fields = ('pdf_field_name', 'system_field_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(GeneratedForm)
class GeneratedFormAdmin(admin.ModelAdmin):
    list_display = ('template', 'client', 'status', 'created_at')
    list_filter = ('status', 'template', 'created_at')
    search_fields = ('client__name', 'template__name')
    readonly_fields = ('created_at',)
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(FormGenerationBatch)
class FormGenerationBatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'status', 'insurer', 'created_at')
    list_filter = ('status', 'insurer', 'created_at')
    search_fields = ('client__name', 'insurer')
    readonly_fields = ('created_at',)
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
