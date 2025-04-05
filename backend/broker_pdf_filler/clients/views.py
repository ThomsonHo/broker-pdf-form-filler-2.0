from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Client
from .serializers import ClientSerializer, ClientListSerializer
from .permissions import IsClientOwner

class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing clients.
    
    Provides CRUD operations for client management with:
    - Filtering by various fields
    - Search functionality across name, ID number, and contact info
    - Pagination
    - Export functionality
    """
    
    permission_classes = [IsAuthenticated, IsClientOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'nationality', 'country', 'city']
    search_fields = ['first_name', 'last_name', 'id_number', 'email', 'phone_number']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'id_number']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return clients belonging to the authenticated user."""
        return Client.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer
    
    def perform_create(self, serializer):
        """Set the user when creating a new client."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export client data in CSV format."""
        import csv
        from django.http import HttpResponse
        from datetime import datetime
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="clients_{datetime.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        # Write header
        writer.writerow([
            'ID', 'Full Name', 'ID Number', 'Email', 'Phone',
            'Address', 'City', 'Country', 'Created Date'
        ])
        
        # Write data
        clients = self.get_queryset()
        for client in clients:
            writer.writerow([
                client.id,
                client.full_name,
                client.id_number,
                client.email,
                client.phone_number,
                client.full_address,
                client.city,
                client.country,
                client.created_at.strftime('%Y-%m-%d')
            ])
        
        return response
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle client's active status."""
        client = self.get_object()
        client.is_active = not client.is_active
        client.save()
        return Response({'status': 'active status updated'})
    
    def filter_queryset(self, queryset):
        """Apply custom filtering."""
        queryset = super().filter_queryset(queryset)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        
        # Filter by name if provided
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(
                Q(first_name__icontains=name) |
                Q(last_name__icontains=name)
            )
        
        return queryset
