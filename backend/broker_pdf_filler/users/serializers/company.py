from rest_framework import serializers
from ..models import BrokerCompany, InsuranceCompanyAccount


class BrokerCompanySerializer(serializers.ModelSerializer):
    """Serializer for broker companies."""
    id = serializers.UUIDField(read_only=True)
    user_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = BrokerCompany
        fields = [
            'id',
            'name',
            'ia_reg_code',
            'mpfa_reg_code',
            'phone_number',
            'address',
            'responsible_officer_email',
            'contact_email',
            'created_at',
            'updated_at',
            'user_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_count']


class InsuranceCompanyAccountSerializer(serializers.ModelSerializer):
    """Serializer for InsuranceCompanyAccount model."""
    
    broker_company_name = serializers.CharField(source='broker_company.name', read_only=True)
    
    class Meta:
        model = InsuranceCompanyAccount
        fields = ['id', 'broker_company', 'broker_company_name', 'insurance_company', 
                  'account_code', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 