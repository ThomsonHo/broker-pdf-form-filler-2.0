# Generated by Django 5.1 on 2025-04-07 07:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pdf_forms', '0007_rename_category_standardizedfield_display_category_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='standardizedfield',
            name='required',
        ),
    ]
