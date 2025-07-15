-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE ecommerce_db'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'ecommerce_db'
)\gexec;

-- Create the user if it doesn't exist
DO
$do$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_user'
    ) THEN
        CREATE ROLE admin_user WITH LOGIN PASSWORD 'admin_password';
    END IF;
END
$do$;

-- Grant privileges on the database
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO admin_user;

-- Connect to the database to set default privileges
\connect ecommerce_db

-- Grant permissions for future tables, sequences, and functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO admin_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO admin_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO admin_user;
