from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, date

from ..users.models import User
from ..clients.models import Client
from ..pdf_forms.models import FormGenerationBatch
from .models import DashboardMetrics, QuickAccessLink

class DashboardMetricsModelTests(TestCase):
    def test_get_latest_metrics(self):
        # Create some metrics
        older_metrics = DashboardMetrics.objects.create(
            date=timezone.now().date() - timedelta(days=1),
            total_clients=50,
            active_clients=30,
            forms_generated=100,
            quota_usage=50.0
        )
        latest_metrics = DashboardMetrics.objects.create(
            date=timezone.now().date(),
            total_clients=100,
            active_clients=60,
            forms_generated=200,
            quota_usage=75.0
        )

        # Test get_latest_metrics
        result = DashboardMetrics.get_latest_metrics()
        self.assertEqual(result, latest_metrics)

class DashboardAPITests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

        # Create test client
        self.test_client = Client.objects.create(
            user=self.user,
            first_name='Test',
            last_name='Client',
            date_of_birth=date(1990, 1, 1),
            gender='M',
            marital_status='single',
            id_number='TEST123',
            nationality='Test Country',
            phone_number='1234567890',
            email='client@example.com',
            address_line1='123 Test St',
            city='Test City',
            state='Test State',
            postal_code='12345',
            country='Test Country'
        )

        # Create test data
        self.metrics = DashboardMetrics.objects.create(
            date=timezone.now().date(),
            total_clients=100,
            active_clients=60,
            forms_generated=200,
            quota_usage=75.0,
            metrics_by_type={'Type A': 100, 'Type B': 100}
        )

        # Create test form generation batch
        self.form_batch = FormGenerationBatch.objects.create(
            user=self.user,
            client=self.test_client,
            status='completed',
            insurer='Test Insurer',
            created_at=timezone.make_aware(timezone.datetime(2025, 4, 1))
        )

        # Print quick links before setup
        print("\nQuick links before setup:")
        for link in QuickAccessLink.objects.all():
            print(f"- {link.title} (active: {link.is_active})")

        # Deactivate all existing quick links
        QuickAccessLink.objects.all().update(is_active=False)

        # Create test quick link
        self.quick_link = QuickAccessLink.objects.create(
            title='New Client',
            url='/clients/new',
            icon='person_add',
            order=1,
            is_active=True
        )

        # Print quick links after setup
        print("\nQuick links after setup:")
        for link in QuickAccessLink.objects.all():
            print(f"- {link.title} (active: {link.is_active})")

    def test_get_dashboard_metrics(self):
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('metrics', data)
        self.assertIn('quick_links', data)
        self.assertIn('user_quota', data)

        metrics = data['metrics']
        self.assertEqual(metrics['total_clients'], 100)  # From the metrics created in setUp
        self.assertEqual(metrics['active_clients'], 60)  # From the metrics created in setUp
        self.assertEqual(metrics['forms_generated'], 200)  # From the metrics created in setUp
        self.assertEqual(metrics['quota_usage'], 75.0)  # From the metrics created in setUp

    def test_get_quick_links(self):
        url = reverse('quick-links-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        print(f"\nQuick links response data: {data}")
        
        # Check pagination structure
        self.assertIn('count', data)
        self.assertIn('results', data)
        
        # There should be one active quick link
        self.assertEqual(data['count'], 1)
        results = data['results']
        self.assertEqual(len(results), 1)
        
        # Check the quick link data
        test_link = results[0]
        self.assertEqual(test_link['title'], 'New Client')
        self.assertEqual(test_link['url'], '/clients/new')
        self.assertEqual(test_link['icon'], 'person_add')

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
