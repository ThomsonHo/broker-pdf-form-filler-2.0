from rest_framework import serializers
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch

class FormFieldMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormFieldMapping
        fields = ['id', 'pdf_field_name', 'system_field_name']
        read_only_fields = ['id']

class FormTemplateSerializer(serializers.ModelSerializer):
    field_mappings = FormFieldMappingSerializer(many=True, read_only=True)
    
    class Meta:
        model = FormTemplate
        fields = [
            'id', 'name', 'file_name', 'description', 'category',
            'template_file', 'is_active', 'field_mappings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class GeneratedFormSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneratedForm
        fields = [
            'id', 'template', 'template_name', 'status',
            'error_message', 'created_at', 'download_url'
        ]
        read_only_fields = [
            'id', 'status', 'error_message', 'created_at',
            'template_name', 'download_url'
        ]
    
    def get_download_url(self, obj):
        if obj.form_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.form_file.url)
        return None

class FormGenerationBatchSerializer(serializers.ModelSerializer):
    forms = GeneratedFormSerializer(many=True, read_only=True)
    total_forms = serializers.SerializerMethodField()
    completed_forms = serializers.SerializerMethodField()
    failed_forms = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FormGenerationBatch
        fields = [
            'id', 'status', 'insurer', 'created_at',
            'forms', 'total_forms', 'completed_forms',
            'failed_forms', 'download_url'
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'forms',
            'total_forms', 'completed_forms', 'failed_forms',
            'download_url'
        ]
    
    def get_total_forms(self, obj):
        return obj.forms.count()
    
    def get_completed_forms(self, obj):
        return obj.forms.filter(status='completed').count()
    
    def get_failed_forms(self, obj):
        return obj.forms.filter(status='failed').count()
    
    def get_download_url(self, obj):
        if obj.zip_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.zip_file.url)
        return None 