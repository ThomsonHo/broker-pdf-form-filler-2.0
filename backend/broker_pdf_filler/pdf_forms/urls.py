from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    FormTemplateViewSet, FormFieldMappingViewSet,
    GeneratedFormViewSet, FormGenerationBatchViewSet,
    FormSetViewSet, StandardizedFieldViewSet,
    StandardizedFieldCategoryViewSet
)

router = routers.DefaultRouter()
router.register(r'templates', FormTemplateViewSet)
router.register(r'generated-forms', GeneratedFormViewSet)
router.register(r'form-generation-batches', FormGenerationBatchViewSet)
router.register(r'form-sets', FormSetViewSet)
router.register(r'standardized-fields', StandardizedFieldViewSet)
router.register(r'standardized-field-categories', StandardizedFieldCategoryViewSet)

# Create a nested router for field mappings under templates
templates_router = routers.NestedDefaultRouter(router, r'templates', lookup='template')
templates_router.register(r'field-mappings', FormFieldMappingViewSet, basename='template-field-mappings')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(templates_router.urls)),
] 