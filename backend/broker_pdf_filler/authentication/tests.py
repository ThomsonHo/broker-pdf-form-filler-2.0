from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from broker_pdf_filler.users.models import UserActivity, BrokerCompany

User = get_user_model()


class AuthenticationTests(TestCase):
    """Tests for authentication endpoints."""
    
    def setUp(self):
        """Set up test data."""
        # Create a broker company
        self.broker_company = BrokerCompany.objects.create(
            name='Test Broker Company',
            code='TBC'
        )
        
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User',
            role='standard',
            broker_company=self.broker_company
        )
        
        # Create API client
        self.client = APIClient()
    
    def test_login_success(self):
        """Test successful login."""
        url = reverse('authentication:login')
        data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user=self.user,
            action='login'
        ).exists())
    
    def test_login_failure(self):
        """Test failed login."""
        url = reverse('authentication:login')
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout(self):
        """Test logout."""
        # Login first
        refresh = RefreshToken.for_user(self.user)
        
        url = reverse('authentication:logout')
        data = {'refresh': str(refresh)}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user=self.user,
            action='logout'
        ).exists())
    
    def test_token_refresh(self):
        """Test token refresh."""
        # Get initial tokens
        refresh = RefreshToken.for_user(self.user)
        
        url = reverse('authentication:token_refresh')
        data = {'refresh': str(refresh)}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_password_reset_request(self):
        """Test password reset request."""
        url = reverse('authentication:password_reset_request')
        data = {'email': 'test@example.com'}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user=self.user,
            action='password_reset_request'
        ).exists())
        
        # Check that token was generated
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.reset_password_token)
        self.assertIsNotNone(self.user.reset_password_token_expiry)
    
    def test_password_reset_confirm(self):
        """Test password reset confirmation."""
        # Generate reset token
        token = 'test-token'
        self.user.reset_password_token = token
        self.user.reset_password_token_expiry = timezone.now() + timedelta(hours=24)
        self.user.save()
        
        url = reverse('authentication:password_reset_confirm')
        data = {
            'token': token,
            'new_password': 'newpassword123',
            'confirm_password': 'newpassword123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user=self.user,
            action='password_reset'
        ).exists())
        
        # Check that token was cleared
        self.user.refresh_from_db()
        self.assertIsNone(self.user.reset_password_token)
        self.assertIsNone(self.user.reset_password_token_expiry)
        
        # Check that new password works
        self.assertTrue(self.user.check_password('newpassword123'))
    
    def test_password_change(self):
        """Test password change."""
        # Login first
        self.client.force_authenticate(user=self.user)
        
        url = reverse('authentication:password_change')
        data = {
            'current_password': 'testpassword123',
            'new_password': 'newpassword123',
            'confirm_password': 'newpassword123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that activity was logged
        self.assertTrue(UserActivity.objects.filter(
            user=self.user,
            action='password_change'
        ).exists())
        
        # Check that new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
