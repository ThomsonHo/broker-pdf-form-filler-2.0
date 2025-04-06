from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'templates', views.FormTemplateViewSet)
router.register(r'form-sets', views.FormSetViewSet)
router.register(r'standardized-fields', views.StandardizedFieldViewSet)
router.register(r'field-mappings', views.FormFieldMappingViewSet)
router.register(r'generated-forms', views.GeneratedFormViewSet)
router.register(r'generation-batches', views.FormGenerationBatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 