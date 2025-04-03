1.1 User Screen Flow: Login, Authentication & Password Reset

Code snippet

graph TD
    A(Start) --> B[Login Screen];
    B -- Enter Credentials --> C{Validate Credentials};
    C -- Valid --> D{Role Check};
    C -- Invalid --> E[Show Login Error];
    E --> B;

    D -- Admin --> F[Admin Dashboard];
    D -- Standard User --> G[Standard User Dashboard];
    F --> H(End);
    G --> H;

    B -- Click 'Forgot Password?' --> I[Password Reset Request Screen];
    I -- Enter Email --> J[System Sends Reset Link];
    J --> K[Show 'Check Email' Confirmation];
    K --> B; %% Or just end this sub-flow visually

    subgraph Password Reset via Email Link
        L(User Clicks Email Link) --> M[Password Reset Form Screen];
        M -- Enter New Password --> N{Validate Token & Password Rules};
        N -- Valid --> O[Password Updated];
        O --> P[Show Success Message on Login Screen];
        P --> B;
        N -- Invalid --> Q[Show Reset Error];
        Q --> M;
    end
1.2 User Screen Flow: Standard User - Client Management

Code snippet

graph TD
    A[Standard User Dashboard] --> B[Client List Screen];
    B -- Use Search/Filter/Sort --> B;
    B -- Click 'Add New Client' --> C[Client Data Input - Step 1: Free Text (Optional)];
    B -- Click Client Record --> D[Client Details Screen];
    B -- Click Pagination --> B;

    C -- Enter Text/Skip --> E[Client Data Input - Step 2: Structured Form];
    E -- Review/Fill/Correct Data --> F{Attempt Save};
    F -- Validation OK --> G[Client Record Saved/Updated];
    G --> B; %% Or Client Details if coming from edit
    F -- Validation Fail --> H[Highlight Errors];
    H --> E;

    D -- Click 'Edit Client' --> E;
    D -- Click 'Generate Forms' --> I(Start Form Generation Flow 1.3);
    D -- View/Download Past Form --> J[Handle Form Access based on Retention];
    J --> D;
    D -- Navigate Back --> B;
1.3 User Screen Flow: Standard User - PDF Form Generation

Code snippet

graph TD
    A(Start: From Client Details or Dashboard) --> B[Form Set Selection Screen];
    B -- Select Form Set --> C[Client Data Confirmation Screen (Editable)];
    C -- Edit Data (Optional) --> C;
    C -- Confirm Data / Generate --> D{Check Quota};
    D -- Quota OK --> E[Form Generation In Progress...];
    D -- Quota Exceeded --> F[Show Quota Error];
    F --> C; %% Go back to previous screen

    E -- Generation Complete --> G[Form Preview Screen];
    G -- Review Forms --> H{Forms Correct?};
    H -- Yes --> I[Download Forms Action];
    I -- Package & Prompt Download --> J[Generation History Recorded];
    J --> K[Return to Client Details/Dashboard];
    K --> L(End);

    H -- No --> M[Navigate Back/Edit Data];
    M --> C; %% Loop back to Data Confirmation/Edit
1.4 User Screen Flow: Admin - User Management

Code snippet

graph TD
    A[Admin Dashboard] --> B[User List Screen];
    B -- Search/Filter --> B;
    B -- Click 'Create User' --> C[Create User Form Screen];
    B -- Click 'Edit' on User --> D[Edit User Form Screen];
    B -- Click User Record/Details --> E[User Details Screen];
    E --> B;

    C -- Fill Form --> F{Attempt Save};
    D -- Edit Form --> F;

    F -- Validation OK --> G[User Created/Updated];
    G --> H[Show Success Message];
    H --> B;
    F -- Validation Fail --> I[Highlight Errors];
    I --> C; %% Or D if editing
1.5 User Screen Flow: Admin - Form Template & Mapping

Code snippet

