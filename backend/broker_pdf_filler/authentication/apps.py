from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'broker_pdf_filler.authentication'
    verbose_name = 'Authentication'
    
    def ready(self):
        """Import signals when app is ready."""
        import broker_pdf_filler.authentication.signals
