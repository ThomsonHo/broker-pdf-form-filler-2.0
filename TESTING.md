# Local Testing Environment Setup Guide

This guide will help you set up and run the local testing environment for both the frontend and backend components of the Broker PDF Form Filler application.

## Prerequisites

- Python 3.12 or higher
- Node.js 18.x or higher
- npm 9.x or higher
- Git
- A modern web browser (Chrome, Firefox, or Safari)

## Backend Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd broker-pdf-form-filler-2.0
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # For Unix/macOS
   python3 -m venv venv
   source venv/bin/activate

   # For Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Create a .env file in the backend directory
   echo "DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   JWT_SECRET_KEY=your-jwt-secret-key-here" > .env
   ```

5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser for testing:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at http://localhost:8000/

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file in the frontend directory
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_JWT_STORAGE_KEY=broker_pdf_filler_jwt" > .env
   ```

4. Build the frontend application:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

   Or for development with hot reloading:
   ```bash
   npm run dev
   ```

The frontend application will be available at:
- Development: http://localhost:3000
- Production: http://localhost:3000

## Testing the Application

1. Start both servers in separate terminals:
   ```bash
   # Terminal 1 (Backend)
   cd backend
   source ../venv/bin/activate  # For Unix/macOS
   python manage.py runserver

   # Terminal 2 (Frontend)
   cd frontend
   npm run build  # Only needed for first run or after changes
   npm start      # Or 'npm run dev' for development
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/swagger/

3. Default test credentials:
   ```
   Email: test@example.com
   Password: testpass123
   ```

## Common Issues and Solutions

1. **Frontend Build Errors**
   - Clear the `.next` directory and node_modules:
     ```bash
     cd frontend
     rm -rf .next node_modules package-lock.json
     npm install
     npm run build
     ```

2. **Backend Authentication Issues**
   - Verify JWT secret keys match in frontend and backend
   - Check CORS settings in backend/settings.py
   - Clear browser storage and try again

3. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check database credentials in settings.py
   - Verify database exists and user has proper permissions

## Development Workflow

1. Backend Development:
   ```bash
   cd backend
   source ../venv/bin/activate
   python manage.py runserver
   ```

2. Frontend Development:
   ```bash
   cd frontend
   npm run dev
   ```

3. Building for Production:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Code Quality Checks

1. Backend linting:
   ```bash
   cd backend
   flake8
   black .
   ```

2. Frontend linting:
   ```bash
   cd frontend
   npm run lint
   npm run format
   ```

## Support

For additional help or to report issues:
1. Check the project documentation
2. Review existing issues in the repository
3. Contact the development team

Remember to always work in a clean development environment and follow the project's coding standards and git workflow. 