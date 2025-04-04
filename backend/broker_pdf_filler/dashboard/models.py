from django.db import models
from django.utils import timezone

class DashboardMetrics(models.Model):
    """Stores aggregated metrics for quick dashboard access"""
    date = models.DateField(default=timezone.now, db_index=True)
    total_clients = models.IntegerField(default=0)
    active_clients = models.IntegerField(default=0)
    forms_generated = models.IntegerField(default=0)
    quota_usage = models.FloatField(default=0.0)  # Percentage
    metrics_by_type = models.JSONField(default=dict)  # Detailed metrics by form type
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        get_latest_by = 'date'

    @classmethod
    def get_latest_metrics(cls):
        """Get the most recent metrics, with cache handling in view layer"""
        return cls.objects.first()

class QuickAccessLink(models.Model):
    """Configurable quick access links for dashboard"""
    title = models.CharField(max_length=100)
    url = models.CharField(max_length=200)
    icon = models.CharField(max_length=50)  # Material icon name
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title 