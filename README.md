# Broker PDF Form Filler 2.0

A comprehensive system for automated insurance form generation that enables brokers to efficiently manage client information and generate required PDF forms with minimal manual input.

## Project Overview

This application allows brokers to:
- Manage client information effectively
- Extract client data using AI (LLM)
- Generate properly filled PDF forms for insurance applications
- Track form generation history and maintain form archives

## Tech Stack

### Backend
- **Framework**: Django 5 with Django REST Framework
- **Database**: PostgreSQL
- **PDF Processing**: PyPDF2, PyMuPDF, pdfrw
- **AI Integration**: OpenAI GPT-4 API, Google Gemini (backup)
- **Async Tasks**: Celery with Redis

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Material Design (MUI)
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Yup validation
- **PDF Handling**: react-pdf, pdf-lib
- **Internationalization**: i18next

## Development Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis (for Celery)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/broker-pdf-form-filler-2.0.git
   cd broker-pdf-form-filler-2.0
   ```

2. Set up Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

5. Initialize the database:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your specific configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Running Tests

### Backend Tests
```bash
cd backend
pytest
# For coverage report
pytest --cov=.
```

### Frontend Tests
```bash
cd frontend
npm test
# For coverage report
npm run test:coverage
```

## Project Structure

### Backend Structure
- `broker_pdf_filler/` - Main Django project directory
  - `users/` - User authentication and management
  - `clients/` - Client data management
  - `pdf_forms/` - PDF form generation and processing
  - `llm_integration/` - AI integration for data extraction

### Frontend Structure
- `src/` - Source code directory
  - `app/` - Next.js app directory (App Router)
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks
  - `lib/` - Utilities and helpers
  - `store/` - Zustand state management

## API Documentation

After running the backend server, API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Contributing

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with descriptive messages

3. Push and create a pull request to `main`

## Environment Variables

Refer to `.env.example` files in both `backend/` and `frontend/` directories for required environment variables.

## License

[Specify your license information here]

## Contact

[Your contact information]