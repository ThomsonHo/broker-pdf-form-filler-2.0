from django.shortcuts import render
import os
import zipfile
from django.http import FileResponse
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files import File
from django.utils import timezone
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch
from .serializers import (
    FormTemplateSerializer, FormFieldMappingSerializer,
    GeneratedFormSerializer, FormGenerationBatchSerializer
)
from .services import FormGenerationService

# Create your views here.

class FormTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing PDF form templates."""
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter templates by category if provided."""
        queryset = FormTemplate.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def update_field_mappings(self, request, pk=None):
        """Update field mappings for a template."""
        template = self.get_object()
        mappings_data = request.data.get('mappings', [])
        
        # Clear existing mappings
        template.field_mappings.all().delete()
        
        # Create new mappings
        for mapping in mappings_data:
            FormFieldMapping.objects.create(
                template=template,
                pdf_field_name=mapping['pdf_field_name'],
                system_field_name=mapping.get('system_field_name')
            )
        
        return Response({'status': 'field mappings updated'})

class FormGenerationBatchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing form generation batches."""
    queryset = FormGenerationBatch.objects.all()
    serializer_class = FormGenerationBatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter batches by user."""
        return FormGenerationBatch.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a new form generation batch."""
        client_id = request.data.get('client_id')
        insurer = request.data.get('insurer', '')
        template_ids = request.data.get('template_ids', [])
        
        if not client_id or not template_ids:
            return Response(
                {'error': 'client_id and template_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create batch
            batch = FormGenerationService.create_batch(
                user=request.user,
                client_id=client_id,
                insurer=insurer
            )
            
            # Generate forms
            for template_id in template_ids:
                template = FormTemplate.objects.get(id=template_id)
                FormGenerationService.generate_form(
                    template=template,
                    client_data=request.data.get('client_data', {}),
                    batch=batch,
                    user=request.user
                )
            
            # Update batch status
            FormGenerationService.update_batch_status(batch)
            
            serializer = self.get_serializer(batch)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def download_forms(self, request, pk=None):
        """Download all forms in a batch as a ZIP file."""
        batch = self.get_object()
        
        # Create ZIP file
        zip_filename = f"forms_{batch.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = os.path.join(settings.MEDIA_ROOT, 'pdf_forms', 'batches', zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            for form in batch.forms.filter(status='completed'):
                if form.form_file:
                    file_path = form.form_file.path
                    arc_name = os.path.basename(file_path)
                    zip_file.write(file_path, arc_name)
        
        # Save ZIP file to batch
        with open(zip_path, 'rb') as f:
            batch.zip_file.save(zip_filename, File(f), save=True)
        
        # Increment download count
        batch.download_count += 1
        batch.save()
        
        # Return file response
        response = FileResponse(batch.zip_file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
        return response

class GeneratedFormViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing generated forms."""
    queryset = GeneratedForm.objects.all()
    serializer_class = GeneratedFormSerializer
    permission_classes = [IsAuthenticated]
    
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
