from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    BrokerCompanyViewSet,
    InsuranceCompanyAccountViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'broker-companies', BrokerCompanyViewSet, basename='broker-company')
router.register(r'insurance-accounts', InsuranceCompanyAccountViewSet, basename='insurance-account')

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] 