from rest_framework import serializers
from .models import Client
from .services import ClientDataService

class DynamicClientSerializer(serializers.ModelSerializer):
    """Serializer for the Client model with dynamic fields."""
    
    full_name = serializers.CharField(read_only=True)
    full_address = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'user', 'id_number', 'data', 'full_name', 'full_address', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Add dynamic fields to the representation."""
        ret = super().to_representation(instance)
        
        # Add convenient access to data fields
        if 'data' in ret and isinstance(ret['data'], dict):
            for key, value in ret['data'].items():
                ret[key] = value
        
        return ret
    
    def to_internal_value(self, data):
        """Extract dynamic fields to the data dictionary."""
        client_fields = {field['name'] for field in ClientDataService.get_client_fields()}
        dynamic_data = {}
        input_data = data.copy()
        
        # Extract client fields from the input data
        for field_name in list(input_data.keys()):
            if field_name in client_fields:
                dynamic_data[field_name] = input_data.pop(field_name)
        
        # Process the rest with the standard serializer
        internal_data = super().to_internal_value(input_data)
        
        # Add the dynamic data
        if 'data' not in internal_data:
            internal_data['data'] = {}
        internal_data['data'].update(dynamic_data)
        
        return internal_data
    
    def validate(self, data):
        """Validate the data."""
        validated_data = super().validate(data)
        
        # If we have dynamic data, validate it
        if 'data' in validated_data and validated_data['data']:
            errors = ClientDataService.validate_client_data(validated_data['data'])
            if errors:
                raise serializers.ValidationError(errors)
        
        return validated_data

class ClientListSerializer(serializers.ModelSerializer):
    """Serializer for listing clients with minimal fields."""
    
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'id_number', 'full_name', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']
    
    def to_representation(self, instance):
        """Add dynamic core fields to the representation."""
        ret = super().to_representation(instance)
        
        # Add core fields from client data
        core_fields = ClientDataService.get_core_client_fields()
        for field in core_fields:
            field_name = field['name']
            ret[field_name] = instance.get_field_value(field_name, '')
        
        return ret

# For backward compatibility
ClientSerializer = DynamicClientSerializer 