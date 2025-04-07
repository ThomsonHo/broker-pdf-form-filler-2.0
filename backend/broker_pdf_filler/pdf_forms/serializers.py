from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch, FormSet, StandardizedField, StandardizedFieldCategory

class StandardizedFieldCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardizedFieldCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class StandardizedFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardizedField
        fields = [
            'id', 'created_at', 'updated_at', 'created_by', 'updated_by',
            'name', 'label', 'llm_guide', 'is_required', 'field_category',
            'display_category', 'field_type', 'field_definition', 'has_validation',
            'validation_rules', 'has_relationship', 'relationship_rules',
            'options', 'default_value', 'placeholder', 'help_text',
            'is_active', 'is_system', 'metadata'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate(self, data):
        # Required fields validation
        required_fields = ['name', 'label', 'field_category', 'display_category', 'field_type']
        for field in required_fields:
            if field not in data:
                raise serializers.ValidationError({field: "This field is required."})

        # Set default values if not provided
        if 'field_type' not in data:
            data['field_type'] = 'text'
        if 'field_category' not in data:
            data['field_category'] = 'client'
        if 'display_category' not in data:
            data['display_category'] = 'Client Information'

        return data

    def validate_validation_rules(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Validation rules must be a list")
        for rule in value:
            if not isinstance(rule, dict):
                raise serializers.ValidationError("Each validation rule must be a dictionary")
            if 'type' not in rule:
                raise serializers.ValidationError("Each validation rule must have a type")
            if 'value' not in rule:
                raise serializers.ValidationError("Each validation rule must have a value")
            if 'message' not in rule:
                raise serializers.ValidationError("Each validation rule must have a message")
        return value
    
    def validate_relationship_rules(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Relationship rules must be a list")
        for rule in value:
            if not isinstance(rule, dict):
                raise serializers.ValidationError("Each relationship rule must be a dictionary")
            if 'type' in rule and not isinstance(rule['type'], str):
                raise serializers.ValidationError("Relationship rule type must be a string")
            if 'target_field' in rule and not isinstance(rule['target_field'], str):
                raise serializers.ValidationError("Relationship rule target_field must be a string")
            if 'condition' in rule:
                if not isinstance(rule['condition'], dict):
                    raise serializers.ValidationError("Relationship rule condition must be a dictionary")
                if 'field' in rule['condition'] and not isinstance(rule['condition']['field'], str):
                    raise serializers.ValidationError("Relationship rule condition field must be a string")
                if 'operator' in rule['condition'] and not isinstance(rule['condition']['operator'], str):
                    raise serializers.ValidationError("Relationship rule condition operator must be a string")
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