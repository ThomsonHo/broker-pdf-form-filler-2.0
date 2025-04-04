::: mermaid
graph TD
    A[Standard User Dashboard] --> B[Client List Screen];
    B -- Use Search/Filter/Sort --> B;
    B -- Click 'Add New Client' --> C[Client Data Input - Step 1: Free Text - Optional];
    B -- Click Client Record --> D[Client Details Screen];
    B -- Click Pagination --> B;

    C -- Enter Text/Skip --> E[Client Data Input - Step 2: Structured Form];
    E -- Review/Fill/Correct Data --> F{Attempt Save};
    F -- Validation OK --> G[Client Record Saved/Updated];
    G --> B; 
    F -- Validation Fail --> H[Highlight Errors];
    H --> E;

    D -- Click 'Edit Client' --> E;
    D -- Click 'Generate Forms' --> I(Start Form Generation Flow 1.3);
    D -- View/Download Past Form --> J[Handle Form Access based on Retention];
    J --> D;
    D -- Navigate Back --> B;
:::