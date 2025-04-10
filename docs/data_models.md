# Data Models Documentation

This document provides a detailed overview of the data models used in the Broker PDF Form Filler application.

## Table of Contents
- [Overview](#overview)
- [Users App](#users-app)
- [Clients App](#clients-app)
- [PDF Forms App](#pdf-forms-app)
- [Dashboard App](#dashboard-app)
- [Key Relationships](#key-relationships)

## Overview

The application's data models are organized into several Django apps within the `broker_pdf_filler` directory:

- `users`: Manages user accounts, broker companies, and user activities
- `clients`: Handles client information and management
- `pdf_forms`: Manages PDF templates, field mappings, and form generation
- `dashboard`: Handles dashboard metrics and quick access links

## Users App

### BrokerCompany
Represents the brokerage firm employing the users.

**Fields:**
- `id`: UUID (Primary Key)
- `name`: CharField (max_length=255)
- `ia_reg_code`: CharField (max_length=6)
- `mpfa_reg_code`: CharField (max_length=8)
- `phone_number`: CharField (max_length=20)
- `address`: TextField
- `responsible_officer_email`: EmailField
- `contact_email`: EmailField
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)

### InsuranceCompanyAccount
Stores insurance provider account codes associated with a broker company.

**Fields:**
- `id`: UUID (Primary Key)
- `broker_company`: ForeignKey to BrokerCompany
- `insurance_company`: CharField (max_length=255)
- `account_code`: CharField (max_length=50)
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)

### User
Custom user model representing broker agents using the system.

**Fields:**
- `id`: UUID (Primary Key)
- `email`: EmailField (unique=True)
- `role`: CharField (choices: 'admin', 'standard')
- `broker_company`: ForeignKey to BrokerCompany (nullable)
- `email_verified`: BooleanField
- `email_verification_token`: CharField (max_length=64)
- `email_verification_token_expiry`: DateTimeField
- `tr_name`: CharField (max_length=255)
- `tr_license_number`: CharField (max_length=50)
- `tr_phone_number`: CharField (max_length=20)
- `daily_form_quota`: PositiveIntegerField (default=10)
- `monthly_form_quota`: PositiveIntegerField (default=300)
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)

### UserActivity
Logs user actions and activities.

**Fields:**
- `id`: UUID (Primary Key)
- `user`: ForeignKey to User
- `action`: CharField (choices: login, logout, password_change, etc.)
- `ip_address`: GenericIPAddressField
- `timestamp`: DateTimeField
- `details`: JSONField

### UserQuotaUsage
Tracks form generation quotas per user.

**Fields:**
- `id`: UUID (Primary Key)
- `user`: ForeignKey to User
- `date`: DateField
- `daily_usage`: PositiveIntegerField
- `monthly_usage`: PositiveIntegerField

## Clients App

### Client
Stores information about the end-clients of the brokers.

**Fields:**
- `id`: UUID (Primary Key)
- `user`: ForeignKey to User
- `first_name`: CharField (max_length=100)
- `last_name`: CharField (max_length=100)
- `date_of_birth`: DateField
- `gender`: CharField (choices: 'M', 'F', 'O')
- `marital_status`: CharField (choices: single, married, divorced, widowed)
- `id_number`: CharField (max_length=50, unique=True)
- `nationality`: CharField (max_length=100)
- `phone_number`: CharField (max_length=20)
- `email`: EmailField
- `address_line1`: CharField (max_length=255)
- `address_line2`: CharField (max_length=255)
- `city`: CharField (max_length=100)
- `state`: CharField (max_length=100)
- `postal_code`: CharField (max_length=20)
- `country`: CharField (max_length=100)
- `employer`: CharField (max_length=255)
- `occupation`: CharField (max_length=255)
- `work_address`: CharField (max_length=255)
- `annual_income`: DecimalField
- `monthly_expenses`: DecimalField
- `tax_residency`: CharField (max_length=100)
- `payment_method`: CharField (max_length=50)
- `payment_period`: CharField (max_length=50)
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)
- `is_active`: BooleanField (default=True)

## PDF Forms App

### FormTemplate
Defines a specific PDF form template.

**Fields:**
- `id`: UUID (Primary Key)
- `name`: CharField (max_length=100)
- `file_name`: CharField (max_length=255)
- `description`: TextField
- `category`: CharField (choices: broker, boclife, chubb)
- `form_type`: CharField (choices: fna, application, agreement, payment)
- `form_affiliation`: CharField (choices: broker, insurance)
- `version`: CharField (max_length=20)
- `template_file`: FileField
- `is_active`: BooleanField
- `metadata`: JSONField
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)
- `created_by`: ForeignKey to User (nullable)

### FormSet
Groups related PDF form templates.

**Fields:**
- `id`: UUID (Primary Key)
- `name`: CharField (max_length=100)
- `description`: TextField
- `forms`: ManyToManyField to FormTemplate
- `created_by`: ForeignKey to User (nullable)
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)

