from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch, FormSet, StandardizedField, StandardizedFieldCategory

class StandardizedFieldCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardizedFieldCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class StandardizedFieldSerializer(serializers.ModelSerializer):
    validation = serializers.JSONField(required=False, allow_null=True)
    relationships = serializers.JSONField(required=False, allow_null=True)
    category = StandardizedFieldCategorySerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = StandardizedField
        fields = [
            'id', 'name', 'label', 'type', 'required', 'validation', 'relationships',
            'description', 'field_type', 'field_category', 'validation_rules', 
            'is_required', 'field_definition', 'llm_guide', 'metadata', 
            'created_by', 'created_at', 'updated_at', 'category', 'category_id'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_validation_rules(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Validation rules must be a list")
        return value
    
    def validate_metadata(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Metadata must be a dictionary")
        return value
        
    def validate_validation(self, value):
        if value is not None and not isinstance(value, dict):
            raise serializers.ValidationError("Validation must be a dictionary")
        return value
        
    def validate_relationships(self, value):
        if value is not None and not isinstance(value, dict):
            raise serializers.ValidationError("Relationships must be a dictionary")
        return value

class FormFieldMappingSerializer(serializers.ModelSerializer):
    standardized_field = StandardizedFieldSerializer(read_only=True)
    standardized_field_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = FormFieldMapping
        fields = [
            'id', 'template', 'pdf_field_name', 'system_field_name',
            'standardized_field', 'standardized_field_id', 'validation_rules',
            'transformation_rules', 'field_definition_override',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class FormTemplateSerializer(serializers.ModelSerializer):
    field_mappings = serializers.SerializerMethodField()
    
    class Meta:
        model = FormTemplate
        fields = ['id', 'name', 'description', 'category', 'version', 'template_file', 'is_active', 'created_at', 'updated_at', 'field_mappings', 'form_type', 'form_affiliation']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_field_mappings(self, obj):
        return FormFieldMappingSerializer(obj.field_mappings.all(), many=True).data

class FormSetSerializer(serializers.ModelSerializer):
    templates = FormTemplateSerializer(many=True, read_only=True)
    template_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = FormSet
        fields = ['id', 'name', 'description', 'templates', 'template_ids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        template_ids = validated_data.pop('template_ids', [])
        form_set = FormSet.objects.create(**validated_data)
        form_set.templates.set(template_ids)
        return form_set
    
    def update(self, instance, validated_data):
        template_ids = validated_data.pop('template_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if template_ids is not None:
            instance.templates.set(template_ids)
        return instance

class GeneratedFormSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneratedForm
        fields = ['id', 'form_template', 'file', 'field_values', 'created_at', 'download_url']
        read_only_fields = ['id', 'created_at']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class FormGenerationBatchSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FormGenerationBatch
        fields = ['id', 'form_template', 'total_forms', 'completed_forms', 'failed_forms', 'field_values_batch', 'created_at', 'download_url']
        read_only_fields = ['id', 'created_at']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None 