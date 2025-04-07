import json
import os
from django.db import migrations
from django.conf import settings

def import_standardized_fields(apps, schema_editor):
    StandardizedField = apps.get_model('pdf_forms', 'StandardizedField')
    
    # Get the path to the JSON file
    json_file_path = os.path.join(settings.BASE_DIR, '..', 'requirement', 'references', 'standardized_fields.json')
    
    # Read the JSON file
    with open(json_file_path, 'r') as file:
        fields_data = json.load(file)
    
    # Process each field
    for field_name, field_data in fields_data.items():
        # Determine field_category and display_category based on the category
        if field_data['category'] == 'Advisor Information':
            field_category = 'user'
            display_category = 'Personal Information'
        else:
            field_category = 'client'
            display_category = field_data['category']
        
        # Create the standardized field
        StandardizedField.objects.get_or_create(
            name=field_name,
            defaults={
                'label': field_data['display_name'],
                'llm_guide': field_data['llm_guide'],
                'is_required': field_data['required'],
                'field_category': field_category,
                'display_category': display_category,
                'field_type': 'text',
                'is_active': True,
                'is_system': True
            }
        )

def reverse_import(apps, schema_editor):
    StandardizedField = apps.get_model('pdf_forms', 'StandardizedField')
    StandardizedField.objects.filter(is_system=True).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pdf_forms', '0009_alter_standardizedfield_options_and_more'),
    ]

    operations = [
        migrations.RunPython(import_standardized_fields, reverse_import),
    ] 