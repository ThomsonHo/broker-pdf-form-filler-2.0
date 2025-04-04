[[ THIS DOCUMENT SHOULD ALWAYS BE IGNORED AND NOT REFERENCED BY ANYONE INCLUDING AI AGENTS ]]


# System Requirements Documentation for Online CRM System

## 1. Introduction
This document outlines the functional and technical requirements for an online CRM system. The system will support multiple users, provide user management capabilities, and enable users to manage client details. Additionally, it includes a PDF form filler feature that integrates with existing Python code.

---

## 2. Functional Requirements

### 2.1 User Management
- **User Roles**:
  - Admin: Manages user accounts, broker companies, and form templates.
  - Standard User: Accesses dashboards and performs client-related operations.
- **Admin Portal**:
  - Admin-only user creation (no self-registration)
  - User association with a single broker company
  - Management of user details including:
    - Basic information (name, email, contact details)
    - TR (Technical Representative) specific fields:
      - TR Name
      - TR License Number
      - TR Email Address (also as standard user login ID)
      - TR Phone Number
  - Broker company management:
    - Broker company name
    - Broker company code
    - Broker account codes for each insurance company
  - User quota management and monitoring
  - User activity monitoring and reporting

### 2.2 Authentication
- Secure login using industry-standard practices (e.g., OAuth or JWT)
- Password requirements:
  - Minimum length of 10 characters
  - Secure storage with hashing
- Password reset functionality:
  - Self-service password reset via email links
  - Secure token-based reset process
  - Limited-time validity for reset links
- Session management:
  - Session timeout for inactive users
  - Secure logout process
  - Prevention of concurrent logins (optional)

### 2.3 Post-login Dashboard
- Personalized dashboard for each user after login
- Dashboard components:
  - Total count of clients managed by the user
  - Name of the last accessed client
  - Basic client statistics (e.g., active/inactive counts)
  - Form generation statistics:
    - List of 5 most recently generated form sets with client names and dates
    - Current month's quota usage (forms generated vs. total allowed)
    - Visual representation of quota utilization (e.g., progress bar)
  - Quick access links to:
    - Create new client
    - Generate forms
    - View client list
    - Access recent clients

### 2.4 Client Management
- **Client Listing**:
  - Paginated list of all clients associated with the user (clients are user-specific, not visible to other users)
  - Search and filter functionality by client name, phone number, and ID number
  - Sorting capabilities for efficient client lookup
  - Clear indication of client status and basic information in the list view
  
- **Client Profile Data**:
  - Structured storage of comprehensive client information based on standardized fields:
    - Personal Information (name, date of birth, ID number, gender, marital status, etc.)
    - Contact Information (phone number, email, address details)
    - Employment Information (employer, occupation, work address)
    - Financial Information (income, expenses, tax residency)
    - Payment Information (payment methods and periods)
  - All required fields clearly marked to ensure complete client profiles
  - Support for both English and Chinese character input where applicable

- **Client Operations**:
  - Add new clients with validation for required fields
  - View detailed information about a client in a well-organized profile interface
  - Modify existing client details with change confirmation
  - Save updates to client records with appropriate validation
  - Client form history section showing previously generated form sets

- **Integration with Form Filler**:
  - Direct access to form generation from the client detail view
  - Form generation history for each client
  - Preview capability for previously generated forms (within 45-day retention period)
  - Download capability for previously generated forms (within 45-day retention period)
  - Generation history records maintained indefinitely, even after form removal

