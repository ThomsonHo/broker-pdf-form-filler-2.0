from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import DashboardMetrics, QuickAccessLink
from .serializers import DashboardMetricsSerializer, QuickAccessLinkSerializer
from ..users.models import User
from ..pdf_forms.models import FormGenerationBatch
from ..clients.models import Client

class DashboardViewSet(APIView):
    permission_classes = [IsAuthenticated]
    
    @method_decorator(cache_page(60))  # Cache for 1 minute
    def get(self, request):
        # Get or calculate latest metrics
        metrics = DashboardMetrics.get_latest_metrics()
        if not metrics or metrics.date != timezone.now().date():
            metrics = self._calculate_metrics()
        
        # Get quick access links
        quick_links = QuickAccessLink.objects.filter(is_active=True)
        
        return Response({
            'metrics': DashboardMetricsSerializer(metrics).data,
            'quick_links': QuickAccessLinkSerializer(quick_links, many=True).data,
            'user_quota': self._get_user_quota(request.user)
        })
    
    def _calculate_metrics(self):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Calculate metrics
        total_clients = Client.objects.count()
        active_clients = Client.objects.filter(
            formgenerationbatch__created_at__gte=thirty_days_ago
        ).distinct().count()
        
        forms_generated = FormGenerationBatch.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        # Calculate quota usage
        total_quota = User.objects.aggregate(
            total=Sum('monthly_form_quota')
        )['total'] or 0
        used_quota = FormGenerationBatch.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        quota_usage = (used_quota / total_quota * 100) if total_quota > 0 else 0
        
        # Get metrics by form type
        metrics_by_type = FormGenerationBatch.objects.filter(
            created_at__gte=thirty_days_ago
        ).values('form_type').annotate(
            count=Count('id')
        )
        
        # Create new metrics record
        metrics = DashboardMetrics.objects.create(
            date=today,
            total_clients=total_clients,
            active_clients=active_clients,
            forms_generated=forms_generated,
            quota_usage=quota_usage,
            metrics_by_type={
                item['form_type']: item['count'] 
                for item in metrics_by_type
            }
        )
        return metrics
    
    def _get_user_quota(self, user):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        used_quota = FormGenerationBatch.objects.filter(
            user=user,
            created_at__gte=start_of_month
        ).count()
        
        return {
            'used': used_quota,
            'total': user.monthly_form_quota,
            'remaining': max(0, user.monthly_form_quota - used_quota)
        }

class QuickAccessLinkViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = QuickAccessLink.objects.filter(is_active=True)
    serializer_class = QuickAccessLinkSerializer 