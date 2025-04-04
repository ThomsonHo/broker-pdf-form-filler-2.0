::: mermaid
graph TD
    subgraph Request Initiation
        A[User Browser] -- 1 Request (Client ID, Form Set ID) --> B[Frontend];
        B -- 2 Request + User Token --> C[Backend API];
    end

    subgraph Data Aggregation [Backend]
        C -- 3 Get User --> D[Database];
        D -- User Data --> C;
        C -- 4 Get Client Data --> D;
        D -- Client Data --> C;
        C -- 5 Get Broker Data --> D;
        D -- Broker Data --> C;
        C -- 6 Get Mappings & FormSet Def --> D;
        D -- Mappings/Def --> C;
        C -- 7 Get PDF Templates --> E[Cloud Storage / DB];
        E -- Templates --> C;
    end

    subgraph PDF Generation [Backend]
        C -- 8 Compiled Data + Templates + Mappings --> F[PDF Engine];
        F -- 9 Generate Filled PDFs --> C;
        C -- 10 Generated & Store PDF(s) --> E;
    end

    subgraph Record Keeping & Response [Backend]
        C -- 11 Record Generation History --> D;
        C -- 12 Update User Quota --> D;
        C -- 13 Success + Download Links --> B;
    end

    subgraph User Interaction
        B -- 14 Display Preview/Links --> A;
        A -- 15 Click Download Link [User downloads directly or via Backend proxy] --> E;
    end
:::