### 2.5 PDF Form Filler
- **Purpose**: Automates the process of generating pre-filled PDF forms using client data stored in the system.
- **Form Types**:
  - Broker-specific forms (unique to each user's broker company)
  - Insurance application and supporting forms specific to each insurance company and product series
- **Features**:
  - Users can select a specific form template from a predefined list based on insurance company and product
  - The system maps client details (e.g., name, address, contact information) to corresponding fields in the PDF form based on field identifiers
  - Supports dynamic field mapping for forms with varying structures using Python libraries like pdftk or PyPDFForm or PyMuPDF
  - Form preview functionality for each populated form in the selected form set
  - Client data editing capability before form generation (client profile data page)
  - Post-generation form preview capabilities
  - Storage of generated form sets under client records for future access
  - Simple field validation based on data types defined by admin
  - Generates and downloads completed forms
- **Usage Quotas**:
  - Limit of 10 form sets per day per user
  - Monthly quota system for form generation per user
  - Quota reset on a monthly basis

---

## 3. Technical Requirements

### 3.1 Frontend
- Framework: Next.js (React-based framework).
- Features:
  - Responsive design for compatibility across devices (desktop, tablet, mobile).
  - Standard UI components for dashboards, forms, tables, etc.

### 3.2 Backend
- Framework: Python (Django or Flask).
- Features:
  - RESTful API endpoints for frontend communication.
  - Secure handling of user data and authentication.
  - Integration with existing Python-based PDF form filler codebase.

### 3.3 Database
- Database: PostgreSQL
  - Relational database structure to store user data, client records, and metadata.
  - Support for indexing and efficient querying.

### 3.4 Deployment
- Containerization:
  - Use Docker to containerize the application for portability and scalability.
- Cloud Deployment:
  - Deploy on a cloud provider like Azure, AWS, or Google Cloud Platform.
  - Utilize managed services like Kubernetes (optional) for orchestration.

### 3.5 PDF Form Filling Technology
- **Supported Libraries**:
  - Multiple PDF manipulation approaches have been tested and are supported:
    - PyPDF2 with Field-by-Field Appearance Stream manipulation
    - pdfrw with Appearance Streams
    - PyPDF2 Direct Field Access
    - External Tool integration (pdftk)
  - New implementation will be built from scratch but informed by these tested approaches
  - Library selection will be based on performance, reliability, and maintenance considerations

- **Form Processing Capabilities**:
  - One client at a time processing model
  - Support for processing multiple PDF files as a single "form set" in one operation
  - No batch processing of multiple clients' data required
  - No file size limitations for PDF form templates or generated documents

- **Language Support**:
  - Full support for multilingual content including both English and Chinese characters
  - No translation functionality required; system will populate fields with data in the appropriate language as stored in the client database
  - Proper handling of character encoding to ensure accurate rendering of Chinese characters in PDF forms

- **Form Data Persistence**:
  - Generated forms stored securely on the server for 45 days
  - No special audit trail requirements for form access or downloads at this time

### 3.6 Error Handling and Validation
- **PDF Form Processing Errors**:
  - Log all form creation errors to backend database for administrative review
  - Display user-friendly alert messages when form generation errors occur
  - Provide appropriate fallback options for users in case of form generation failure
  - Field structures are predefined and should not contain mismatching elements

- **Data Validation**:
  - Validation of client information occurs at the time of saving client data, not during form population
  - Form field mappings are validated during setup by administrators
  - System alerts administrators to any potential issues with form field mappings
  - Validation errors are presented clearly to users with guidance on resolution

- **User Experience Considerations**:
  - Simple loading indicator or progress feedback during form generation processes
  - No specific accessibility requirements at this phase
  - No specific performance requirements for form generation time
  - Intuitive error messages that guide users on appropriate next steps
  - Preview capability allows users to verify form content before finalization

---

## 4. PDF Form Filler Details

### Overview
The PDF form filler automates generating pre-filled forms using data from the CRM system. This feature integrates seamlessly with an existing Python codebase designed for handling PDF forms.

### Form Categories
1. **Broker-Specific Forms**:
   - Each user has access to a unique set of forms specific to their broker company
   - These forms maintain brand consistency and regulatory compliance for each brokerage
   
2. **Insurance Company Forms**:
   - Multiple sets of forms organized by insurance company and product type
   - Users select the appropriate form set based on client needs and product requirements

### Workflow
1. **Client Selection**:
   - User selects a client from their client database
   
2. **Form Set Selection**:
   - User chooses the appropriate form set based on:
     - Insurance company (e.g., MetLife, Prudential)
     - Product type (e.g., term life, whole life, disability)
   
3. **Data Review and Modification**:
   - System displays client data that will be used to populate forms
   - User can review and modify client information if needed
   
4. **Form Preview**:
   - System generates previews for each form in the selected set
   - User can review all populated forms before finalizing
   
5. **Form Generation**:
   - System generates final PDF forms with all client data inserted
   - User can make post-generation edits if necessary
   
6. **Storage and Download**:
   - Generated form sets are saved in the client's record for future access
   - User can download the completed forms as a package

### Field Mapping and Validation
- **Standardized Fields**:
   - System maintains a library of standardized client data fields (e.g., name, gender, income)
   - Admin configures mapping between standardized fields and form-specific fields
   
- **Validation Rules**:
   - Simple data type validation (text, number, date, etc.)
   - Field requirements defined by admin through form fields mapping interface
   - Validation occurs prior to form generation

### Usage Quotas
- Daily limit of 10 form sets per user
- Monthly quota allocated to each user
- Quota tracking and reset system
- Usage statistics visible to users and admins

### 4.3 Form Mapping System

#### Field Mapping Architecture
- **Insurance Company-Specific Form Mapping**:
  - Dedicated mapping structure for each insurance company's form fields
  - Support for different form types within each insurance company (application, FNA, payment forms)
  - Mapping configurations stored in the database for better persistence and management
  - Field names standardized across the system but mapped uniquely for each form
  
- **One-to-Many Field Relationships**:
  - Support for mapping a single client data field to multiple form fields
  - Example: Client's full name may populate multiple fields across different pages
  - Array-based mapping to handle repetitive fields (e.g., beneficiary information)
  - Flexibility to map the same field differently across various insurance company forms

- **Structured Data Field Management**:
  - Multi-language name fields (English and Chinese versions maintained separately)
  - Address fields structured into components (flat, floor, block, building, street, district)
  - Date fields broken down into components (day, month, year) for forms requiring separate entries
  - Occupation information structured to include industry, exact duties, and employer details

#### Form Set Organization
- **Logical Form Grouping**:
  - Forms organized by both broker-specific and insurance company-specific categories
  - Clear separation between different form types:
    - Broker client agreements
    - Financial needs analysis (FNA) forms
    - Insurance application forms
    - Payment instruction forms
  - Ability to generate complete form sets with appropriate broker and insurer forms combined
  - Form templates stored in an organized directory structure for easy maintenance

---

## 5. Non-functional Requirements

### 5.1 Security
- **Transport Security**:
  - HTTPS encryption for all communication between frontend and backend
  - TLS 1.2 or higher for secure data transmission
  - Proper certificate management and renewal processes

- **Authentication and Authorization**:
  - Secure password requirements (minimum 10 characters)
  - Role-based access control (admin vs. standard user)
  - User-specific data isolation (no cross-user account data access)
  - Session management with appropriate timeout settings
  - Protection against common authentication attacks (brute force, credential stuffing)

- **Data Protection**:
  - No special encryption requirements for data at rest
  - Secure handling of API keys for external services (LLM integration)
  - Proper input validation to prevent injection attacks
  - Cross-site scripting (XSS) and cross-site request forgery (CSRF) protection

- **Operational Security**:
  - Regular security testing and code reviews
  - Dependency management to address known vulnerabilities
  - Cloud-based backup solution for disaster recovery
  - No specific audit trail requirements for client data modifications

### 5.2 Scalability
- Designed to handle increasing numbers of users and clients efficiently
- Horizontal scaling capability for backend services
- Content delivery network (CDN) for static frontend assets
- Database connection pooling and query optimization

### 5.3 Availability
- High availability ensured by deploying on reliable cloud platforms
- Load balancing to distribute traffic
- Automatic failover mechanisms where supported by cloud infrastructure
- Scheduled maintenance windows with minimal disruption

### 5.4 Maintainability
- Modular code structure to allow easy updates and feature additions
- Comprehensive API documentation
- Code comments and consistent style
- Version control and CI/CD pipeline for consistent deployment

---

## 6. System Architecture Overview

1. **Frontend**: Next.js application hosted on a cloud provider with CDN support.
2. **Backend**: Python-based REST API deployed as a Docker container on cloud infrastructure.
3. **Database**: PostgreSQL instance hosted on a cloud provider with automated backups enabled.
4. **Integration**: Direct interaction between backend and existing Python PDF form filler codebase.

---

## 7. Form Management and Administration

### 7.1 Form Template Management
- **Form Upload**:
  - Administrators can upload new PDF form templates to the system
  - During upload, admin must specify the form type:
    - Broker-specific form
    - Insurance company and product-related form
  - System analyzes uploaded PDF forms to identify fillable fields
  - Form templates are stored in a structured repository for efficient access

### 7.2 System Fields Configuration
- **Three Categories of System Fields**:
  1. **Client Standardized Fields**:
     - Generic client information (e.g., first name, last name, date of birth, mobile phone number)
     - Available system-wide for all form mappings
     - Administrators can define new client standardized fields as needed
     
  2. **Broker-Specific Fields**:
     - Information specific to broker companies (e.g., broker company name, company code, logo)
     - Available for all users associated with a particular broker
     - Configured at the broker company level
     
  3. **User-Specific Fields**:
     - Information specific to individual users (e.g., user name, license number, phone number)
     - Unique to each user in the system
     - Used to populate agent/broker sections of forms

### 7.3 Field Mapping Interface
- **Mapping Configuration UI**:
  - Two-column interface design:
    - Left column: List of PDF form fillable fields
    - Right column: Dropdown selector for corresponding system fields
  - Support for "null mappings" (fillable fields not mapped to any system field)
  - One system field can map to multiple form fields across different forms
  - Changes to mappings are saved and applied immediately
  - Preview functionality to test mappings on sample forms

### 7.4 Quota Management
- **Uniform Quota System**:
  - All users initially assigned the same form generation quota
  - Quota based on "sets of forms" generated (each set includes broker-specific forms plus insurance application and supporting forms)
  - Administrative interface to view and modify quotas across all users
  - Monthly quota reset process occurs automatically
  - Usage dashboard shows current utilization and remaining quota for each user

### 7.5 Form Storage Policy
- **Retention Period**:
  - Generated forms stored for 45 days from creation date
  - Automatic removal of forms older than 45 days
  - Generation history records maintained even after form removal
  - No limitations on storage size or number of form sets stored per client
  - User notification when accessing or attempting to download expired forms

### 7.6 Client Data Management
- **Data Persistence**:
  - Client information edited during form generation process will be persisted to the client database
  - Updates replace previous client information in the system permanently
  - Form generation interface doubles as a client data update mechanism
  - No separate approval process required for client data updates during form generation

---

## 8. Reporting and Monitoring

### 8.1 Usage Reporting
- **Administrator Reporting**:
  - Usage statistics visible in the user administration page
  - Form generation metrics tracked per user (total forms generated and quota remaining)
  - No additional reporting requirements at this phase

### 8.2 Error Monitoring
- **Error Logging**:
  - All form generation errors logged in the system database
  - Generation time for each form set logged for performance monitoring
  - No automated alerting required at this phase
  - Logs accessible to system administrators for troubleshooting

### 8.3 Compliance Reporting
- No specific compliance or regulatory reporting requirements at this phase

---

## 9. External Integrations

### 9.1 LLM Integration for Client Data Extraction
- **Purpose**:
  - Automates the extraction of structured client data from free-text input
  - Reduces manual data entry by parsing unstructured client information
  - Increases accuracy and consistency of client data

- **Functionality**:
  - Users can input free-text descriptions of client information
  - System calls an external LLM API to process the text input
  - LLM extracts structured data matching the system's standardized fields
  - Extracted data is presented to users for verification before form generation
  - Users can make corrections to extracted data before proceeding
  - Template loading functionality for sample client data to facilitate faster input

- **Integration Requirements**:
  - Secure API connection to external LLM service
  - Proper handling of API keys and authentication
  - Error handling for API failures or unavailability
  - Fallback to manual data entry if extraction fails
  - Configuration options for field extraction guidance

- **Field Extraction Logic**:
  - System provides extraction guides for each field to the LLM
  - Each standardized field includes specific "llm_guide" properties with instructions on how to extract data
  - Support for intelligent data transformation:
    - Date conversion (extracting and formatting day, month, year for birthdates)
    - Name parsing (splitting full names into first/last name components)
    - Address structuring (breaking down addresses into flat, floor, block, building, etc.)
    - Multi-language support (extracting both Chinese and English versions of names and other fields)
    - Converting text inputs to appropriate single-choice options (e.g., gender, education level)
  - Standardized fields from the system are mapped to extracted data
  - Missing required fields are clearly highlighted for user attention
  - Extraction confidence levels may be indicated for user review
  - Data type validation for extracted values

---

## 10. User Interface and Experience

### 10.1 User Journey
- **Client Data Input**:
  - Step 1: Free-text data input form similar to broker_form_filler_v1 system
  - Users can enter unstructured client information in a format similar to client_detail_input_template
  - System processes free text using LLM integration to extract structured data
  
- **Client Data Confirmation**:
  - Step 2: Structured view of extracted client data for verification
  - Fields organized by categories (Personal Information, Contact Information, etc.)
  - Required fields clearly marked for user attention
  - Missing required fields highlighted with appropriate warnings
  - Ability to edit extracted data before proceeding

- **Form Generation Workflow**:
  - Step 3: Form set selection and generation
  - Users select appropriate insurance company and product type 
  - System generates form set based on confirmed client information
  - Step 4: Form preview
  - User can preview populated forms after generation
  - Generated form sets are stored and linked to client record

### 10.2 Form Preview Functionality
- **PDF Preview Capabilities**:
  - In-browser preview of actual populated PDF forms
  - Ability to select and view individual forms within a form set
  - Page navigation controls for multi-page documents
  - Zoom functionality for detailed review
  - Preview interface that closely resembles the final printed form

- **Form Download Options**:
  - Download individual forms or complete form sets
  - Clear indication of download progress for large form sets
  - Option to re-download previously generated forms within retention period (45 days)

### 10.3 Language Support
- **Multilingual User Interface**:
  - Support for three languages:
    - Traditional Chinese
    - Simplified Chinese
    - English
  - Language selection option prominently available in UI
  - Consistent language application across all UI elements
  - No localization requirements for stored client data or PDF forms
  - System handles mixing of languages in client data fields appropriately

### 10.4 Responsive Design
- **Device Compatibility**:
  - Primary optimization for desktop browsers
  - Responsive design supporting tablets and mobile devices
  - Flexible layouts that adapt to different screen sizes
  - Touch-friendly interface elements for mobile users
  - Consistent functionality across devices with adaptive UI components

### 10.5 Usability Considerations
- **Form Filling Efficiency**:
  - Clear progress indicators during multi-step processes
  - Persistent storage of in-progress work to prevent data loss
  - Intuitive navigation between related screens
  - Consistent placement of action buttons across the application
  - Helpful tooltips and guidance for complex operations

### 10.6 Form Field Validation and Visual Indicators
- **Field Validation Approach**:
  - Visual guidance provided for all fields, not just required ones
  - Fields not validated due to missing/incomplete data shown with appropriate visual indicators
  - Distinction between mandatory fields and preferred/optional fields
  - Required fields clearly marked with visual indicators (e.g., asterisk)
  - Validation feedback does not prevent form submission if non-required fields are incomplete

- **Data Input Assistance**:
  - Visual feedback on field formats (e.g., date formats, ID number patterns)
  - Real-time validation where applicable without blocking user progress
  - Contextual help text for complex fields
  - Clear distinction between validation errors (which block submission) and warnings/recommendations
  - Support for different input formats with automated standardization

---

## 11. Implementation and Documentation

### 11.1 Development Priorities
- **Timeline**:
  - Implementation to begin immediately
  - Accelerated development schedule for fastest possible delivery
  - No phased deployment specified in requirements (to be handled in separate code delivery plan)
  - Key functionality prioritized over nice-to-have features when faced with time constraints

### 11.2 Testing Requirements
- **Quality Assurance Approach**:
  - Comprehensive testing of code as it is written
  - Prevention of major bugs and runtime errors as a priority
  - Functional testing to ensure all features work as specified
  - Performance testing for PDF generation and LLM integration features
  - User acceptance testing to confirm deliverables meet expectations

### 11.3 Documentation Requirements
- **User Documentation**:
  - Comprehensive user guide to be created after system development
  - Documentation covering all system features and workflows
  - Screenshots and step-by-step instructions for common tasks
  - Troubleshooting section for common issues

- **Technical Documentation**:
  - API documentation for all backend endpoints
  - System architecture diagrams
  - Database schema documentation
  - Deployment instructions for system administrators
  - Configuration guide for PDF form template setup
  
### 11.4 Training and Handover
- **Knowledge Transfer**:
  - Technical handover sessions with development team
  - System administration training for IT staff
  - End-user training materials to complement user documentation
  - Documentation of known limitations and future enhancement opportunities

---

## Conclusion
The proposed CRM system will provide robust features tailored to user needs while leveraging modern technologies like Next.js, Python frameworks, PostgreSQL, and containerization tools like Docker. The integration of the PDF form filler feature ensures seamless automation of document generation tasks using stored client data, enhancing overall system efficiency and usability.
