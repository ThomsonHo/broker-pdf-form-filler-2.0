::: mermaid
graph TD
    subgraph User Interaction
        A[User Browser] -- 1 Credentials --> B[Frontend];
    end
    subgraph System Processing
        B -- 2 Credentials (HTTPS) --> C[Backend API];
        C -- 3 Query User --> D[Database];
        D -- 4 User Record/Null --> C;
        C -- 5 Session Token / Error --> B;
    end
    subgraph User Feedback
        B -- 6 Store Token / Display --> A;
    end
:::