from django.core.cache import cache
from broker_pdf_filler.pdf_forms.models import StandardizedField
import logging

logger = logging.getLogger(__name__)

class ClientDataService:
    """Service class to handle dynamic client data operations."""
    
    CACHE_PREFIX = 'client_fields'
    CACHE_TIMEOUT = 3600  # 1 hour
    
    @classmethod
    def get_client_fields(cls):
        """Get all fields that should be stored in client data."""
        cache_key = f"{cls.CACHE_PREFIX}_all"
        fields = cache.get(cache_key)
        
        if fields is None:
            try:
                query = StandardizedField.objects.filter(
                    is_client_field=True, 
                    is_active=True
                ).order_by('display_category', 'display_order', 'label')
                
                logger.info(f"Fetching client fields, found {query.count()} active client fields")
                fields = list(query.values())
                
                if not fields:
                    logger.warning("No active client fields found. This might indicate a data issue.")
                
                cache.set(cache_key, fields, cls.CACHE_TIMEOUT)
            except Exception as e:
                logger.error(f"Error fetching client fields: {str(e)}")
                # Return empty list instead of raising to avoid breaking the UI
                fields = []
            
        return fields
    
    @classmethod
    def get_core_client_fields(cls):
        """Get fields that should be displayed in client listings."""
        cache_key = f"{cls.CACHE_PREFIX}_core"
        fields = cache.get(cache_key)
        
        if fields is None:
            try:
                query = StandardizedField.objects.filter(
                    is_client_field=True,
                    is_core_field=True,
                    is_active=True
                ).order_by('display_order', 'label')
                
                logger.info(f"Fetching core client fields, found {query.count()} active core fields")
                fields = list(query.values())
                
                if not fields:
                    logger.warning("No active core client fields found. This might indicate a data issue.")
                
                cache.set(cache_key, fields, cls.CACHE_TIMEOUT)
            except Exception as e:
                logger.error(f"Error fetching core client fields: {str(e)}")
                # Return empty list instead of raising to avoid breaking the UI
                fields = []
            
        return fields
    
    @classmethod
    def get_filterable_client_fields(cls):
        """Get fields that can be used for filtering clients."""
        cache_key = f"{cls.CACHE_PREFIX}_filterable"
        fields = cache.get(cache_key)
        
        if fields is None:
            try:
                query = StandardizedField.objects.filter(
                    is_client_field=True,
                    is_filterable=True,
                    is_active=True
                ).order_by('display_category', 'label')
                
                logger.info(f"Fetching filterable client fields, found {query.count()} active filterable fields")
                fields = list(query.values())
                
                if not fields:
                    logger.warning("No active filterable client fields found. This might indicate a data issue.")
                
                cache.set(cache_key, fields, cls.CACHE_TIMEOUT)
            except Exception as e:
                logger.error(f"Error fetching filterable client fields: {str(e)}")
                # Return empty list instead of raising to avoid breaking the UI
                fields = []
            
        return fields
    
    @classmethod
    def validate_client_data(cls, data):
        """Validate client data against field definitions."""
        errors = {}
        fields = StandardizedField.objects.filter(
            is_client_field=True,
            is_active=True
        )
        
        for field in fields:
            # Check required fields
            if field.is_required and field.name not in data:
                errors[field.name] = f"{field.label} is required."
                continue
                
            if field.name not in data or data[field.name] is None:
                continue
                
            # Validate based on field type
            value = data[field.name]
            
            if field.field_type == 'email' and value:
                # Simple email validation
                if '@' not in value or '.' not in value:
                    errors[field.name] = f"{field.label} must be a valid email address."
            
            elif field.field_type == 'number' and value:
                # Numeric validation
                try:
                    float(value)
                except (ValueError, TypeError):
                    errors[field.name] = f"{field.label} must be a valid number."
            
            # Add more validation rules based on field types
            
            # Check validation rules if defined
            if field.has_validation and field.validation_rules:
                # Process custom validation rules
                # This would be expanded based on your validation rule format
                pass
                
        return errors
    
    @classmethod
    def invalidate_cache(cls):
        """Invalidate all client field caches."""
        cache.delete(f"{cls.CACHE_PREFIX}_all")
        cache.delete(f"{cls.CACHE_PREFIX}_core")
        cache.delete(f"{cls.CACHE_PREFIX}_filterable") 