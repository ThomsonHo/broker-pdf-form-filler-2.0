# Implementation Clarification Questionnaire

## Purpose
This questionnaire aims to collect detailed information about specific aspects of the project that require further clarification before implementation. Your responses will help ensure that the development team has a clear understanding of expectations and requirements for complex features.

## Timeline and Resource Planning

1. **Timeline Estimation**
   - What is the expected project duration from start to completion?
   - Are there any specific milestone deadlines that must be met?
   - Is the project expected to be delivered in phases? If so, please outline the phases and their priorities.

    [ASAP, no timeline estimations as the coding will be done by one person leveraging AI coding tools]

2. **Resource Allocation**
   - How many developers are expected to work on this project?
   - Will there be dedicated resources for frontend, backend, and database development?
   - Is there a project manager or product owner who will be the primary point of contact?

   [ The lead programmer will be the sole programmer of this project and system ]

## Technical Decision Points

3. **Backend Framework Selection**
   - The requirements mention both Django and Flask as options. Which framework is preferred and why? 
   - Are there any specific features of either framework that are particularly important for this project?
   - What factors should be considered in making this decision?

   [No preferences, you should recommend one based on the functions and features required as well as the ease of integration and maintenance with the entire system]

4. **PDF Form Mapping Implementation**
   - The requirements describe a complex PDF form mapping system. Please provide more details on:
     - How should the system handle dynamic field mapping for different insurance companies?
     [ Admin will define the field mapping between the system standardized fields against the available form fields of each PDF via the field mapping UI]
     - Are there any specific PDF libraries that have been tested and preferred?
     [ pdftk seems to be the best library that works best, but we should retest the various libraries during the development phase to ensure the compatibility of the PDF filling feature ]
     - What is the expected workflow for administrators to set up new form mappings?
     [ admin will load the fillable PDFs into system / system will identify the fillable fields and allow admin to conduct the mapping of fillable fields against the system fields / system will save the mapping into database ]
     - Will there be a need to support batch updates to field mappings?
     [ no batch updates ]

5. **Data Migration**
   - Is there an existing system (v1) with data that needs to be migrated?
   - What is the expected volume of data to be migrated?
   - Are there any specific data transformation requirements during migration?
   - What is the expected strategy for validating the migrated data?

   [ no data migration]

## LLM Integration

6. **LLM Integration Details**
   - Which LLM API is preferred or has been selected for client data extraction?
   [ azure open ai via API, default model is gpt-4o-mini ]
   - Are there any specific budget constraints or rate limitations to consider?
   [ no limit ]
   - What is the expected fallback strategy if the LLM service is unavailable?
   [ throw exception, no fallback ]
   - How should the system handle extraction errors or low-confidence extractions?
   [ no special handling, user can repeat step to perform extraction again ]
   - What level of user intervention is acceptable in the extraction process?
   [ no user intenvention ]

## Risk Management

7. **Potential Challenges and Contingencies**
   - What are the most critical features that must work correctly for the system to be considered successful?
   [ LLM extraction of client data fields / storage of client data / correct population of client data onto PDF forms ]
   - Are there any known technical challenges from previous versions that should be addressed?
   [ N/A ]
   - What is the contingency plan if certain features prove more difficult to implement than anticipated?
   [ all features are must have for the system, will find alternative methods / logics to ensure successful implementation ]
   - How should the team prioritize features if time constraints become an issue?
   [ to be decided by the owner if such challenges are encountered ]

## Additional Requirements Clarification

8. **User Experience Expectations**
   - Are there any specific performance requirements for the PDF form generation process?
   [ no ]
   - What is the expected response time for client data extraction using the LLM?
   [ within 5 seconds ]
   - Are there any preferences for the UI/UX design (e.g., specific design system or style guide)?
   [ simple and flat design, can use standard libraries without fancy design. ]

9. **Testing Requirements**
   - What types of testing are expected (unit, integration, end-to-end)?
   [ unit, integration and end-to-end]
   - Is there a preferred testing framework or approach?
   [ you may propose ]
   - What level of test coverage is expected?
   [ key features to be tested first, other bugs can be resolved during UAT ]
   - Will there be a dedicated QA phase, or should testing be integrated throughout development?
   [ testing should be integrated throughout development ]

10. **Deployment and DevOps**
    - What is the preferred cloud provider for deployment?
    [ azure, aws, google cloud -- as prioritized ]
    - Are there any specific security requirements or compliance standards that must be met?
    [ no, but should adhere to general security best practices for small systems ]
    - Is there an existing CI/CD pipeline that should be utilized?
    [ no existing ]
    - What monitoring solutions should be implemented?
    [ basic cloud healthchecks only should be sufficient ]

## Next Steps
Please provide your responses to these questions to help us refine our implementation approach. Your insights will enable us to create a more detailed and accurate implementation plan with appropriate timeline estimates and resource allocations.

For each question, please provide as much detail as possible, including any examples, preferences, or constraints that might impact the development process.