from django.apps import AppConfig


class PdfFormsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'broker_pdf_filler.pdf_forms'

    def ready(self):
        """Import signals when the app is ready."""
        import broker_pdf_filler.pdf_forms.signals  # noqa
