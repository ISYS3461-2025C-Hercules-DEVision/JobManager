#!/bin/bash
# Load environment variables from .env file and start the authentication service

# Navigate to the authentication directory
cd "$(dirname "$0")"

# Load .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
    echo "✓ Environment variables loaded"
else
    echo "ERROR: .env file not found!"
    exit 1
fi

# Verify critical env vars
if [ -z "$SMTP_EMAIL" ]; then
    echo "WARNING: SMTP_EMAIL not set"
fi

if [ -z "$KAFKA_BOOTSTRAP_SERVER" ]; then
    echo "Setting default KAFKA_BOOTSTRAP_SERVER=localhost:29092"
    export KAFKA_BOOTSTRAP_SERVER=localhost:29092
fi

if [ -z "$DATABASE_HOST" ]; then
    echo "Setting default DATABASE_HOST=localhost"
    export DATABASE_HOST=localhost
fi

if [ -z "$REDIS_HOST" ]; then
    echo "Setting default REDIS_HOST=localhost"
    export REDIS_HOST=localhost
fi

echo ""
echo "Starting authentication service..."
echo "SMTP_EMAIL: $SMTP_EMAIL"
echo "KAFKA_BOOTSTRAP_SERVER: $KAFKA_BOOTSTRAP_SERVER"
echo ""

# Start the service
./gradlew bootRun
