# Dynamic Client Data Model Implementation Guide

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Detailed Code Analysis](#detailed-code-analysis)
3. [Implementation Plan](#implementation-plan)
   - [Phase 1: Basic Functionality](#phase-1-basic-functionality)
   - [Phase 2: Extended Functionality](#phase-2-extended-functionality)
4. [Technical Specifications](#technical-specifications)
5. [Migration Strategy](#migration-strategy)
6. [Risk Assessment](#risk-assessment)

## Executive Summary

This document outlines the technical specification for converting the fixed client data model to a dynamic one based on StandardizedField entries. This change will enable administrators to modify client data fields without requiring code changes or database migrations.

## Detailed Code Analysis

### Current Architecture

Based on our analysis of the codebase, we identified the following key components:

1. **Client Model (backend/broker_pdf_filler/clients/models.py)**
   - Fixed schema with predefined fields (first_name, last_name, etc.)
   - References to user (broker) who manages the client
   - Used directly by PDF form generation process

2. **StandardizedField Model (backend/broker_pdf_filler/pdf_forms/models.py)**
   - Already exists but primarily used for form field mappings
   - Includes field types, validation rules, and display information
   - Currently not directly linked to client data storage

3. **Form Filling Process (backend/broker_pdf_filler/pdf_forms/services.py)**
   - PDFFormFiller class maps PDF fields to client data
   - Uses direct attribute access on client model
   - Supports nested field access via dot notation

4. **Client Frontend (multiple components)**
   - Fixed interfaces in ClientForm.tsx, ClientList.tsx, ClientDetails.tsx
   - Fixed Client interface in clientService.ts
   - Filtering and search based on fixed fields

### Impacted Components

| Component | Impact Level | Required Changes |
|-----------|--------------|------------------|
| Client Model | High | Replace fixed fields with JSONField |
| StandardizedField Model | Medium | Add client-specific attributes |
| Client Serializer | High | Dynamic field serialization |
| Client Views | Medium | Dynamic filtering and search |
| PDF Form Filler | Medium | Updated field mapping logic |
| Client Frontend Forms | High | Dynamic form generation |
| Client List/Details | High | Dynamic display and filtering |

## Implementation Plan

### Phase 1: Basic Functionality

#### Backend Tasks

1. **Enhance StandardizedField Model**
   ```python
   # Add to backend/broker_pdf_filler/pdf_forms/models.py
   class StandardizedField(models.Model):
       # Existing fields...
       
       # New client-specific fields
       is_client_field = models.BooleanField(default=False, 
           help_text=_("Whether this field should be stored in client data"))
       is_core_field = models.BooleanField(default=False, 
           help_text=_("Whether this is a core field shown in client listings"))
       is_filterable = models.BooleanField(default=False, 
           help_text=_("Whether this field can be used for filtering clients"))
       display_order = models.IntegerField(default=100, 
           help_text=_("Order to display this field in forms and listings"))
   ```

2. **Update Client Model**
   ```python
   # Modify backend/broker_pdf_filler/clients/models.py
   class Client(models.Model):
       # Core identity fields (remain fixed)
       id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
       user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
           related_name='clients')
       
       # Minimal required fixed fields
       id_number = models.CharField(_('ID number'), max_length=50, unique=True)
       
       # Dynamic data storage
       data = models.JSONField(default=dict)
       
       # Metadata (remain fixed)
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)
       is_active = models.BooleanField(default=True)
       
       # Backwards compatibility properties for common fields
       @property
       def first_name(self):
           return self.data.get('first_name', '')
           
       @property
       def last_name(self):
           return self.data.get('last_name', '')
       
       @property
       def full_name(self):
           return f"{self.first_name} {self.last_name}"
       
       # Helper methods
       def get_field_value(self, field_name, default=None):
           return self.data.get(field_name, default)
   ```

3. **Create Client Data Service**
   ```python
   # Create new file: backend/broker_pdf_filler/clients/services.py
   from django.core.cache import cache
   from pdf_forms.models import StandardizedField
   
   class ClientDataService:
       CACHE_PREFIX = 'client_fields'
       CACHE_TIMEOUT = 3600  # 1 hour
       
       @classmethod
       def get_client_fields(cls):
           """Get all fields that should be stored in client data"""
           cache_key = f"{cls.CACHE_PREFIX}_all"
           fields = cache.get(cache_key)
           
           if fields is None:
               fields = list(StandardizedField.objects.filter(
                   is_client_field=True, 
                   is_active=True
               ).order_by('display_category', 'display_order', 'label').values())
               
               cache.set(cache_key, fields, cls.CACHE_TIMEOUT)
               
           return fields
       
       @classmethod
       def get_core_client_fields(cls):
           """Get fields for client listings"""
           cache_key = f"{cls.CACHE_PREFIX}_core"
           fields = cache.get(cache_key)
           
           if fields is None:
               fields = list(StandardizedField.objects.filter(
                   is_client_field=True,
                   is_core_field=True,
                   is_active=True
               ).order_by('display_order', 'label').values())
               
               cache.set(cache_key, fields, cls.CACHE_TIMEOUT)
               
           return fields
   ```

4. **Update Client Serializers**
   ```python
   # Modify backend/broker_pdf_filler/clients/serializers.py
   from rest_framework import serializers
   from .models import Client
   from .services import ClientDataService
   
   class DynamicClientSerializer(serializers.ModelSerializer):
       """Serializer for the Client model with dynamic fields."""
       
       class Meta:
           model = Client
           fields = ['id', 'user', 'id_number', 'data', 'created_at', 'updated_at', 'is_active']
           read_only_fields = ['id', 'user', 'created_at', 'updated_at']
       
       def to_representation(self, instance):
           """Add dynamic fields to the representation."""
           ret = super().to_representation(instance)
           
           # Add convenient access to data fields
           if 'data' in ret and isinstance(ret['data'], dict):
               for key, value in ret['data'].items():
                   ret[key] = value
           
           # Add computed fields
           ret['full_name'] = instance.full_name
           
           return ret
       
       def to_internal_value(self, data):
           """Extract dynamic fields to the data dictionary."""
           client_fields = {field['name'] for field in ClientDataService.get_client_fields()}
           dynamic_data = {}
           
           # Extract client fields from the input data
           for field_name in list(data.keys()):
               if field_name in client_fields:
                   dynamic_data[field_name] = data.pop(field_name)
           
           # Process the rest with the standard serializer
           internal_data = super().to_internal_value(data)
           
           # Add the dynamic data
           if 'data' not in internal_data:
               internal_data['data'] = {}
           internal_data['data'].update(dynamic_data)
           
           return internal_data
   ```

5. **Update Form Filling Service**
   ```python
   # Modify backend/broker_pdf_filler/pdf_forms/services.py
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
           # Special handling for client data fields
           elif hasattr(value, 'data') and hasattr(value, 'get_field_value'):
               value = value.get_field_value(key, "")
           elif hasattr(value, key):
               value = getattr(value, key, "")
           else:
               return ""
       return str(value)
   ```

#### Frontend Tasks

1. **Update Client Interface**
   ```typescript
   // Modify frontend/src/services/clientService.ts
   export interface Client {
     id: string;
     id_number: string;
     data?: Record<string, any>;
     created_at: string;
     updated_at: string;
     is_active: boolean;
     [key: string]: any; // Dynamic fields
   }
   
   export interface ClientField {
     name: string;
     label: string;
     field_type: string;
     is_required: boolean;
     display_category: string;
     display_order: number;
     validation_rules?: any[];
     options?: any;
     default_value?: any;
     placeholder?: string;
     help_text?: string;
   }
   
   // Add new methods to get client fields
   export const getClientFields = async (): Promise<ClientField[]> => {
     const response = await api.get('forms/standardized-fields/?is_client_field=true');
     return response.data.results;
   };
   
   export const getCoreClientFields = async (): Promise<ClientField[]> => {
     const response = await api.get('forms/standardized-fields/?is_client_field=true&is_core_field=true');
     return response.data.results;
   };
   ```

2. **Dynamic Client Form**
   ```typescript
   // Modify frontend/src/components/clients/ClientForm.tsx
   interface ClientFormProps {
     clientId?: string;
     onSave?: (client: Client) => void;
     onCancel?: () => void;
   }
   
   const ClientForm: React.FC<ClientFormProps> = ({ clientId, onSave, onCancel }) => {
     const [client, setClient] = useState<Client | null>(null);
     const [fields, setFields] = useState<ClientField[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     
     useEffect(() => {
       const loadData = async () => {
         try {
           // Load client fields definition
           const clientFields = await getClientFields();
           setFields(clientFields);
           
           // If editing, load client data
           if (clientId) {
             const clientData = await fetchClientById(clientId);
             setClient(clientData);
           }
           
           setLoading(false);
         } catch (err) {
           setError('Failed to load data');
           setLoading(false);
         }
       };
       
       loadData();
     }, [clientId]);
     
     // Render dynamic form fields based on the fields definition
     const renderFormFields = () => {
       // Group fields by category
       const fieldsByCategory = fields.reduce((acc, field) => {
         if (!acc[field.display_category]) {
           acc[field.display_category] = [];
         }
         acc[field.display_category].push(field);
         return acc;
       }, {} as Record<string, ClientField[]>);
       
       return Object.entries(fieldsByCategory).map(([category, categoryFields]) => (
         <Box key={category} sx={{ mb: 4 }}>
           <Typography variant="h6" sx={{ mb: 2 }}>{category}</Typography>
           <Grid container spacing={2}>
             {categoryFields.map((field) => (
               <Grid item xs={12} sm={6} key={field.name}>
                 {renderField(field)}
               </Grid>
             ))}
           </Grid>
         </Box>
       ));
     };
     
     // Render individual fields based on field type
     const renderField = (field: ClientField) => {
       // Handle different field types here...
     };
     
     // Rest of the component...
   };
   ```

### Phase 2: Extended Functionality

The technical tasks for extended functionality include:

1. **Client Data Validation**
   - Implement validation for different field types (dates, numbers, emails, etc.)
   - Support for complex validation rules defined in the StandardizedField

2. **Advanced Search and Filtering**
   - Database optimizations for JSON field queries
   - Custom filter implementation for dynamic fields

3. **Field Management UI**
   - Admin interface for adding, editing, and organizing client fields
   - Field relationships and dependencies

## Technical Specifications

### Database Changes

1. **Client Table**
   - Remove most fixed columns except for essential ones
   - Add JSONField for dynamic data storage
   - Maintain indexes on frequently queried fields

2. **StandardizedField Table**
   - Add fields for client data integration
   - Add indexes for efficient queries

### API Changes

1. **New Endpoints**
   - `/api/client-fields/` - Get field definitions for clients
   - `/api/client-fields/core/` - Get core fields for listings

2. **Modified Endpoints**
   - `/api/clients/` - Support for dynamic fields and filtering

### Frontend Components

1. **New Components**
   - `DynamicFormField.tsx` - Render fields based on field type
   - `FieldManager.tsx` - Manage client fields

2. **Modified Components**
   - `ClientForm.tsx` - Dynamic form generation
   - `ClientList.tsx` - Configurable columns and filters
   - `ClientDetails.tsx` - Dynamic field display

## Migration Strategy

1. **Data Preparation**
   - Create StandardizedField entries for all current client fields
   - Mark appropriate fields as client fields, core fields, and filterable

2. **Code Deployment**
   - Deploy backend changes with both models temporarily coexisting
   - Deploy frontend changes with feature flag

3. **Data Migration**
   - Run data migration to populate JSON fields
   - Verify data integrity
   - Enable new functionality

4. **Cleanup**
   - Measure performance and fix any issues
   - Remove unused code and columns (in a future update)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Data loss during migration | High | Create full backups; Thorough testing |
| Performance degradation | Medium | Database indexing; Caching; Monitoring |
| Feature regression | Medium | Comprehensive testing; Backward compatibility |
| Complexity increase | Medium | Clear documentation; Proper abstraction |
| Deployment issues | Medium | Staged rollout; Feature flags | 