### StandardizedField
Represents a common data field across multiple PDF forms.

**Fields:**
- `id`: UUID (Primary Key)
- `name`: CharField (max_length=255, unique=True)
- `label`: CharField (max_length=255)
- `llm_guide`: TextField
- `is_required`: BooleanField
- `field_category`: CharField (choices: client, account, beneficiary, document, other)
- `display_category`: CharField (max_length=255)
- `field_type`: CharField (choices: text, number, date, select, checkbox, radio, etc.)
- `field_definition`: TextField
- `has_validation`: BooleanField
- `validation_rules`: JSONField
- `has_relationship`: BooleanField
- `relationship_rules`: JSONField
- `options`: JSONField
- `default_value`: TextField
- `placeholder`: CharField (max_length=255)
- `help_text`: TextField
- `is_active`: BooleanField
- `is_system`: BooleanField
- `metadata`: JSONField
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)
- `created_by`: ForeignKey to User (nullable)
- `updated_by`: ForeignKey to User (nullable)

### FormFieldMapping
Links PDF form fields to standardized fields.

**Fields:**
- `id`: UUID (Primary Key)
- `template`: ForeignKey to FormTemplate
- `pdf_field_name`: CharField (max_length=100)
- `system_field_name`: CharField (max_length=100)
- `standardized_field`: ForeignKey to StandardizedField (nullable)
- `validation_rules`: TextField
- `transformation_rules`: TextField
- `field_definition_override`: TextField
- `created_at`: DateTimeField (auto_now_add=True)
- `updated_at`: DateTimeField (auto_now=True)
- `created_by`: ForeignKey to User (nullable)

### GeneratedForm
Represents a filled PDF form instance.

**Fields:**
- `id`: UUID (Primary Key)
- `user`: ForeignKey to User
- `client`: ForeignKey to Client
- `template`: ForeignKey to FormTemplate (nullable)
- `batch`: ForeignKey to FormGenerationBatch (nullable)
- `form_file`: FileField
- `status`: CharField (choices: processing, completed, failed)
- `error_message`: TextField
- `created_at`: DateTimeField (auto_now_add=True)

### FormGenerationBatch
Groups multiple generated forms.

**Fields:**
- `id`: UUID (Primary Key)
- `user`: ForeignKey to User
- `client`: ForeignKey to Client
- `status`: CharField (choices: processing, completed, partial, failed)
- `zip_file`: FileField
- `download_count`: PositiveIntegerField
- `insurer`: CharField (max_length=50)
- `created_at`: DateTimeField (auto_now_add=True)

## Dashboard App

### DashboardMetrics
Stores aggregated metrics for dashboard display.

**Fields:**
- `id`: UUID (Primary Key)
- `date`: DateField
- `total_clients`: IntegerField
- `active_clients`: IntegerField
- `forms_generated`: IntegerField
- `quota_usage`: FloatField
- `metrics_by_type`: JSONField
- `last_updated`: DateTimeField (auto_now=True)

### QuickAccessLink
Defines configurable dashboard links.

**Fields:**
- `id`: UUID (Primary Key)
- `title`: CharField (max_length=100)
- `url`: CharField (max_length=200)
- `icon`: CharField (max_length=50)
- `order`: IntegerField
- `is_active`: BooleanField

## Key Relationships

1. **User-Client Relationship**
   - A User (broker) manages multiple Clients
   - One-to-Many relationship through ForeignKey

2. **User-Forms Relationship**
   - A User generates GeneratedForms
   - Forms are often grouped in FormGenerationBatches
   - User activity and quotas are tracked

3. **Template-Mapping-Standardization**
   - FormTemplate contains PDF fields
   - FormFieldMapping links PDF fields to StandardizedField
   - Creates a reusable data definition layer

4. **Form Generation Process**
   - Takes Client data and FormTemplate
   - Uses FormFieldMapping and StandardizedField definitions
   - Creates GeneratedForm records
   - Often grouped by FormGenerationBatch

5. **Broker Company Structure**
   - BrokerCompany has multiple Users
   - BrokerCompany has multiple InsuranceCompanyAccounts
   - Users can be associated with a BrokerCompany

6. **Quota and Activity Tracking**
   - UserQuotaUsage tracks daily/monthly form generation
   - UserActivity logs all user actions
   - DashboardMetrics aggregates data for quick access 