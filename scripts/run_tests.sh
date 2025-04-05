#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting test suite...${NC}"

# Function to run tests and check status
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${YELLOW}Running $test_name...${NC}"
    if eval $test_command; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        return 1
    fi
}

# Backend Tests
echo -e "\n${YELLOW}=== Backend Tests ===${NC}"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run backend tests
cd backend
run_test "Backend Unit Tests" "python manage.py test"
run_test "Backend Linting" "flake8"
BACKEND_STATUS=$?

# Frontend Tests
echo -e "\n${YELLOW}=== Frontend Tests ===${NC}"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Run frontend tests
run_test "Frontend Unit Tests" "npm run test"
run_test "Frontend Linting" "npm run lint"
run_test "Frontend Type Checking" "npm run type-check"
FRONTEND_STATUS=$?

# Integration Tests
echo -e "\n${YELLOW}=== Integration Tests ===${NC}"
run_test "Integration Tests" "npm run test:integration"
INTEGRATION_STATUS=$?

# E2E Tests
echo -e "\n${YELLOW}=== E2E Tests ===${NC}"
run_test "E2E Tests" "npm run test:e2e"
E2E_STATUS=$?

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
[ $BACKEND_STATUS -eq 0 ] && echo -e "${GREEN}✓ Backend tests passed${NC}" || echo -e "${RED}✗ Backend tests failed${NC}"
[ $FRONTEND_STATUS -eq 0 ] && echo -e "${GREEN}✓ Frontend tests passed${NC}" || echo -e "${RED}✗ Frontend tests failed${NC}"
[ $INTEGRATION_STATUS -eq 0 ] && echo -e "${GREEN}✓ Integration tests passed${NC}" || echo -e "${RED}✗ Integration tests failed${NC}"
[ $E2E_STATUS -eq 0 ] && echo -e "${GREEN}✓ E2E tests passed${NC}" || echo -e "${RED}✗ E2E tests failed${NC}"

# Exit with error if any test suite failed
if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ] && [ $INTEGRATION_STATUS -eq 0 ] && [ $E2E_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi 