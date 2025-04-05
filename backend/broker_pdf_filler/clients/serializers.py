from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    """Serializer for the Client model."""
    
    full_name = serializers.CharField(read_only=True)
    full_address = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'marital_status', 'id_number',
            'nationality', 'phone_number', 'email', 'address_line1',
            'address_line2', 'city', 'state', 'postal_code', 'country',
            'full_address', 'employer', 'occupation', 'work_address',
            'annual_income', 'monthly_expenses', 'tax_residency',
            'payment_method', 'payment_period', 'created_at', 'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_id_number(self, value):
        """Validate that the ID number is unique."""
        if self.instance and self.instance.id_number == value:
            return value
        if Client.objects.filter(id_number=value).exists():
            raise serializers.ValidationError("A client with this ID number already exists.")
        return value
    
    def validate(self, data):
        """Validate the data."""
        # Ensure email is provided if phone number is not
        if not data.get('email') and not data.get('phone_number'):
            raise serializers.ValidationError(
                "Either email or phone number must be provided."
            )
        
        # Validate address fields
        if data.get('address_line2') and not data.get('address_line1'):
            raise serializers.ValidationError(
                "Address line 1 is required when address line 2 is provided."
            )
        
        return data

class ClientListSerializer(serializers.ModelSerializer):
    """Serializer for listing clients with minimal fields."""
    
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'full_name', 'id_number', 'phone_number', 'email',
            'city', 'country', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at'] 