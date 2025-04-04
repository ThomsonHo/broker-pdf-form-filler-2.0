from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import BrokerCompany, UserActivity, UserQuotaUsage

User = get_user_model()


class UserViewSetTests(TestCase):
    """Tests for the UserViewSet."""
    
    def setUp(self):
        """Set up test data."""
        # Create a broker company
        self.broker_company = BrokerCompany.objects.create(
            name='Test Broker Company',
            code='TBC'
        )
        
        # Create a superuser
        self.superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User'
        )
        
        # Create a standard user
        self.standard_user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            first_name='Standard',
            last_name='User',
            role='standard',
            broker_company=self.broker_company
        )
        
        # Create an admin user
        self.admin_user = User.objects.create_user(
            email='admin2@example.com',
            password='password123',
            first_name='Admin',
            last_name='User2',
            role='admin',
            broker_company=self.broker_company
        )
        
        # Create API client
        self.client = APIClient()
    
    def test_user_registration(self):
        """Test user registration."""
        url = reverse('user-register')
        data = {
            'email': 'newuser@example.com',
            'password': 'password123',
            'password_confirm': 'password123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'standard'
        }
        
        response = self.client.post(url, data, format='json')
        print("Registration response:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 4)  # 3 from setUp + 1 new
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user__email='newuser@example.com',
            action='user_created'
        ).exists())
        
        # Check that quota usage was created
        self.assertTrue(UserQuotaUsage.objects.filter(
            user__email='newuser@example.com'
        ).exists())
    
    def test_user_list_as_superuser(self):
        """Test user list as superuser."""
        self.client.force_authenticate(user=self.superuser)
        url = reverse('user-list')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # All users (superuser, admin user, standard user)
    
    def test_user_list_as_admin(self):
        """Test user list as admin user."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('user-list')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only users from same broker company
    
    def test_user_list_as_standard_user(self):
        """Test user list as standard user."""
        self.client.force_authenticate(user=self.standard_user)
        url = reverse('user-list')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only the user itself
    
    def test_me_endpoint(self):
        """Test the me endpoint."""
        self.client.force_authenticate(user=self.standard_user)
        url = reverse('user-me')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'user@example.com')
    
    def test_quota_usage_endpoint(self):
        """Test the quota usage endpoint."""
        self.client.force_authenticate(user=self.standard_user)
        url = reverse('user-quota-usage')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['daily_usage'], 0)
        self.assertEqual(response.data['monthly_usage'], 0)
        self.assertEqual(response.data['daily_quota'], 10)
        self.assertEqual(response.data['monthly_quota'], 300)
        self.assertTrue(response.data['has_daily_quota'])
        self.assertTrue(response.data['has_monthly_quota'])
