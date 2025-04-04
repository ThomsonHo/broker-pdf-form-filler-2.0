# Generated by Django 5.2 on 2025-04-04 04:12

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100, verbose_name='first name')),
                ('last_name', models.CharField(max_length=100, verbose_name='last name')),
                ('date_of_birth', models.DateField(verbose_name='date of birth')),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], max_length=1, verbose_name='gender')),
                ('marital_status', models.CharField(choices=[('single', 'Single'), ('married', 'Married'), ('divorced', 'Divorced'), ('widowed', 'Widowed')], max_length=20, verbose_name='marital status')),
                ('id_number', models.CharField(max_length=50, unique=True, verbose_name='ID number')),
                ('nationality', models.CharField(max_length=100, verbose_name='nationality')),
                ('phone_number', models.CharField(max_length=20, verbose_name='phone number')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('address_line1', models.CharField(max_length=255, verbose_name='address line 1')),
                ('address_line2', models.CharField(blank=True, max_length=255, verbose_name='address line 2')),
                ('city', models.CharField(max_length=100, verbose_name='city')),
                ('state', models.CharField(max_length=100, verbose_name='state/province')),
                ('postal_code', models.CharField(max_length=20, verbose_name='postal code')),
                ('country', models.CharField(max_length=100, verbose_name='country')),
                ('employer', models.CharField(blank=True, max_length=255, verbose_name='employer')),
                ('occupation', models.CharField(blank=True, max_length=255, verbose_name='occupation')),
                ('work_address', models.CharField(blank=True, max_length=255, verbose_name='work address')),
                ('annual_income', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='annual income')),
                ('monthly_expenses', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='monthly expenses')),
                ('tax_residency', models.CharField(blank=True, max_length=100, verbose_name='tax residency')),
                ('payment_method', models.CharField(blank=True, max_length=50, verbose_name='payment method')),
                ('payment_period', models.CharField(blank=True, max_length=50, verbose_name='payment period')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clients', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'client',
                'verbose_name_plural': 'clients',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['user', 'created_at'], name='clients_cli_user_id_370815_idx'), models.Index(fields=['id_number'], name='clients_cli_id_numb_9f1aaf_idx'), models.Index(fields=['first_name', 'last_name'], name='clients_cli_first_n_5c6577_idx')],
            },
        ),
    ]
