from django.core.management.base import BaseCommand
from django.core.files import File
import os
import uuid
from broker_pdf_filler.pdf_forms.models import FormTemplate, FormFieldMapping

class Command(BaseCommand):
    help = 'Populates the database with sample form templates'

    def handle(self, *args, **options):
        self.stdout.write('Populating form templates...')
        
        # Define template data
        templates = [
            {
                'name': 'Broker Application Form',
                'file_name': 'broker_application.pdf',
                'description': 'Standard broker application form',
                'category': 'broker',
                'field_mappings': [
                    {'pdf_field_name': 'fullName', 'system_field_name': 'fullName'},
                    {'pdf_field_name': 'fullNameChinese', 'system_field_name': 'fullNameChinese'},
                    {'pdf_field_name': 'dateOfBirth', 'system_field_name': 'dateOfBirth'},
                    {'pdf_field_name': 'gender', 'system_field_name': 'gender'},
                    {'pdf_field_name': 'idType', 'system_field_name': 'idType'},
                    {'pdf_field_name': 'idNumber', 'system_field_name': 'idNumber'},
                    {'pdf_field_name': 'address', 'system_field_name': 'address'},
                    {'pdf_field_name': 'phone', 'system_field_name': 'phone'},
                    {'pdf_field_name': 'email', 'system_field_name': 'email'},
                ]
            },
            {
                'name': 'Broker FNA Form',
                'file_name': 'broker_fna.pdf',
                'description': 'Financial Needs Analysis form for brokers',
                'category': 'broker',
                'field_mappings': [
                    {'pdf_field_name': 'fullName', 'system_field_name': 'fullName'},
                    {'pdf_field_name': 'fullNameChinese', 'system_field_name': 'fullNameChinese'},
                    {'pdf_field_name': 'dateOfBirth', 'system_field_name': 'dateOfBirth'},
                    {'pdf_field_name': 'occupation', 'system_field_name': 'occupation'},
                    {'pdf_field_name': 'annualIncome', 'system_field_name': 'annualIncome'},
                    {'pdf_field_name': 'investmentExperience', 'system_field_name': 'investmentExperience'},
                    {'pdf_field_name': 'riskTolerance', 'system_field_name': 'riskTolerance'},
                    {'pdf_field_name': 'investmentGoals', 'system_field_name': 'investmentGoals'},
                ]
            },
            {
                'name': 'Chubb Application Form',
                'file_name': 'chubb_application.pdf',
                'description': 'Standard Chubb insurance application form',
                'category': 'chubb',
                'field_mappings': [
                    {'pdf_field_name': 'fullName', 'system_field_name': 'fullName'},
                    {'pdf_field_name': 'fullNameChinese', 'system_field_name': 'fullNameChinese'},
                    {'pdf_field_name': 'dateOfBirth', 'system_field_name': 'dateOfBirth'},
                    {'pdf_field_name': 'gender', 'system_field_name': 'gender'},
                    {'pdf_field_name': 'idType', 'system_field_name': 'idType'},
                    {'pdf_field_name': 'idNumber', 'system_field_name': 'idNumber'},
                    {'pdf_field_name': 'address', 'system_field_name': 'address'},
                    {'pdf_field_name': 'phone', 'system_field_name': 'phone'},
                    {'pdf_field_name': 'email', 'system_field_name': 'email'},
                    {'pdf_field_name': 'occupation', 'system_field_name': 'occupation'},
                    {'pdf_field_name': 'annualIncome', 'system_field_name': 'annualIncome'},
                ]
            },
            {
                'name': 'Chubb FNA Form',
                'file_name': 'chubb_fna.pdf',
                'description': 'Financial Needs Analysis form for Chubb insurance',
                'category': 'chubb',
                'field_mappings': [
                    {'pdf_field_name': 'fullName', 'system_field_name': 'fullName'},
                    {'pdf_field_name': 'fullNameChinese', 'system_field_name': 'fullNameChinese'},
                    {'pdf_field_name': 'dateOfBirth', 'system_field_name': 'dateOfBirth'},
                    {'pdf_field_name': 'occupation', 'system_field_name': 'occupation'},
                    {'pdf_field_name': 'annualIncome', 'system_field_name': 'annualIncome'},
                    {'pdf_field_name': 'investmentExperience', 'system_field_name': 'investmentExperience'},
                    {'pdf_field_name': 'riskTolerance', 'system_field_name': 'riskTolerance'},
                    {'pdf_field_name': 'investmentGoals', 'system_field_name': 'investmentGoals'},
                    {'pdf_field_name': 'insuranceNeeds', 'system_field_name': 'insuranceNeeds'},
                ]
            },
        ]
        
        # Create templates directory if it doesn't exist
        templates_dir = os.path.join('broker_pdf_filler', 'pdf_forms', 'templates')
        os.makedirs(templates_dir, exist_ok=True)
        
        # Create templates
        for template_data in templates:
            # Check if template already exists
            if FormTemplate.objects.filter(name=template_data['name']).exists():
                self.stdout.write(f"Template {template_data['name']} already exists, skipping...")
                continue
            
            # Create empty PDF file if it doesn't exist
            file_path = os.path.join(templates_dir, template_data['category'], template_data['file_name'])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            if not os.path.exists(file_path):
                with open(file_path, 'wb') as f:
                    f.write(b'%PDF-1.4\n%EOF\n')
            
            # Create template
            template = FormTemplate.objects.create(
                name=template_data['name'],
                file_name=template_data['file_name'],
                description=template_data['description'],
                category=template_data['category'],
                is_active=True
            )
            
            # Add template file
            with open(file_path, 'rb') as f:
                template.template_file.save(template_data['file_name'], File(f), save=True)
            
            # Create field mappings
            for mapping in template_data['field_mappings']:
                FormFieldMapping.objects.create(
                    template=template,
                    pdf_field_name=mapping['pdf_field_name'],
                    system_field_name=mapping['system_field_name']
                )
            
            self.stdout.write(f"Created template: {template_data['name']}")
        
        self.stdout.write(self.style.SUCCESS('Successfully populated form templates')) 