# Generated by Django 5.2 on 2025-04-04 04:12

import broker_pdf_filler.users.models
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='BrokerCompany',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='company name')),
                ('code', models.CharField(max_length=50, unique=True, verbose_name='company code')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'broker company',
                'verbose_name_plural': 'broker companies',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('role', models.CharField(choices=[('admin', 'Administrator'), ('standard', 'Standard User')], default='standard', max_length=20)),
                ('tr_name', models.CharField(blank=True, max_length=255, null=True, verbose_name='TR name')),
                ('tr_license_number', models.CharField(blank=True, max_length=50, null=True, verbose_name='TR license number')),
                ('tr_phone_number', models.CharField(blank=True, max_length=20, null=True, verbose_name='TR phone number')),
                ('daily_form_quota', models.PositiveIntegerField(default=10, help_text='Maximum number of form sets allowed per day')),
                ('monthly_form_quota', models.PositiveIntegerField(default=300, help_text='Maximum number of form sets allowed per month')),
                ('last_login_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                ('broker_company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='users.brokercompany')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
            },
            managers=[
                ('objects', broker_pdf_filler.users.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='UserActivity',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(choices=[('login', 'Login'), ('logout', 'Logout'), ('password_change', 'Password Change'), ('form_generated', 'Form Generated'), ('client_added', 'Client Added'), ('client_updated', 'Client Updated'), ('client_exported', 'Client Data Exported'), ('llm_extraction', 'LLM Data Extraction')], max_length=30)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('details', models.JSONField(blank=True, help_text='Additional details about the activity', null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'user activity',
                'verbose_name_plural': 'user activities',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='InsuranceCompanyAccount',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('insurance_company', models.CharField(max_length=255, verbose_name='insurance company name')),
                ('account_code', models.CharField(max_length=50, verbose_name='account code')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('broker_company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='insurance_accounts', to='users.brokercompany')),
            ],
            options={
                'verbose_name': 'insurance company account',
                'verbose_name_plural': 'insurance company accounts',
                'ordering': ['insurance_company'],
                'unique_together': {('broker_company', 'insurance_company')},
            },
        ),
        migrations.CreateModel(
            name='UserQuotaUsage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('daily_usage', models.PositiveIntegerField(default=0)),
                ('monthly_usage', models.PositiveIntegerField(default=0)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quota_usage', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'user quota usage',
                'verbose_name_plural': 'user quota usages',
                'unique_together': {('user', 'date')},
            },
        ),
    ]
