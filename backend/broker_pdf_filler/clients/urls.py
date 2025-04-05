from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet
from .test_view import TestPostView

router = DefaultRouter()
router.register(r'', ClientViewSet, basename='client')

urlpatterns = [
    path('', include(router.urls)),
    path('test-post/', TestPostView.as_view(), name='test-post'),
] 
