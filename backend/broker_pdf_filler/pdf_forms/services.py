import os
import tempfile
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from PyPDFForm.core.filler import Filler
import pdfrw
from django.conf import settings
from django.core.files import File
from django.utils import timezone
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch

# Load standardized fields
STANDARDIZED_FIELDS_PATH = os.path.join(settings.BASE_DIR, 'requirement', 'references', 'standardized_fields.json')
try:
    with open(STANDARDIZED_FIELDS_PATH, 'r') as f:
        STANDARDIZED_FIELDS = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    STANDARDIZED_FIELDS = {}

class PDFFormFiller:
    """Service class for handling PDF form filling operations."""
    
    def __init__(self, template: FormTemplate, client_data: Dict):
        self.template = template
        self.client_data = client_data
        self.field_mappings = {
            mapping.pdf_field_name: mapping.system_field_name
            for mapping in template.field_mappings.all()
        }
    
    def _map_field_value(self, pdf_field: str) -> str:
        """Map PDF field name to system field value."""
        system_field = self.field_mappings.get(pdf_field)
        if not system_field:
            return ""
        
        # Handle nested fields (e.g., "client.name")
        value = self.client_data
        for key in system_field.split('.'):
            if isinstance(value, dict):
                value = value.get(key, "")
            else:
                return ""
        return str(value)
    
    def _fill_with_pypdfform(self, output_path: str) -> bool:
        """Attempt to fill PDF using PyPDFForm."""
        try:
            from PyPDFForm import PyPDFForm
            
            # Create a form instance with the template
            form = PyPDFForm(self.template.template_file.path)
            
            # Fill the form with mapped values
            data = {
                field_name: self._map_field_value(field_name)
                for field_name in self.field_mappings.keys()
            }
            form.fill(data)
            
            # Save the filled form
            form.save(output_path)
            return True
        except Exception as e:
            print(f"PyPDFForm error: {str(e)}")
            return False
    
    def _fill_with_pdfrw(self, output_path: str) -> bool:
        """Fallback method using pdfrw."""
        try:
            # Read the template
            template = pdfrw.PdfReader(self.template.template_file.path)
            
            # Fill the form fields
            for page in template.pages:
                if page['/Annots']:
                    for annotation in page['/Annots']:
                        if annotation['/T']:
                            field_name = annotation['/T'][1:-1]  # Remove parentheses
                            value = self._map_field_value(field_name)
                            annotation.update(
                                pdfrw.objects.pdfstring.PdfString(f'({value})')
                            )
            
            # Write the output
            pdfrw.PdfWriter().write(output_path, template)
            return True
        except Exception as e:
            print(f"PDFrw error: {str(e)}")
            return False
    
    def fill_form(self) -> Optional[str]:
        """Fill the PDF form and return the path to the filled form."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            output_path = temp_file.name
        
        # Try PyPDFForm first
        if self._fill_with_pypdfform(output_path):
            return output_path
        
        # Fallback to pdfrw
        if self._fill_with_pdfrw(output_path):
            return output_path
        
        return None

class FormGenerationService:
    """Service class for managing form generation operations."""
    
    @staticmethod
    def create_batch(user, client, insurer: str = "") -> FormGenerationBatch:
        """Create a new form generation batch."""
        return FormGenerationBatch.objects.create(
            user=user,
            client=client,
            insurer=insurer
        )
    
    @staticmethod
    def generate_form(
        template: FormTemplate,
        client_data: Dict,
        batch: FormGenerationBatch,
        user
    ) -> GeneratedForm:
        """Generate a single form."""
        # Create the form record
        form = GeneratedForm.objects.create(
            user=user,
            client=batch.client,
            template=template,
            batch=batch,
            status='processing'
        )
        
        try:
            # Fill the form
            filler = PDFFormFiller(template, client_data)
            filled_form_path = filler.fill_form()
            
            if filled_form_path:
                # Save the filled form
                with open(filled_form_path, 'rb') as f:
                    form.form_file.save(
                        f"{template.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                        File(f),
                        save=True
                    )
                form.status = 'completed'
            else:
                form.status = 'failed'
                form.error_message = "Failed to fill the form"
            
            form.save()
            
            # Clean up temporary file
            if filled_form_path and os.path.exists(filled_form_path):
                os.unlink(filled_form_path)
                
        except Exception as e:
            form.status = 'failed'
            form.error_message = str(e)
            form.save()
        
        return form
    
    @staticmethod
    def update_batch_status(batch: FormGenerationBatch):
        """Update the batch status based on its forms."""
        forms = batch.forms.all()
        total_forms = forms.count()
        completed_forms = forms.filter(status='completed').count()
        failed_forms = forms.filter(status='failed').count()
        
        if completed_forms == total_forms:
            batch.status = 'completed'
        elif failed_forms == total_forms:
            batch.status = 'failed'
        elif completed_forms > 0:
            batch.status = 'partial'
        
        batch.save()
    
    @staticmethod
    def cleanup_expired_forms():
        """Clean up forms that have exceeded their retention period."""
        expired_forms = GeneratedForm.objects.filter(
            created_at__lt=timezone.now() - timezone.timedelta(days=settings.PDF_FORM_RETENTION_DAYS)
        )
        
        for form in expired_forms:
            form.delete_file()
            form.delete()
    
    @staticmethod
    def check_user_quota(user) -> bool:
        """Check if the user has exceeded their daily quota."""
        today = timezone.now().date()
        today_forms = GeneratedForm.objects.filter(
            user=user,
            created_at__date=today
        ).count()
        
        return today_forms < settings.PDF_FORM_DAILY_QUOTA
    
    @staticmethod
    def get_user_quota_info(user) -> Dict[str, Any]:
        """Get the user's quota information."""
        today = timezone.now().date()
        today_forms = GeneratedForm.objects.filter(
            user=user,
            created_at__date=today
        ).count()
        
        return {
            'daily_quota': settings.PDF_FORM_DAILY_QUOTA,
            'daily_used': today_forms,
            'daily_remaining': settings.PDF_FORM_DAILY_QUOTA - today_forms
        } 