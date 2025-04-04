# Phase 1 Testing Instructions

## Overview
This document provides instructions for testing the authentication and dashboard modules of the Broker PDF Form Filler application. The testing phase covers both automated tests and manual testing procedures.

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- Virtual environment with all dependencies installed
- Access to test database

## 1. Backend Testing

### 1.1 Authentication Module Tests
```bash
cd backend
python manage.py test broker_pdf_filler.authentication.tests -v 2
```

Test cases cover:
- User registration
- Login functionality
- Password reset flow
- JWT token generation and validation
- Session management
- User activity tracking

### 1.2 Dashboard Module Tests
```bash
cd backend
python manage.py test broker_pdf_filler.dashboard.tests -v 2
```

Test cases cover:
- Dashboard metrics calculation
- Quick access links functionality
- User quota tracking
- Data aggregation and caching

## 2. Frontend Testing

### 2.1 Unit Tests
```bash
cd frontend
npm test
```

Components tested:
- Authentication forms
- Dashboard components
- API integration
- State management
- Error handling

### 2.2 Manual Testing Checklist

#### Authentication Module
- [ ] User Registration
  1. Navigate to registration page
  2. Test form validation
  3. Verify email confirmation
  4. Check password requirements
  5. Test duplicate email handling

- [ ] Login
  1. Test with valid credentials
  2. Test with invalid credentials
  3. Verify "Remember Me" functionality
  4. Test session persistence
  5. Verify logout functionality

- [ ] Password Reset
  1. Request password reset
  2. Verify email delivery
  3. Test reset link expiration
  4. Verify password update
  5. Test invalid token handling

#### Dashboard Module
- [ ] Metrics Display
  1. Verify all metrics are displayed correctly
  2. Check real-time updates
  3. Test data refresh functionality
  4. Verify historical data display
  5. Test metric calculations

- [ ] Quick Access Links
  1. Test all navigation links
  2. Verify proper routing
  3. Check icon display
  4. Test link ordering
  5. Verify access restrictions

- [ ] User Quota
  1. Check quota display
  2. Verify usage tracking
  3. Test quota limit warnings
  4. Verify monthly reset
  5. Test quota exceeded handling

## 3. Integration Testing

### 3.1 API Integration
- Test all API endpoints with Swagger UI
- Verify proper error handling
- Check response formats
- Test rate limiting
- Verify authentication requirements

### 3.2 Cross-browser Testing
Test the application in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 3.3 Responsive Design
Test on:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## 4. Performance Testing

### 4.1 Load Testing
- Test dashboard with simulated user load
- Verify caching mechanisms
- Check response times under load
- Monitor server resource usage

### 4.2 Security Testing
- Test authentication bypass attempts
- Verify CORS settings
- Check JWT token security
- Test API endpoint security
- Verify data encryption

## 5. Bug Reporting

When reporting bugs:
1. Provide clear steps to reproduce
2. Include expected vs actual behavior
3. Attach screenshots if applicable
4. Note browser/device information
5. Include error messages/logs

## 6. Test Environment Setup

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# Frontend setup
cd frontend
npm install
npm run build
```

## 7. Acceptance Criteria

The testing phase is considered complete when:
- All automated tests pass
- Manual testing checklist is completed
- No critical or high-priority bugs remain
- Performance metrics meet requirements
- Security requirements are satisfied

## Contact

For questions or issues during testing, contact:
- Technical Lead: [Email]
- Project Manager: [Email]
- QA Lead: [Email] 