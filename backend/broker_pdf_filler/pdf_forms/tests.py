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

User = get_user_model()

class PDFFormFillerTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
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
        
        # Create test field mappings
        FormFieldMapping.objects.create(
            template=self.template,
            pdf_field_name='name',
            system_field_name='client.name'
        )
        
        # Test client data
        self.client_data = {
            'client': {
                'name': 'Test Client'
            }
        }
    
    def tearDown(self):
        # Clean up temporary files
        if hasattr(self, 'template'):
            self.template.template_file.delete()
    
    def test_field_mapping(self):
        filler = PDFFormFiller(self.template, self.client_data)
        value = filler._map_field_value('name')
        self.assertEqual(value, 'Test Client')
    
    def test_fill_form(self):
        filler = PDFFormFiller(self.template, self.client_data)
        output_path = filler.fill_form()
        self.assertIsNotNone(output_path)
        self.assertTrue(os.path.exists(output_path))
        os.unlink(output_path)

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
