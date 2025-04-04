::: mermaid
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
:::