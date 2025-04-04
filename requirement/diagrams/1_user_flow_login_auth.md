::: mermaid
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
    K -- Or just end this sub-flow visually --> B;

    subgraph Password Reset via Email Link
        L(User Clicks Email Link) --> M[Password Reset Form Screen];
        M -- Enter New Password --> N{Validate Token & Password Rules};
        N -- Valid --> O[Password Updated];
        O --> P[Show Success Message on Login Screen];
        P --> B;
        N -- Invalid --> Q[Show Reset Error];
        Q --> M;
    end
:::