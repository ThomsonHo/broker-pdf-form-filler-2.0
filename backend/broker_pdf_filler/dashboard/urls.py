from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, QuickAccessLinkViewSet

router = DefaultRouter()
router.register(r'quick-links', QuickAccessLinkViewSet, basename='quick-links')

urlpatterns = [
    path('metrics/', DashboardViewSet.as_view(), name='dashboard-metrics'),
    path('', include(router.urls)),
] 