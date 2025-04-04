from rest_framework import serializers
from ..models import BrokerCompany, InsuranceCompanyAccount


class BrokerCompanySerializer(serializers.ModelSerializer):
    """Serializer for BrokerCompany model."""
    
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BrokerCompany
        fields = ['id', 'name', 'code', 'user_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_count(self, obj):
        """Get the number of users associated with the broker company."""
        return obj.users.count()


class InsuranceCompanyAccountSerializer(serializers.ModelSerializer):
    """Serializer for InsuranceCompanyAccount model."""
    
    broker_company_name = serializers.CharField(source='broker_company.name', read_only=True)
    
    class Meta:
        model = InsuranceCompanyAccount
        fields = ['id', 'broker_company', 'broker_company_name', 'insurance_company', 
                  'account_code', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 