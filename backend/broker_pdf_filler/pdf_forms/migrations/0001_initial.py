# Generated by Django 5.2 on 2025-04-04 04:12

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('clients', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FormTemplate',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('file_name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(choices=[('broker', 'Broker'), ('boclife', 'BOC Life'), ('chubb', 'Chubb')], max_length=20)),
                ('template_file', models.FileField(upload_to='templates/pdf_forms/')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'form template',
                'verbose_name_plural': 'form templates',
                'ordering': ['category', 'name'],
            },
        ),
        migrations.CreateModel(
            name='FormGenerationBatch',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('processing', 'Processing'), ('completed', 'Completed'), ('partial', 'Partially Completed'), ('failed', 'Failed')], default='processing', max_length=20)),
                ('zip_file', models.FileField(blank=True, null=True, upload_to='pdf_forms/batches/')),
                ('download_count', models.PositiveIntegerField(default=0)),
                ('insurer', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_batches', to='clients.client')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_batches', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'form generation batch',
                'verbose_name_plural': 'form generation batches',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='GeneratedForm',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('form_file', models.FileField(blank=True, null=True, upload_to='pdf_forms/generated/')),
                ('status', models.CharField(choices=[('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')], default='processing', max_length=20)),
                ('error_message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('batch', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='batch_forms', to='pdf_forms.formgenerationbatch')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='forms', to='clients.client')),
                ('template', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='generated_forms', to='pdf_forms.formtemplate')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='generated_forms', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'generated form',
                'verbose_name_plural': 'generated forms',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FormFieldMapping',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('pdf_field_name', models.CharField(max_length=100)),
                ('system_field_name', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='field_mappings', to='pdf_forms.formtemplate')),
            ],
            options={
                'verbose_name': 'form field mapping',
                'verbose_name_plural': 'form field mappings',
                'unique_together': {('template', 'pdf_field_name')},
            },
        ),
    ]