graph TD
    A[Admin Dashboard] --> B[Form Template List Screen];
    B -- Click 'Upload Template' --> C[Upload Form Template Screen];
    B -- Click 'Edit Mapping' --> D[Field Mapping Interface Screen - Load Existing];

    C -- Select File, Specify Type --> E[Upload & Analyze Action];
    E -- System Analyzes Fields --> F[Field Mapping Interface Screen - New];

    subgraph Mapping
        direction LR
        F --> G{Map Fields};
        D --> G;
        G -- Associate PDF Fields w/ System Fields --> H[Save Mapping Action];
    end

    H -- Mapping Saved --> I[Show Success Message];
    I --> B;

2.1 Data Flow: User Authentication

Code snippet

graph TD
    subgraph User Interaction
        A[User Browser] -- 1. Credentials --> B[Frontend];
    end
    subgraph System Processing
        B -- 2. Credentials (HTTPS) --> C[Backend API];
        C -- 3. Query User --> D[Database];
        D -- 4. User Record/Null --> C;
        C -- 5. Session Token / Error --> B;
    end
    subgraph User Feedback
        B -- 6. Store Token / Display --> A;
    end
2.2 Data Flow: Client Data Creation/Update (with LLM)

Code snippet

graph TD
    subgraph User Input
        A[User Browser] -- 1. Free Text --> B[Frontend];
    end
    subgraph Backend LLM Interaction
        B -- 2. Free Text --> C[Backend API];
        C -- 3. Get Field Guides --> D[Database];
        D -- Field Guides --> C;
        C -- 4. Text + Guides --> E[External LLM Service];
        E -- 5. Structured Data JSON --> C;
    end
    subgraph Verification & Save
        C -- 6. Structured Data --> B;
        B -- 7. Display for Verification --> A;
        A -- 8. Confirmed/Edited Data --> B;
        B -- 9. Final Client JSON --> C;
        C -- 10. Validate & Save --> D;
        D -- 11. Confirm Save --> C;
        C -- 12. Success/Error --> B;
    end
    subgraph User Feedback
        B -- 13. Display Confirmation --> A;
    end

2.3 Data Flow: PDF Form Generation

Code snippet

graph TD
    subgraph Request Initiation
        A[User Browser] -- 1. Request (Client ID, Form Set ID) --> B[Frontend];
        B -- 2. Request + User Token --> C[Backend API];
    end

    subgraph Data Aggregation [Backend]
        C -- 3. Get User --> D[Database];
        D -- User Data --> C;
        C -- 4. Get Client Data --> D;
        D -- Client Data --> C;
        C -- 5. Get Broker Data --> D;
        D -- Broker Data --> C;
        C -- 6. Get Mappings & FormSet Def --> D;
        D -- Mappings/Def --> C;
        C -- 7. Get PDF Templates --> E[Cloud Storage / DB];
        E -- Templates --> C;
    end

    subgraph PDF Generation [Backend]
        C -- 8. Compiled Data + Templates + Mappings --> F[PDF Engine];
        F -- 9. Generate Filled PDFs --> C;
        C -- 10. Generated PDF(s) --> E; %% Store Generated PDF
    end

    subgraph Record Keeping & Response [Backend]
        C -- 11. Record Generation History --> D;
        C -- 12. Update User Quota --> D;
        C -- 13. Success + Download Links --> B;
    end

    subgraph User Interaction
        B -- 14. Display Preview/Links --> A;
        A -- 15. Click Download Link --> E; %% User downloads directly or via Backend proxy
    end
2.4 Data Flow: Admin - Form Template Upload & Mapping

Code snippet

graph TD
    subgraph Upload
        A[User Browser] -- 1. PDF File + Metadata --> B[Frontend];
        B -- 2. File + Metadata --> C[Backend API];
        C -- 3. Store Template --> D[Cloud Storage / DB];
    end
    subgraph Analysis & Mapping Setup
        C -- 4. Analyze PDF --> E[PDF Engine / Logic];
        E -- Extracted Field Names --> C;
        C -- 5. Field List + Template ID --> B;
        B -- 6. Display Mapping UI --> A;
    end
    subgraph Save Mapping
        A -- 7. Mapping Configuration --> B;
        B -- 8. Mapping Config --> C;
        C -- 9. Save Mapping Config --> F[Database];
        F -- 10. Confirm Save --> C;
        C -- 11. Success Confirmation --> B;
    end
    subgraph User Feedback
         B -- 12. Display Success --> A;
    end
    