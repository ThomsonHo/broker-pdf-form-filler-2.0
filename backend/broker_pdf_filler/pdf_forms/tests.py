from django.test import TestCase
import os
import tempfile
from django.core.files import File
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.test import APITestCase
from rest_framework import status
from .models import FormTemplate, FormFieldMapping, GeneratedForm, FormGenerationBatch
from .services import PDFFormFiller, FormGenerationService
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from broker_pdf_filler.clients.models import Client

User = get_user_model()

class PDFFormFillerTests(TestCase):
    """Tests for the PDF form filling service."""
    
    def setUp(self):
        """Set up test data."""
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        # Create test client
        self.client = Client.objects.create(
            user=self.user,
            name='Test Client',
            full_name='Test Client',
            full_name_chinese='測試客戶',
            date_of_birth='1990-01-01',
            gender='M',
            id_type='HKID',
            id_number='A1234567',
            address='123 Test Street',
            phone='12345678',
            email='client@example.com',
            occupation='Engineer',
            annual_income=500000,
            investment_experience='Intermediate',
            risk_tolerance='Moderate',
            investment_goals='Growth',
            insurance_needs='Life Insurance'
        )
        
        # Create test template
        self.template = FormTemplate.objects.create(
            name='Test Template',
            file_name='test_template.pdf',
            description='Test template for unit tests',
            category='broker',
            is_active=True
        )
        
        # Create test PDF file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b'%PDF-1.4\n%EOF\n')
            temp_file_path = temp_file.name
        
        # Add template file
        with open(temp_file_path, 'rb') as f:
            self.template.template_file.save('test_template.pdf', SimpleUploadedFile('test_template.pdf', f.read()), save=True)
        
        # Create field mappings
        self.field_mappings = [
            {'pdf_field_name': 'fullName', 'system_field_name': 'full_name'},
            {'pdf_field_name': 'fullNameChinese', 'system_field_name': 'full_name_chinese'},
            {'pdf_field_name': 'dateOfBirth', 'system_field_name': 'date_of_birth'},
            {'pdf_field_name': 'gender', 'system_field_name': 'gender'},
            {'pdf_field_name': 'idType', 'system_field_name': 'id_type'},
            {'pdf_field_name': 'idNumber', 'system_field_name': 'id_number'},
            {'pdf_field_name': 'address', 'system_field_name': 'address'},
            {'pdf_field_name': 'phone', 'system_field_name': 'phone'},
            {'pdf_field_name': 'email', 'system_field_name': 'email'},
            {'pdf_field_name': 'occupation', 'system_field_name': 'occupation'},
            {'pdf_field_name': 'annualIncome', 'system_field_name': 'annual_income'},
            {'pdf_field_name': 'investmentExperience', 'system_field_name': 'investment_experience'},
            {'pdf_field_name': 'riskTolerance', 'system_field_name': 'risk_tolerance'},
            {'pdf_field_name': 'investmentGoals', 'system_field_name': 'investment_goals'},
            {'pdf_field_name': 'insuranceNeeds', 'system_field_name': 'insurance_needs'},
        ]
        
        for mapping in self.field_mappings:
            FormFieldMapping.objects.create(
                template=self.template,
                pdf_field_name=mapping['pdf_field_name'],
                system_field_name=mapping['system_field_name']
            )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
    
    def test_field_mapping(self):
        """Test field mapping functionality."""
        # Create client data dictionary
        client_data = {
            'full_name': self.client.full_name,
            'full_name_chinese': self.client.full_name_chinese,
            'date_of_birth': self.client.date_of_birth,
            'gender': self.client.gender,
            'id_type': self.client.id_type,
            'id_number': self.client.id_number,
            'address': self.client.address,
            'phone': self.client.phone,
            'email': self.client.email,
            'occupation': self.client.occupation,
            'annual_income': self.client.annual_income,
            'investment_experience': self.client.investment_experience,
            'risk_tolerance': self.client.risk_tolerance,
            'investment_goals': self.client.investment_goals,
            'insurance_needs': self.client.insurance_needs,
        }
        
        # Create PDF form filler
        filler = PDFFormFiller(self.template, client_data)
        
        # Test field mapping
        self.assertEqual(filler._map_field_value('fullName'), self.client.full_name)
        self.assertEqual(filler._map_field_value('fullNameChinese'), self.client.full_name_chinese)
        self.assertEqual(filler._map_field_value('dateOfBirth'), str(self.client.date_of_birth))
        self.assertEqual(filler._map_field_value('gender'), self.client.gender)
        self.assertEqual(filler._map_field_value('idType'), self.client.id_type)
        self.assertEqual(filler._map_field_value('idNumber'), self.client.id_number)
        self.assertEqual(filler._map_field_value('address'), self.client.address)
        self.assertEqual(filler._map_field_value('phone'), self.client.phone)
        self.assertEqual(filler._map_field_value('email'), self.client.email)
        self.assertEqual(filler._map_field_value('occupation'), self.client.occupation)
        self.assertEqual(filler._map_field_value('annualIncome'), str(self.client.annual_income))
        self.assertEqual(filler._map_field_value('investmentExperience'), self.client.investment_experience)
        self.assertEqual(filler._map_field_value('riskTolerance'), self.client.risk_tolerance)
        self.assertEqual(filler._map_field_value('investmentGoals'), self.client.investment_goals)
        self.assertEqual(filler._map_field_value('insuranceNeeds'), self.client.insurance_needs)
    
    def test_form_generation(self):
        """Test form generation functionality."""
        # Create client data dictionary
        client_data = {
            'full_name': self.client.full_name,
            'full_name_chinese': self.client.full_name_chinese,
            'date_of_birth': self.client.date_of_birth,
            'gender': self.client.gender,
            'id_type': self.client.id_type,
            'id_number': self.client.id_number,
            'address': self.client.address,
            'phone': self.client.phone,
            'email': self.client.email,
            'occupation': self.client.occupation,
            'annual_income': self.client.annual_income,
            'investment_experience': self.client.investment_experience,
            'risk_tolerance': self.client.risk_tolerance,
            'investment_goals': self.client.investment_goals,
            'insurance_needs': self.client.insurance_needs,
        }
        
        # Create batch
        batch = FormGenerationService.create_batch(
            user=self.user,
            client=self.client,
            insurer='Test Insurer'
        )
        
        # Generate form
        form = FormGenerationService.generate_form(
            template=self.template,
            client_data=client_data,
            batch=batch,
            user=self.user
        )
        
        # Check form status
        self.assertEqual(form.status, 'completed')
        self.assertIsNotNone(form.form_file)
        
        # Update batch status
        FormGenerationService.update_batch_status(batch)
        
        # Check batch status
        self.assertEqual(batch.status, 'completed')
    
    def test_quota_checking(self):
        """Test quota checking functionality."""
        # Check user quota
        self.assertTrue(FormGenerationService.check_user_quota(self.user))
        
        # Get quota info
        quota_info = FormGenerationService.get_user_quota_info(self.user)
        
        # Check quota info
        self.assertEqual(quota_info['daily_quota'], 10)
        self.assertEqual(quota_info['daily_used'], 0)
        self.assertEqual(quota_info['daily_remaining'], 10)
        
        # Create forms to exceed quota
        for i in range(10):
            GeneratedForm.objects.create(
                user=self.user,
                client=self.client,
                template=self.template,
                status='completed',
                created_at=timezone.now()
            )
        
        # Check user quota again
        self.assertFalse(FormGenerationService.check_user_quota(self.user))
        
        # Get quota info again
        quota_info = FormGenerationService.get_user_quota_info(self.user)
        
        # Check quota info
        self.assertEqual(quota_info['daily_quota'], 10)
        self.assertEqual(quota_info['daily_used'], 10)
        self.assertEqual(quota_info['daily_remaining'], 0)

