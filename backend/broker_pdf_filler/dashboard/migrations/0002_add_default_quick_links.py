from django.db import migrations

def add_default_quick_links(apps, schema_editor):
    QuickAccessLink = apps.get_model('dashboard', 'QuickAccessLink')
    default_links = [
        {
            'title': 'Generate Forms',
            'url': '/forms/generate',
            'icon': 'description',
            'order': 1,
            'is_active': True,
        },
        {
            'title': 'Client List',
            'url': '/clients',
            'icon': 'people',
            'order': 2,
            'is_active': True,
        },
        {
            'title': 'Form Templates',
            'url': '/forms/templates',
            'icon': 'article',
            'order': 3,
            'is_active': True,
        },
        {
            'title': 'Form History',
            'url': '/forms/history',
            'icon': 'history',
            'order': 4,
            'is_active': True,
        },
    ]
    
    for link_data in default_links:
        QuickAccessLink.objects.create(**link_data)

def remove_default_quick_links(apps, schema_editor):
    QuickAccessLink = apps.get_model('dashboard', 'QuickAccessLink')
    QuickAccessLink.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_quick_links, remove_default_quick_links),
    ] 