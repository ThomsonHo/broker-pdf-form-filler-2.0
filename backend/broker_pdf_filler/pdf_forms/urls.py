from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'templates', views.FormTemplateViewSet)
router.register(r'batches', views.FormGenerationBatchViewSet, basename='batch')
router.register(r'forms', views.GeneratedFormViewSet, basename='form')

urlpatterns = [
    path('', include(router.urls)),
] 