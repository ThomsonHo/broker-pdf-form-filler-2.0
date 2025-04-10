# Standardized Fields Flowchart

```mermaid
graph TD
    %% Frontend Components
    subgraph Frontend
        SFM[StandardizedFieldManagement]
        FB[FieldBuilder]
        FL[FieldList]
        SFS[StandardizedFieldService]
        API[API Service]
    end

    %% Backend Components
    subgraph Backend
        SFV[StandardizedFieldViewSet]
        SFCV[StandardizedFieldCategoryViewSet]
        SFS[StandardizedFieldSerializer]
        SFCS[StandardizedFieldCategorySerializer]
        SFM[StandardizedField Model]
        SFCM[StandardizedFieldCategory Model]
    end

    %% Database
    subgraph Database
        DB[(PostgreSQL)]
    end

    %% Frontend Interactions
    SFM -->|CRUD Operations| SFS
    FB -->|Field Configuration| SFM
    FL -->|Display Fields| SFM
    SFS -->|API Calls| API
    API -->|HTTP Requests| SFV
    API -->|HTTP Requests| SFCV

    %% Backend Processing
    SFV -->|Validate & Transform| SFS
    SFCV -->|Validate & Transform| SFCS
    SFS -->|Transform Data| SFM
    SFCS -->|Transform Data| SFCM
    SFM -->|ORM Operations| DB
    SFCM -->|ORM Operations| DB

    %% Data Flow
    subgraph Data Flow
        direction LR
        A[Field Definition] -->|Create/Update| B[Frontend Validation]
        B -->|API Request| C[Backend API]
        C -->|Validate & Transform| D[Serializer]
        D -->|ORM| E[Database]
        E -->|Response| F[Frontend]
        F -->|Render| G[User Interface]
    end

    %% Legend
    subgraph Legend
        direction LR
        L1[Frontend Component]
        L2[Backend Component]
        L3[Database]
        L4[Data Flow]
    end
```

## Flowchart Explanation

### Frontend Components
1. **StandardizedFieldManagement**
   - Main component for managing fields
   - Handles CRUD operations
   - Manages field categories
   - Controls pagination and search

2. **FieldBuilder**
   - Builds and edits field definitions
   - Configures validation rules
   - Sets up relationships
   - Manages field options

3. **FieldList**
   - Displays standardized fields
   - Shows field categories
   - Indicates validation status
   - Displays relationships

4. **StandardizedFieldService**
   - Handles API communication
   - Manages data transformation
   - Handles error cases
   - Provides type safety

5. **API Service**
   - Centralized API client
   - Handles authentication
   - Manages request/response
   - Provides error handling

### Backend Components
1. **StandardizedFieldViewSet**
   - Handles field-related API endpoints
   - Processes CRUD operations
   - Manages pagination
   - Handles filtering and search
   - Enforces permissions

2. **StandardizedFieldCategoryViewSet**
   - Handles category-related API endpoints
   - Processes category operations
   - Manages category relationships
   - Enforces permissions

3. **Serializers**
   - Handle data validation
   - Transform data between frontend and backend
   - Manage field relationships
   - Enforce data integrity

4. **Models**
   - Define database schema
   - Handle ORM operations
   - Enforce data constraints
   - Manage relationships

### Data Flow
1. **Field Definition**
   - Admin creates/updates fields through frontend
   - Frontend validates input
   - Data is sent to backend via API

2. **Backend Processing**
   - API endpoints receive requests
   - Serializers validate and transform data
   - Models handle database operations
   - Response is sent back to frontend

3. **Frontend Processing**
   - API responses are processed
   - Data is transformed for display
   - UI is updated accordingly
   - User feedback is provided

4. **Security Flow**
   - All requests include authentication
   - Backend enforces permissions
   - Data validation at multiple levels
   - Secure database access

### Key Changes from Previous Version
1. Added Models layer in backend
2. Corrected data flow to show proper ORM usage
3. Clarified serializer role in data transformation
4. Updated backend processing flow
5. Added proper database access through models 