from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
from django.conf import settings
import logging
from .models import FormTemplate
from .services import extract_and_map_pdf_fields

logger = logging.getLogger(__name__)

@receiver(post_save, sender=FormTemplate)
def handle_template_save(sender, instance, created, **kwargs):
    """
    Signal handler to automatically extract PDF fields when a template is created or updated.
    """
    try:
        if instance.template_file:
            # Get the full path to the file
            file_path = default_storage.path(instance.template_file.name)
            
            # Check if file exists and is accessible
            if default_storage.exists(instance.template_file.name):
                extract_and_map_pdf_fields(instance, user=instance.created_by)
            else:
                logger.warning(f"Template file not found: {instance.template_file.name}")
    except Exception as e:
        logger.error(f"Error processing template file: {str(e)}")
        # Don't raise the exception to prevent the save from failing
        # The field extraction can be retried later if needed 