class FormGenerationAPITests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test template
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            # Create a simple PDF form with a text field
            pdf_content = b'''%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/XObject<</F1 5 0 R>>>>/ProcSet[/PDF/Text]>>
/Contents 6 0 R>>
endobj
4 0 obj
<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
endobj
5 0 obj
<</Type/XObject/Subtype/Form/BBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/ProcSet[/PDF/Text]>>
/Fields[<</T(name)/V()/FT/Tx/F 4>>]>>
endobj
6 0 obj
<</Length 44>>
stream
BT /F1 12 Tf 100 700 Td (Test Form) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000217 00000 n
0000000253 00000 n
0000000321 00000 n
trailer
<</Size 7/Root 1 0 R>>
startxref
421
%%EOF'''
            temp_file.write(pdf_content)
            self.template = FormTemplate.objects.create(
                name='Test Template',
                file_name='test.pdf',
                category='broker',
                template_file=File(temp_file, name='test.pdf')
            )
        
        # Create test client
        from broker_pdf_filler.clients.models import Client
        from datetime import date
        self.test_client = Client.objects.create(
            user=self.user,
            first_name='Test',
            last_name='Client',
            date_of_birth=date(1990, 1, 1),
            gender='M',
            marital_status='single',
            id_number='TEST123',
            nationality='Hong Kong',
            phone_number='+85212345678',
            email='client@example.com',
            address_line1='123 Test St',
            city='Hong Kong',
            state='Hong Kong',
            postal_code='999077',
            country='Hong Kong'
        )
    
    def tearDown(self):
        if hasattr(self, 'template'):
            self.template.template_file.delete()
    
    def test_create_batch(self):
        url = reverse('batch-list')
        data = {
            'client_id': str(self.test_client.id),
            'template_ids': [str(self.template.id)],
            'client_data': {
                'client': {
                    'name': 'Test Client'
                }
            }
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormGenerationBatch.objects.count(), 1)
        self.assertEqual(GeneratedForm.objects.count(), 1)
    
    def test_download_form(self):
        # Create a test form
        batch = FormGenerationBatch.objects.create(
            user=self.user,
            client=self.test_client
        )
        form = GeneratedForm.objects.create(
            user=self.user,
            client=self.test_client,
            template=self.template,
            batch=batch,
            status='completed'
        )
        
        # Create a test PDF file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b'%PDF-1.4\n%EOF\n')
            form.form_file.save('test.pdf', File(temp_file, name='test.pdf'))
        
        url = reverse('form-download', args=[form.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        
        # Clean up
        form.form_file.delete()
    
    def test_download_batch(self):
        # Create a test batch with forms
        batch = FormGenerationBatch.objects.create(
            user=self.user,
            client=self.test_client
        )
        form = GeneratedForm.objects.create(
            user=self.user,
            client=self.test_client,
            template=self.template,
            batch=batch,
            status='completed'
        )
        
        # Create a test PDF file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b'%PDF-1.4\n%EOF\n')
            form.form_file.save('test.pdf', File(temp_file, name='test.pdf'))
        
        url = reverse('batch-download-forms', args=[batch.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/zip')
        
        # Clean up
        form.form_file.delete()
        if batch.zip_file:
            batch.zip_file.delete()
