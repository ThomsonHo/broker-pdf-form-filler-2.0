from django.shortcuts import render, get_object_or_404
import os
import zipfile
import logging
from django.http import FileResponse
from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch, FormSet, StandardizedField, StandardizedFieldCategory
from .serializers import (
    FormTemplateSerializer, FormFieldMappingSerializer,
    GeneratedFormSerializer, FormGenerationBatchSerializer,
    FormSetSerializer, StandardizedFieldSerializer, StandardizedFieldCategorySerializer
)
from .services import FormGenerationService, extract_pdf_fields, validate_field_mapping, extract_and_map_pdf_fields
from .permissions import IsAdminUser, IsBrokerUser
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Create your views here.

class FormTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing PDF form templates."""
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['category', 'form_type', 'form_affiliation', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    def get_queryset(self):
        return FormTemplate.objects.all()
    
    def perform_create(self, serializer):
        """Create a new form template and extract its fields."""
        template = serializer.save(created_by=self.request.user)
        extract_and_map_pdf_fields(template, user=self.request.user)
    
    def perform_update(self, serializer):
        """Update a form template and extract any new fields."""
        template = serializer.save()
        extract_and_map_pdf_fields(template, user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def check_deletable(self, request, pk=None):
        """Check if a template can be safely deleted."""
        template = self.get_object()
        
        # Check if the template is used in any generated forms
        has_generated_forms = GeneratedForm.objects.filter(template=template).exists()
        
        # Check if the template is part of any form sets
        has_form_sets = template.form_sets.exists()
        
        # Check if the template has any field mappings
        has_field_mappings = FormFieldMapping.objects.filter(template=template).exists()
        
        # A template can be deleted if:
        # 1. It's not used in any generated forms
        # 2. It's not part of any form sets
        # 3. It has no field mappings
        deletable = not (has_generated_forms or has_form_sets or has_field_mappings)
        
        return Response({
            'deletable': deletable,
            'reasons': {
                'has_generated_forms': has_generated_forms,
                'has_form_sets': has_form_sets,
                'has_field_mappings': has_field_mappings
            }
        })
    
    @action(detail=True, methods=['post'])
    def extract_fields(self, request, pk=None):
        template = self.get_object()
        try:
            fields = extract_pdf_fields(template.template_file.path)
            return Response(fields)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_field_mappings(self, request, pk=None):
        template = self.get_object()
        mappings_data = request.data.get('mappings', [])
        
        # Clear existing mappings
        template.field_mappings.all().delete()
        
        # Create new mappings
        for mapping_data in mappings_data:
            mapping_data['form_template'] = template.id
            mapping_data['created_by'] = request.user.id
            serializer = FormFieldMappingSerializer(data=mapping_data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'status': 'field mappings updated'})

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get a preview URL for the template file."""
        template = self.get_object()
        if not template.template_file:
            return Response(
                {'error': 'Template file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Serve the file directly with appropriate headers
        response = FileResponse(template.template_file, as_attachment=False)
        response['Content-Type'] = 'application/pdf'
        response['Content-Disposition'] = 'inline'
        # Allow the file to be displayed in an iframe
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the template file."""
        template = self.get_object()
        if not template.template_file:
            return Response(
                {'error': 'Template file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = FileResponse(template.template_file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(template.template_file.name)}"'
        return response

    @action(detail=True, methods=['get'])
    def field_mappings(self, request, pk=None):
        """Get field mappings for a template."""
        template = self.get_object()
        mappings = template.field_mappings.all()
        serializer = FormFieldMappingSerializer(mappings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_field_mapping(self, request, pk=None):
        """Add a field mapping to a template."""
        template = self.get_object()
        data = request.data
        data['template'] = template.id
        serializer = FormFieldMappingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_field_mapping(self, request, pk=None, mapping_id=None):
        """Update a field mapping."""
        template = self.get_object()
        try:
            mapping = template.field_mappings.get(id=mapping_id)
        except FormFieldMapping.DoesNotExist:
            return Response(
                {'error': 'Field mapping not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = FormFieldMappingSerializer(mapping, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_field_mapping(self, request, pk=None, mapping_id=None):
        """Delete a field mapping."""
        template = self.get_object()
        try:
            mapping = template.field_mappings.get(id=mapping_id)
            mapping.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FormFieldMapping.DoesNotExist:
            return Response(
                {'error': 'Field mapping not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class FormSetViewSet(viewsets.ModelViewSet):
    queryset = FormSet.objects.all()
    serializer_class = FormSetSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

class StandardizedFieldViewSet(viewsets.ModelViewSet):
    queryset = StandardizedField.objects.all()
    serializer_class = StandardizedFieldSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['field_type', 'field_category', 'is_required']
    search_fields = ['name', 'label', 'description', 'field_definition']
    ordering_fields = ['name', 'field_category', 'created_at']
    ordering = ['name']  # Default ordering if none specified
    pagination_class = CustomPageNumberPagination
    
    def get_queryset(self):
        try:
            queryset = StandardizedField.objects.all()
            logger.info(f"Retrieved {queryset.count()} standardized fields")
            return queryset
        except Exception as e:
            logger.error(f"Error retrieving standardized fields: {str(e)}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in list method: {str(e)}")
            return Response(
                {"error": "Internal server error", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate_definition(self, request):
        field_name = request.data.get('field_name')
        field_type = request.data.get('field_type')
        
        if not field_name or not field_type:
            return Response(
                {'error': 'Field name and type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement LLM integration for generating field definition
        field_definition = f"Definition for {field_name} ({field_type})"
        
        return Response({'field_definition': field_definition})
    
    @action(detail=False, methods=['post'])
    def generate_llm_guide(self, request):
        field_name = request.data.get('field_name')
        field_type = request.data.get('field_type')
        field_definition = request.data.get('field_definition')
        
        if not all([field_name, field_type, field_definition]):
            return Response(
                {'error': 'Field name, type, and definition are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement LLM integration for generating LLM guide
        llm_guide = f"LLM guide for {field_name} ({field_type})"
        
        return Response({'llm_guide': llm_guide})
    
    @action(detail=False, methods=['post'])
    def suggest_validation_rules(self, request):
        field_name = request.data.get('field_name')
        field_type = request.data.get('field_type')
        
        if not field_name or not field_type:
            return Response(
                {'error': 'Field name and type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement LLM integration for suggesting validation rules
        validation_rules = [
            f"Rule 1 for {field_name}",
            f"Rule 2 for {field_name}",
        ]
        
        # Return the rules as a JSON string
        return Response({'rules': validation_rules})

class FormFieldMappingViewSet(viewsets.ModelViewSet):
    serializer_class = FormFieldMappingSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['template', 'standardized_field']
    search_fields = ['pdf_field_name', 'system_field_name']
    ordering_fields = ['pdf_field_name', 'created_at']
    
    def get_queryset(self):
        return FormFieldMapping.objects.filter(template_id=self.kwargs['template_pk'])
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(template_id=self.kwargs['template_pk'], created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

class FormGenerationBatchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing form generation batches."""
    queryset = FormGenerationBatch.objects.all()
    serializer_class = FormGenerationBatchSerializer
    permission_classes = [IsBrokerUser]
    filterset_fields = ['status', 'insurer']
    search_fields = ['client__name']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """Filter batches by user."""
        return FormGenerationBatch.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def increment_download_count(self, request, pk=None):
        batch = self.get_object()
        batch.download_count += 1
        batch.save()
        return Response({'status': 'success'})

class GeneratedFormViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing generated forms."""
    queryset = GeneratedForm.objects.all()
    serializer_class = GeneratedFormSerializer
    permission_classes = [IsBrokerUser]
    filterset_fields = ['status', 'template', 'batch']
    search_fields = ['client__name', 'template__name']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """Filter forms by user."""
        return GeneratedForm.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a single generated form."""
        form = self.get_object()
        if not form.form_file:
            return Response(
                {'error': 'Form file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = FileResponse(form.form_file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(form.form_file.name)}"'
        return response

class StandardizedFieldCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing standardized field categories."""
    queryset = StandardizedFieldCategory.objects.all()
    serializer_class = StandardizedFieldCategorySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    pagination_class = CustomPageNumberPagination
    
    def get_queryset(self):
        return StandardizedFieldCategory.objects.all()
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        serializer.save()
