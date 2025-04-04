from rest_framework import serializers
from .models import DashboardMetrics, QuickAccessLink

class DashboardMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetrics
        fields = ['date', 'total_clients', 'active_clients', 'forms_generated',
                 'quota_usage', 'metrics_by_type', 'last_updated']

class QuickAccessLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickAccessLink
        fields = ['id', 'title', 'url', 'icon', 'order'] 