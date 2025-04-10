from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Client
from .serializers import ClientSerializer, ClientListSerializer, DynamicClientSerializer
from .permissions import IsClientOwner
from .services import ClientDataService

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
    filterset_fields = ['is_active', 'id_number']
    ordering_fields = ['created_at', 'id_number']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return clients belonging to the authenticated user."""
        return Client.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ClientListSerializer
        return DynamicClientSerializer
    
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
        
        # Get all client fields
        client_fields = ClientDataService.get_client_fields()
        field_names = ['ID', 'ID Number', 'Created Date', 'Active']
        field_keys = ['id', 'id_number', 'created_at', 'is_active']
        
        # Add dynamic fields
        for field in client_fields:
            field_names.append(field['label'])
            field_keys.append(field['name'])
        
        writer = csv.writer(response)
        # Write header
        writer.writerow(field_names)
        
        # Write data
        clients = self.get_queryset()
        for client in clients:
            row = []
            for key in field_keys:
                if key == 'id':
                    row.append(str(client.id))
                elif key == 'id_number':
                    row.append(client.id_number)
                elif key == 'created_at':
                    row.append(client.created_at.strftime('%Y-%m-%d'))
                elif key == 'is_active':
                    row.append('Yes' if client.is_active else 'No')
                else:
                    # Dynamic field
                    row.append(client.get_field_value(key, ''))
            writer.writerow(row)
        
        return response
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle client's active status."""
        client = self.get_object()
        client.is_active = not client.is_active
        client.save()
        return Response({'status': 'active status updated'})
    
    @action(detail=False, methods=['get'])
    def field_definitions(self, request):
        """Return definitions of client fields."""
        client_fields = ClientDataService.get_client_fields()
        return Response(client_fields)
    
    @action(detail=False, methods=['get'])
    def core_fields(self, request):
        """Return definitions of core client fields."""
        core_fields = ClientDataService.get_core_client_fields()
        return Response(core_fields)
    
    @action(detail=False, methods=['get'])
    def filterable_fields(self, request):
        """Return definitions of filterable client fields."""
        filterable_fields = ClientDataService.get_filterable_client_fields()
        return Response(filterable_fields)
    
    def filter_queryset(self, queryset):
        """Apply custom filtering, including handling dynamic fields."""
        queryset = super().filter_queryset(queryset)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        
        # Get all filterable fields
        filterable_fields = ClientDataService.get_filterable_client_fields()
        field_names = [field['name'] for field in filterable_fields]
        
        # Apply dynamic field filters
        for field_name in field_names:
            field_value = self.request.query_params.get(field_name)
            if field_value:
                # Construct a JSON path query for the dynamic field
                queryset = queryset.filter(**{f'data__{field_name}': field_value})
        
        # Special case for name search across first_name and last_name
        name = self.request.query_params.get('name')
        if name:
            # Search in both first_name and last_name in the JSON field
            queryset = queryset.filter(
                Q(data__first_name__icontains=name) |
                Q(data__last_name__icontains=name)
            )
        
        return queryset
