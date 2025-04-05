from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import Client
from datetime import date

User = get_user_model()

class ClientModelTests(TestCase):
    """Test the Client model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client_data = {
            'user': self.user,
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': date(1990, 1, 1),
            'gender': 'M',
            'marital_status': 'single',
            'id_number': 'A1234567',
            'nationality': 'Hong Kong',
            'phone_number': '+85212345678',
            'email': 'john@example.com',
            'address_line1': '123 Main St',
            'city': 'Hong Kong',
            'state': 'Hong Kong',
            'postal_code': '999077',
            'country': 'Hong Kong'
        }
    
    def test_create_client(self):
        """Test creating a client."""
        client = Client.objects.create(**self.client_data)
        self.assertEqual(client.full_name, 'John Doe')
        self.assertTrue(client.is_active)
    
    def test_client_str_representation(self):
        """Test the string representation of a client."""
        client = Client.objects.create(**self.client_data)
        expected_str = f"John Doe (A1234567)"
        self.assertEqual(str(client), expected_str)
    
    def test_full_address_property(self):
        """Test the full_address property."""
        client = Client.objects.create(**self.client_data)
        expected_address = "123 Main St, Hong Kong, Hong Kong, 999077, Hong Kong"
        self.assertEqual(client.full_address, expected_address)
        
        # Test with address_line2
        client.address_line2 = 'Apt 4B'
        client.save()
        expected_address = "123 Main St, Apt 4B, Hong Kong, Hong Kong, 999077, Hong Kong"
        self.assertEqual(client.full_address, expected_address)

class ClientAPITests(APITestCase):
    """Test the Client API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.client_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': '1990-01-01',
            'gender': 'M',
            'marital_status': 'single',
            'id_number': 'A1234567',
            'nationality': 'Hong Kong',
            'phone_number': '+85212345678',
            'email': 'john@example.com',
            'address_line1': '123 Main St',
            'city': 'Hong Kong',
            'state': 'Hong Kong',
            'postal_code': '999077',
            'country': 'Hong Kong'
        }
    
    def test_create_client(self):
        """Test creating a client through the API."""
        url = reverse('client-list')
        response = self.client.post(url, self.client_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.get().first_name, 'John')
    
    def test_list_clients(self):
        """Test listing clients."""
        # Create a client first
        Client.objects.create(user=self.user, **self.client_data)
        
        url = reverse('client-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_retrieve_client(self):
        """Test retrieving a specific client."""
        client = Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-detail', args=[client.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'John')
    
    def test_update_client(self):
        """Test updating a client."""
        client = Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-detail', args=[client.id])
        updated_data = self.client_data.copy()
        updated_data['first_name'] = 'Jane'
        
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Client.objects.get().first_name, 'Jane')
    
    def test_delete_client(self):
        """Test deleting a client."""
        client = Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-detail', args=[client.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 0)
    
    def test_export_clients(self):
        """Test exporting clients to CSV."""
        Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-export')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
    
    def test_toggle_active(self):
        """Test toggling client active status."""
        client = Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-toggle-active', args=[client.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Client.objects.get().is_active)
        
        # Toggle back
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Client.objects.get().is_active)
    
    def test_search_clients(self):
        """Test searching clients."""
        Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-list')
        response = self.client.get(url, {'search': 'John'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        response = self.client.get(url, {'search': 'Nonexistent'})
        self.assertEqual(len(response.data['results']), 0)
    
    def test_filter_clients(self):
        """Test filtering clients."""
        Client.objects.create(user=self.user, **self.client_data)
        url = reverse('client-list')
        
        # Filter by city
        response = self.client.get(url, {'city': 'Hong Kong'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Filter by non-existent city
        response = self.client.get(url, {'city': 'Tokyo'})
        self.assertEqual(len(response.data['results']), 0)
