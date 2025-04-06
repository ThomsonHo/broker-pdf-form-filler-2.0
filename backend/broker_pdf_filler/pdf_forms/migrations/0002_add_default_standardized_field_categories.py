from django.db import migrations

def add_default_categories(apps, schema_editor):
    StandardizedFieldCategory = apps.get_model('pdf_forms', 'StandardizedFieldCategory')
    default_categories = [
        {
            'name': 'Personal Information',
            'description': 'Fields related to personal details such as name, date of birth, gender, etc.',
        },
        {
            'name': 'Contact Information',
            'description': 'Fields related to contact details such as email, phone, address, etc.',
        },
        {
            'name': 'Financial Information',
            'description': 'Fields related to financial details such as income, assets, liabilities, etc.',
        },
        {
            'name': 'Employment Information',
            'description': 'Fields related to employment details such as occupation, employer, work history, etc.',
        },
        {
            'name': 'Insurance Information',
            'description': 'Fields related to insurance details such as policy numbers, coverage amounts, etc.',
        },
    ]
    
    for category_data in default_categories:
        StandardizedFieldCategory.objects.get_or_create(
            name=category_data['name'],
            defaults=category_data
        )

def remove_default_categories(apps, schema_editor):
    StandardizedFieldCategory = apps.get_model('pdf_forms', 'StandardizedFieldCategory')
    default_categories = [
        'Personal Information',
        'Contact Information',
        'Financial Information',
        'Employment Information',
        'Insurance Information',
    ]
    StandardizedFieldCategory.objects.filter(name__in=default_categories).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pdf_forms', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_categories, remove_default_categories),
    ] 