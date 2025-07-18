#!/bin/bash

# test.sh
# This script orchestrates running pytest for all backend services on the shared 'ecommerce_db' database.

# Define directories for your backend services (used for context for building Docker images)
SERVICE_DIRS=(
    "backend/user-service"
    "backend/product-service"
    "backend/cart-service"
    "backend/order-service"
)

# Define the service names as they appear in your docker-compose.yml
# These are the names you'll use with 'docker-compose exec'
SERVICE_NAMES=(
    "user-service"
    "product-service"
    "cart-service"
    "order-service"
)

echo "--- Preparing Test Environment ---"

# 1. Bring up ALL necessary services, including the DB and your backend services.
echo "Bringing up database and backend services for testing..."
docker-compose up -d db user-service product-service cart-service order-service

# 2. Wait for the main database to be truly ready for connections
echo "Waiting for 'ecommerce_db' database (db) to be up and healthy..."
DB_USER=$(grep POSTGRES_USER .env | cut -d '=' -f2)
DB_NAME=$(grep POSTGRES_DB .env | cut -d '=' -f2)

until docker-compose exec db pg_isready -U "$DB_USER" -d "$DB_NAME"; do
  echo "Database is unavailable - sleeping..."
  sleep 1
done
echo "'ecommerce_db' database is up and healthy."

# NOTE: No test database is created, and no schema migration/creation occurs here.
# All services (and all tests) MUST be configured to use the same 'ecommerce_db' database.
# WARNING: This will write test data to your real database! 

echo "--- Running Tests ---"

TEST_SUCCESS=true # Flag to track overall test success
index=0
for service_name in "${SERVICE_NAMES[@]}"; do
    service_dir="${SERVICE_DIRS[$index]}"
    echo "========================================="
    echo "Running tests for service: ${service_name} (from directory ${service_dir})"
    echo "========================================="

    # Execute pytest inside the running Docker container for the service
    docker-compose exec "$service_name" pytest

    # Check the exit code of the docker-compose exec command
    if [ $? -ne 0 ]; then
        echo "Tests FAILED for ${service_name}"
        TEST_SUCCESS=false
    else
        echo "Tests PASSED for ${service_name}"
    fi
    echo "" # Add a newline for readability
    index=$((index+1))
done

echo "--- Test Run Complete ---"

# --- Clean up after tests ---
echo "Bringing down test environment..."
docker-compose down # This will stop and remove all containers defined in docker-compose.yml

if "$TEST_SUCCESS"; then
    echo "--- All Tests PASSED ---"
    exit 0
else
    echo "--- Tests FAILED for one or more services ---"
    exit 1
fi
