::: mermaid 
graph TD
    A(Start: From Client Details or Dashboard) --> B[Form Set Selection Screen];
    B -- Select Form Set --> C[Client Data Confirmation Screen - Editable];
    C -- Edit Data (Optional) --> C;
    C -- Confirm Data / Generate --> D{Check Quota};
    D -- Quota OK --> E[Form Generation In Progress...];
    D -- Quota Exceeded --> F[Show Quota Error];
    F -- Go back to previous screen --> C;

    E -- Generation Complete --> G[Form Preview Screen];
    G -- Review Forms --> H{Forms Correct?};
    H -- Yes --> I[Download Forms Action];
    I -- Package & Prompt Download --> J[Generation History Recorded];
    J --> K[Return to Client Details/Dashboard];
    K --> L(End);

    H -- No --> M[Navigate Back/Edit Data];
    M -- Loop back to Data Confirmation/Edit --> C;
:::