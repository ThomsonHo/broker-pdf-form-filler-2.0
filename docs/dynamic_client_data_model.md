# Dynamic Client Data Model Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Implementation Plan](#implementation-plan)
   - [Phase 1: Core Backend Changes](#phase-1-core-backend-changes)
   - [Phase 2: Frontend Implementation](#phase-2-frontend-implementation)
   - [Phase 3: Extended Features](#phase-3-extended-features)
5. [Detailed Task List](#detailed-task-list)
6. [Data Migration Strategy](#data-migration-strategy)
7. [Testing Plan](#testing-plan)
8. [Rollback Plan](#rollback-plan)

## Overview

Currently, the `Client` model in the application uses a fixed schema with predefined fields. The goal of this project is to convert it to a dynamic data model where the fields stored for each client are determined by the `StandardizedField` model. This allows system administrators to dynamically add, modify, or remove client data fields without modifying the underlying database schema.

### Business Benefits
- System administrators can add new client fields without developer intervention
- Field definitions can evolve over time as business needs change
- Greater flexibility in supporting different types of client information
- Standardized approach to validating and processing client data

### Technical Benefits
- Reduced need for database migrations when client data requirements change
- More maintainable codebase with cleaner separation between data structure and business logic
- Improved alignment between form fields and client data storage

## Current Architecture Analysis

### Current Client Model

The current `Client` model (in `backend/broker_pdf_filler/clients/models.py`) has a fixed schema with predefined fields:

```python
class Client(models.Model):
    # Identity fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clients')
    
    # Personal Information (fixed fields)
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100)
    date_of_birth = models.DateField(_('date of birth'))
    gender = models.CharField(_('gender'), max_length=1, choices=GENDER_CHOICES)
    marital_status = models.CharField(_('marital status'), max_length=20, choices=MARITAL_STATUS_CHOICES)
    id_number = models.CharField(_('ID number'), max_length=50, unique=True)
    nationality = models.CharField(_('nationality'), max_length=100)
    
    # Contact Information (fixed fields)
    phone_number = models.CharField(_('phone number'), max_length=20)
    email = models.EmailField(_('email address'), blank=True)
    address_line1 = models.CharField(_('address line 1'), max_length=255)
    # ... more fixed fields ...
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

### Current StandardizedField Model

The `StandardizedField` model (in `backend/broker_pdf_filler/pdf_forms/models.py`) defines fields that can be used across the system:

```python
class StandardizedField(models.Model):
    # Field definition
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=50, choices=FIELD_TYPES)
    field_category = models.CharField(max_length=50, choices=FIELD_CATEGORIES)
    display_category = models.CharField(max_length=255)
    # ... validation, relationships, etc. ...
```

### Current Form Mapping and Generation Process

The PDF form filling is handled in `backend/broker_pdf_filler/pdf_forms/services.py` using the `PDFFormFiller` class:

```python
class PDFFormFiller:
    def __init__(self, template: FormTemplate, client_data: Dict):
        self.template = template
        self.client_data = client_data
        self.field_mappings = {
            mapping.pdf_field_name: mapping.system_field_name
            for mapping in template.field_mappings.all()
        }
    
    def _map_field_value(self, pdf_field: str) -> str:
        """Map PDF field name to system field value."""
        system_field = self.field_mappings.get(pdf_field)
        if not system_field:
            return ""
        
        # Handle nested fields (e.g., "client.name")
        value = self.client_data
        for key in system_field.split('.'):
            if isinstance(value, dict):
                value = value.get(key, "")
            else:
                return ""
        return str(value)
```

### Current Frontend Client Interface

The frontend client interface is defined in multiple components:

1. **`ClientForm.tsx`** - For adding and editing clients
2. **`ClientList.tsx`** - For displaying and filtering clients
3. **`ClientDetails.tsx`** - For viewing client details

The client data structure is defined in `clientService.ts`:

```typescript
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  // ... other fixed fields ...
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

## Proposed Architecture

### New Client Model

```python
class Client(models.Model):
    # Core identity fields (remain fixed)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clients')
    
    # Minimal required fixed fields
    id_number = models.CharField(_('ID number'), max_length=50, unique=True)
    
    # Dynamic data storage
    data = models.JSONField(default=dict)
    
    # Metadata (remain fixed)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Helper methods for dynamic data access
    def get_field_value(self, field_name, default=None):
        return self.data.get(field_name, default)
    
    def set_field_value(self, field_name, value):
        self.data[field_name] = value
        
    # Property-based backward compatibility
    @property
    def first_name(self):
        return self.get_field_value('first_name', '')
        
    @property
    def last_name(self):
        return self.get_field_value('last_name', '')
        
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
```

### Updated StandardizedField Model

```python
class StandardizedField(models.Model):
    # Existing fields remain...
    
    # New fields for client data integration
    is_client_field = models.BooleanField(default=False, help_text="Whether this field should be stored in client data")
    is_core_field = models.BooleanField(default=False, help_text="Whether this is a core field shown in client listings")
    is_filterable = models.BooleanField(default=False, help_text="Whether this field can be used for filtering clients")
    display_order = models.IntegerField(default=100, help_text="Order to display this field in forms and listings")
```

### Enhanced Client Data Access Service

Create a new service layer to handle dynamic client data:

```python
class ClientDataService:
    @staticmethod
    def get_client_fields():
        """Get all fields that should be stored in client data"""
        return StandardizedField.objects.filter(
            is_client_field=True, 
            is_active=True
        ).order_by('display_category', 'display_order', 'label')
    
    @staticmethod
    def get_core_client_fields():
        """Get fields that should be displayed in client listings"""
        return StandardizedField.objects.filter(
            is_client_field=True,
            is_core_field=True,
            is_active=True
        ).order_by('display_order', 'label')
        
    @staticmethod
    def validate_client_data(data):
        """Validate client data against field definitions"""
        errors = {}
        fields = ClientDataService.get_client_fields()
        
        for field in fields:
            if field.is_required and field.name not in data:
                errors[field.name] = f"{field.label} is required."
            # Add more validation based on field types and rules
            
        return errors
```

## Implementation Plan

### Phase 1: Core Backend Changes

#### Basic Functionality

1. **Update Client Model**
   - Modify the Client model to use JSONField for dynamic data
   - Keep minimal required fields and metadata
   - Add helper methods for accessing dynamic data

2. **Enhance StandardizedField Model**
   - Add new fields for client data integration
   - Add methods to retrieve client-specific fields

3. **Create Data Migration**
   - Create StandardizedField entries for all existing client fields
   - Migrate existing client data to the new structure

4. **Update Client Serializers**
   - Create serializers that handle dynamic fields
   - Implement backward compatibility

5. **Modify Client Views**
   - Update views to handle dynamic fields
   - Implement filtering for dynamic fields

#### Advanced Functionality

1. **Client Data Validation**
   - Create validation logic based on StandardizedField definitions
   - Implement custom validation rules

2. **Client Data Indexing**
   - Consider PostgreSQL JSONField indexing for performance
   - Possibly implement materialized views for complex reports

### Phase 2: Frontend Implementation

#### Basic Functionality

1. **Update Client Service**
   - Modify the client data interfaces
   - Update API calls to handle dynamic data

2. **Update Client Form Component**
   - Make the form dynamically generate fields based on StandardizedField
   - Implement field groups and organization

3. **Update Client List Component**
   - Make the list display configurable columns
   - Update filtering controls

4. **Update Client Details Component**
   - Dynamic display of client fields
   - Organize fields by category

#### Advanced Functionality

1. **Client Form Validation**
   - Implement dynamic validation based on field types and rules
   - Add conditional field display based on relationships

2. **Advanced Filtering**
   - Create advanced search and filter capabilities for dynamic fields
   - Implement saved filters

### Phase 3: Extended Features

1. **Client Field Management UI**
   - Create an admin interface for managing client fields
   - Allow drag-and-drop reordering of fields

2. **Client Data Templates**
   - Allow creating templates for common sets of client data
   - Implement bulk data import/export

3. **Custom Views**
   - Let users create custom views of client data
   - Implement permissions for field visibility

## Detailed Task List

### Backend Tasks

#### Core Model Changes

1. **Client Model Update**
   - [ ] Create new migration adding JSONField to Client model
   - [ ] Update model with helper methods for data access
   - [ ] Add property methods for backward compatibility
   - [ ] Add validators for dynamic data

2. **StandardizedField Enhancements**
   - [ ] Add `is_client_field`, `is_core_field`, `is_filterable` fields
   - [ ] Add `display_order` field
   - [ ] Add methods to get client-specific fields
   - [ ] Create migration for new fields

3. **Client Data Service Layer**
   - [ ] Create `ClientDataService` class
   - [ ] Implement field retrieval methods
   - [ ] Implement validation methods
   - [ ] Add caching for performance

#### API and Serialization

1. **Client Serializer Updates**
   - [ ] Create `DynamicClientSerializer` with dynamic field handling
   - [ ] Update validation to use StandardizedField rules
   - [ ] Implement backward compatibility

2. **Client View Updates**
   - [ ] Update `ClientViewSet` to handle dynamic fields
   - [ ] Modify filtering to support dynamic fields
   - [ ] Update ordering to support dynamic fields
   - [ ] Create endpoints for field definitions

3. **Form Integration**
   - [ ] Update `PDFFormFiller` to work with dynamic client data
   - [ ] Modify field mapping to handle nested JSON data
   - [ ] Update validation pipeline

### Frontend Tasks

#### Core Interface Updates

1. **Client Service**
   - [ ] Update `Client` interface to handle dynamic fields
   - [ ] Create methods to get field definitions
   - [ ] Update API calls to handle dynamic data

2. **Client Form**
   - [ ] Refactor to use dynamic field rendering
   - [ ] Implement field groups based on categories
   - [ ] Add dynamic validation
   - [ ] Support conditional fields

3. **Client List**
   - [ ] Make columns configurable
   - [ ] Update filters for dynamic fields
   - [ ] Implement saved view functionality
   - [ ] Add column customization

4. **Client Details**
   - [ ] Organize fields by category
   - [ ] Implement field visibility rules
   - [ ] Add printable view

#### Admin Interface

1. **Field Management**
   - [ ] Create field management interface
   - [ ] Implement drag-and-drop ordering
   - [ ] Add field testing functionality
   - [ ] Create field templates

## Data Migration Strategy

1. **Preparation Phase**
   - Create StandardizedField entries for all existing client fields
   - Test the new model with sample data
   - Create backup of all client data

2. **Migration Phase**
   - Run data migration to convert existing data to the new format
   - Verify data integrity
   - Update indexes and optimize for performance

3. **Validation Phase**
   - Run comprehensive validation on migrated data
   - Fix any issues identified
   - Generate migration reports

## Testing Plan

1. **Unit Testing**
   - Test all new model methods
   - Test serialization and deserialization
   - Test validation rules

2. **Integration Testing**
   - Test PDF form generation with dynamic data
   - Test client CRUD operations
   - Test filtering and search capabilities

3. **User Acceptance Testing**
   - Test with real user scenarios
   - Verify data integrity
   - Test performance with large datasets

## Rollback Plan

1. **Backup Strategy**
   - Create full database backups before migration
   - Keep original models and code in source control

2. **Dual-Support Period**
   - Implement backward compatibility layer
   - Support both models during transition
   - Have clear toggle to switch between implementations

3. **Rollback Procedure**
   - Documented steps to restore previous version
   - Test data restoration process
   - Verification checklist for rollback success 