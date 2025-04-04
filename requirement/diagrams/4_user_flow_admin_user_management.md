::: mermaid
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
    I --> C;
    I -- if editing --> D;
:::