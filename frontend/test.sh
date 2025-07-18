#!/bin/bash

# frontend/test.sh
# This script runs unit tests for the frontend application.

echo "--- Running Frontend Tests ---"

# Navigate to the frontend application directory
# Assuming this script is called from the project root: ./frontend/test.sh
cd frontend/ || { echo "Error: 'frontend' directory not found. Please run this script from the project root."; exit 1; }

# Ensure dependencies are installed first in CI/CD environments
echo "  Ensuring npm dependencies are installed..."
npm install
if [ $? -ne 0 ]; then
    echo "npm install FAILED for frontend. Cannot proceed with testing."
    exit 1
fi

echo "  Running Vitest tests..."
# The 'npm test' command will execute Vitest
npm test
# Capture the exit code of npm test
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "--- Frontend Tests FAILED ---"
    exit 1 # Exit with a non-zero code to indicate failure in CI/CD
else
    echo "--- Frontend Tests PASSED ---"
    exit 0 # Exit with zero code to indicate success
fi