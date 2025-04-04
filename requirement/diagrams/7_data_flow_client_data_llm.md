::: mermaid
graph TD
    subgraph User Input
        A[User Browser] -- 1 Free Text --> B[Frontend];
    end
    subgraph Backend LLM Interaction
        B -- 2 Free Text --> C[Backend API];
        C -- 3 Get Field Guides --> D[Database];
        D -- Field Guides --> C;
        C -- 4 Text + Guides --> E[External LLM Service];
        E -- 5 Structured Data JSON --> C;
    end
    subgraph Verification & Save
        C -- 6 Structured Data --> B;
        B -- 7 Display for Verification --> A;
        A -- 8 Confirmed/Edited Data --> B;
        B -- 9 Final Client JSON --> C;
        C -- 10 Validate & Save --> D;
        D -- 11 Confirm Save --> C;
        C -- 12 Success/Error --> B;
    end
    subgraph User Feedback
        B -- 13 Display Confirmation --> A;
    end
:::