import json
from django.core.management.base import BaseCommand
from django.db import transaction
from broker_pdf_filler.clients.models import Client
from broker_pdf_filler.pdf_forms.models import StandardizedField

class Command(BaseCommand):
    help = 'Migrates client data from the old fixed schema to the new dynamic data model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-fields',
            action='store_true',
            help='Create StandardizedField entries for client fields',
        )
        parser.add_argument(
            '--migrate-data',
            action='store_true',
            help='Migrate client data to the new dynamic format',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate the migration without saving changes',
        )

    def handle(self, *args, **options):
        create_fields = options['create_fields']
        migrate_data = options['migrate_data']
        dry_run = options['dry_run']
        
        if not create_fields and not migrate_data:
            self.stdout.write(self.style.WARNING(
                'No action specified. Use --create-fields or --migrate-data.'
            ))
            return
        
        if create_fields:
            self.create_standardized_fields(dry_run)
        
        if migrate_data:
            self.migrate_client_data(dry_run)
            
    def create_standardized_fields(self, dry_run):
        """Create StandardizedField entries for all client fields."""
        # Define the client fields to migrate
        client_fields = [
            {
                'name': 'first_name',
                'label': 'First Name',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 10,
            },
            {
                'name': 'last_name',
                'label': 'Last Name',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 20,
            },
            {
                'name': 'date_of_birth',
                'label': 'Date of Birth',
                'field_type': 'date',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 30,
            },
            {
                'name': 'gender',
                'label': 'Gender',
                'field_type': 'select',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 40,
                'options': [
                    {'value': 'M', 'label': 'Male'},
                    {'value': 'F', 'label': 'Female'},
                    {'value': 'O', 'label': 'Other'},
                ],
            },
            {
                'name': 'marital_status',
                'label': 'Marital Status',
                'field_type': 'select',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 50,
                'options': [
                    {'value': 'single', 'label': 'Single'},
                    {'value': 'married', 'label': 'Married'},
                    {'value': 'divorced', 'label': 'Divorced'},
                    {'value': 'widowed', 'label': 'Widowed'},
                ],
            },
            {
                'name': 'nationality',
                'label': 'Nationality',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Personal Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 60,
            },
            {
                'name': 'phone_number',
                'label': 'Phone Number',
                'field_type': 'phone',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 10,
            },
            {
                'name': 'email',
                'label': 'Email',
                'field_type': 'email',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 20,
            },
            {
                'name': 'address_line1',
                'label': 'Address Line 1',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 30,
            },
            {
                'name': 'address_line2',
                'label': 'Address Line 2',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 40,
            },
            {
                'name': 'city',
                'label': 'City',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 50,
            },
            {
                'name': 'state',
                'label': 'State/Province',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 60,
            },
            {
                'name': 'postal_code',
                'label': 'Postal Code',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 70,
            },
            {
                'name': 'country',
                'label': 'Country',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Contact Information',
                'is_required': True,
                'is_client_field': True,
                'is_core_field': True,
                'is_filterable': True,
                'display_order': 80,
            },
            {
                'name': 'employer',
                'label': 'Employer',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Employment Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 10,
            },
            {
                'name': 'occupation',
                'label': 'Occupation',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Employment Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 20,
            },
            {
                'name': 'work_address',
                'label': 'Work Address',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Employment Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 30,
            },
            {
                'name': 'annual_income',
                'label': 'Annual Income',
                'field_type': 'number',
                'field_category': 'client',
                'display_category': 'Financial Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 10,
            },
            {
                'name': 'monthly_expenses',
                'label': 'Monthly Expenses',
                'field_type': 'number',
                'field_category': 'client',
                'display_category': 'Financial Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 20,
            },
            {
                'name': 'tax_residency',
                'label': 'Tax Residency',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Financial Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': True,
                'display_order': 30,
            },
            {
                'name': 'payment_method',
                'label': 'Payment Method',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Payment Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 10,
            },
            {
                'name': 'payment_period',
                'label': 'Payment Period',
                'field_type': 'text',
                'field_category': 'client',
                'display_category': 'Payment Information',
                'is_required': False,
                'is_client_field': True,
                'is_core_field': False,
                'is_filterable': False,
                'display_order': 20,
            },
        ]
        
        count = 0
        for field_data in client_fields:
            name = field_data['name']
            field, created = StandardizedField.objects.get_or_create(
                name=name,
                defaults={
                    'label': field_data['label'],
                    'field_type': field_data['field_type'],
                    'field_category': field_data['field_category'],
                    'display_category': field_data['display_category'],
                    'is_required': field_data['is_required'],
                    'is_client_field': field_data['is_client_field'],
                    'is_core_field': field_data['is_core_field'],
                    'is_filterable': field_data['is_filterable'],
                    'display_order': field_data['display_order'],
                    'is_active': True,
                    'options': field_data.get('options'),
                }
            )
            
            if not created:
                # Update existing field
                field.is_client_field = field_data['is_client_field']
                field.is_core_field = field_data['is_core_field']
                field.is_filterable = field_data['is_filterable']
                field.display_order = field_data['display_order']
                
                if 'options' in field_data:
                    field.options = field_data['options']
                
                if not dry_run:
                    field.save()
            
            status = 'Created' if created else 'Updated'
            if not dry_run or created:
                count += 1
            
            self.stdout.write(f"{status} field: {name}")
        
        msg = f"{'Would create' if dry_run else 'Created/updated'} {count} standardized fields"
        self.stdout.write(self.style.SUCCESS(msg))
    
    def migrate_client_data(self, dry_run):
        """Migrate client data from fixed fields to dynamic data."""
        # Get all clients
        clients = Client.objects.all()
        count = 0
        
        # Use a transaction to ensure atomicity
        with transaction.atomic():
            for client in clients:
                # Skip clients that already have data
                if client.data and len(client.data) > 0:
                    continue
                
                # Create data dictionary for the client
                data = {
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'date_of_birth': client.date_of_birth,
                    'gender': client.gender,
                    'marital_status': client.marital_status,
                    'nationality': client.nationality,
                    'phone_number': client.phone_number,
                    'email': client.email,
                    'address_line1': client.address_line1,
                    'address_line2': client.address_line2,
                    'city': client.city,
                    'state': client.state,
                    'postal_code': client.postal_code,
                    'country': client.country,
                }
                
                # Remove None values
                data = {k: v for k, v in data.items() if v is not None}
                
                if not dry_run:
                    client.data = data
                    client.save()
                
                count += 1
                self.stdout.write(f"Migrated client: {client.id_number}")
        
        msg = f"{'Would migrate' if dry_run else 'Migrated'} {count} clients"
        self.stdout.write(self.style.SUCCESS(msg)) 