# Standardized Fields Documentation

## Overview
The standardized fields system provides a structured way to define, manage, and validate form fields across the application. It consists of both frontend and backend components that work together to maintain field definitions, validations, and relationships.

## Backend Components

### Models

#### StandardizedField
The core model for storing standardized field definitions.

**Fields:**
- `id` (UUID): Primary key
- `name` (CharField): Unique identifier for the field
- `label` (CharField): Display name for the field
- `llm_guide` (TextField): Guide for LLM processing
- `is_required` (BooleanField): Whether the field is required
- `field_category` (CharField): Category of the field (client, account, beneficiary, document, other)
- `display_category` (CharField): Display category for UI organization
- `field_type` (CharField): Type of field (text, number, date, select, checkbox, radio, textarea, email, phone, ssn, address, signature)
- `field_definition` (TextField): Detailed definition of the field
- `has_validation` (BooleanField): Whether the field has validation rules
- `validation_rules` (JSONField): Array of validation rules
- `has_relationship` (BooleanField): Whether the field has relationships
- `relationship_rules` (JSONField): Array of relationship rules
- `options` (JSONField): Field-specific options
- `default_value` (TextField): Default value for the field
- `placeholder` (CharField): Placeholder text
- `help_text` (TextField): Help text for the field
- `is_active` (BooleanField): Whether the field is active
- `is_system` (BooleanField): Whether the field is a system field
- `metadata` (JSONField): Additional metadata
- `created_at` (DateTimeField): Creation timestamp
- `updated_at` (DateTimeField): Last update timestamp
- `created_by` (ForeignKey): User who created the field
- `updated_by` (ForeignKey): User who last updated the field

#### StandardizedFieldCategory
Model for organizing fields into categories.

**Fields:**
- `id` (UUID): Primary key
- `name` (CharField): Category name
- `description` (TextField): Category description
- `created_at` (DateTimeField): Creation timestamp
- `updated_at` (DateTimeField): Last update timestamp

### Views

#### StandardizedFieldViewSet
REST API endpoints for managing standardized fields.

**Endpoints:**
- GET `/forms/standardized-fields/`: List all fields
- POST `/forms/standardized-fields/`: Create a new field
- GET `/forms/standardized-fields/{id}/`: Get a specific field
- PUT `/forms/standardized-fields/{id}/`: Update a field
- DELETE `/forms/standardized-fields/{id}/`: Delete a field

**Features:**
- Pagination support
- Filtering by field_type, field_category, is_required
- Search by name, label, description, field_definition
- Ordering by name, field_category, created_at

#### StandardizedFieldCategoryViewSet
REST API endpoints for managing field categories.

**Endpoints:**
- GET `/forms/standardized-field-categories/`: List all categories
- POST `/forms/standardized-field-categories/`: Create a new category
- GET `/forms/standardized-field-categories/{id}/`: Get a specific category
- PUT `/forms/standardized-field-categories/{id}/`: Update a category
- DELETE `/forms/standardized-field-categories/{id}/`: Delete a category

### Serializers

#### StandardizedFieldSerializer
Handles serialization/deserialization of StandardizedField model.

**Features:**
- Validates required fields
- Sets default values for optional fields
- Handles field type and category validation

#### StandardizedFieldCategorySerializer
Handles serialization/deserialization of StandardizedFieldCategory model.

## Frontend Components

### Services

#### StandardizedFieldService
Service for interacting with the standardized fields API.

**Methods:**
- `getStandardizedFields`: Fetch paginated list of fields
- `createStandardizedField`: Create a new field
- `updateStandardizedField`: Update an existing field
- `deleteStandardizedField`: Delete a field
- `getStandardizedFieldCategories`: Fetch paginated list of categories
- `createStandardizedFieldCategory`: Create a new category
- `updateStandardizedFieldCategory`: Update an existing category
- `deleteStandardizedFieldCategory`: Delete a category

### Components

#### StandardizedFieldManagement
Main component for managing standardized fields.

**Features:**
- CRUD operations for fields
- Field validation
- Category management
- Pagination and search
- Field type selection
- Validation rules management
- Relationship rules management

#### FieldBuilder
Component for building and editing field definitions.

**Features:**
- Field type selection
- Validation rules configuration
- Relationship rules configuration
- Field options management
- Default value setting
- Help text and placeholder configuration

#### FieldList
Component for displaying the list of standardized fields.

**Features:**
- Field categorization
- Field type indicators
- Required field indicators
- Validation status
- Relationship indicators

## Data Flow

1. Field Definition:
   - Admin creates/updates field definitions through the frontend
   - Data is validated and sent to the backend
   - Backend stores the definition in the database

2. Field Usage:
   - Frontend components fetch field definitions
   - Fields are rendered according to their type and configuration
   - Validation rules are applied to user input
   - Relationship rules are enforced between fields

3. Field Categories:
   - Categories are managed separately from fields
   - Fields are associated with categories for organization
   - Categories can be used for filtering and grouping

## Validation Rules

Supported validation types:
- length: Validate field length
- pattern: Validate against regex pattern
- min: Minimum value
- max: Maximum value
- email: Email format
- url: URL format
- phone: Phone number format
- custom: Custom validation logic

## Relationship Rules

Supported relationship types:
- dependency: Field depends on another field's value
- visibility: Field visibility depends on another field's value
- calculation: Field value is calculated based on other fields

## Field Types

Supported field types:
- text: Plain text input
- number: Numeric input
- date: Date input
- select: Dropdown selection
- checkbox: Checkbox input
- radio: Radio button input
- textarea: Multi-line text input
- email: Email input
- phone: Phone number input
- ssn: Social Security Number input
- address: Address input
- signature: Signature input 