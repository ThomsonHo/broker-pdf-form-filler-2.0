#!/usr/bin/env python3

import json
import os
import sys
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Import standardized fields from JSON file'

    def handle(self, *args, **options):
        from broker_pdf_filler.pdf_forms.models import StandardizedField
        
        # Get the path to the JSON file
        json_file_path = os.path.join(settings.BASE_DIR, '..', 'requirement', 'references', 'standardized_fields.json')
        
        self.stdout.write(f"Reading standardized fields from: {json_file_path}")
        
        # Read the JSON file
        with open(json_file_path, 'r') as file:
            fields_data = json.load(file)
        
        created_count = 0
        updated_count = 0
        
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
            field, created = StandardizedField.objects.update_or_create(
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
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(f"Import complete! Created {created_count} new fields, updated {updated_count} existing fields.")) 