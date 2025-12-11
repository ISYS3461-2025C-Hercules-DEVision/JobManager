#!/bin/bash

echo "=== Starting Docker Compose ==="
docker compose up -d

echo "=== Waiting for Kafka and Kong to be ready ==="

# Wait for Kafka
echo -n "Waiting for Kafka..."
until docker logs $(docker ps -qf "name=kafka") 2>&1 | grep -q "started"; do
  echo -n "."
  sleep 2
done
echo " OK"


##########################################
# WAIT FOR KONG WITH RESTART RETRY LOGIC #
##########################################

MAX_RETRIES=3
RETRY_COUNT=0

wait_for_kong() {
  echo -n "Waiting for Kong Admin API..."
  local counter=0

  # Try for 40 seconds before restart
  while ! curl -s http://localhost:8001/status > /dev/null; do
    echo -n "."
    sleep 2
    counter=$((counter + 2))

    if [ $counter -ge 40 ]; then
      return 1
    fi
  done

  return 0
}

until wait_for_kong; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  if [ "$RETRY_COUNT" -gt "$MAX_RETRIES" ]; then
    echo "❌ Kong failed to start after $MAX_RETRIES retries."
    exit 1
  fi

  echo ""
  echo "⚠️ Kong not ready, restarting docker compose (attempt $RETRY_COUNT/$MAX_RETRIES) ..."
  docker compose up -d
done

echo " OK"


##########################################
# REST OF YOUR ORIGINAL SCRIPT (UNCHANGED)
##########################################

echo "=== Creating Kafka Topics ==="

KAFKA_CONTAINER=$(docker ps -qf "name=kafka")

if [ -z "$KAFKA_CONTAINER" ]; then
  echo "❌ Kafka container not found! Make sure it is running."
  exit 1
fi

create_topic() {
  local topic=$1
  echo "Creating topic: $topic"
  docker exec "$KAFKA_CONTAINER" \
    kafka-topics --create \
    --topic "$topic" \
    --bootstrap-server localhost:9092 \
    --partitions 1 \
    --replication-factor 1 \
    --if-not-exists
}

create_topic "company-registration"
create_topic "job-post-updates"
create_topic "applicant-profile-updates"


echo "=== Setting Up Kong Consumer & JWT Public Key ==="

# Create consumer (ignore if exists)
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8001/consumers \
  --data "username=global-consumer"

# Add JWT credential
curl -i -X POST http://localhost:8001/consumers/global-consumer/jwt \
  -F "algorithm=RS256" \
  -F "rsa_public_key=@authentication/public_pkcs8.pem;type=application/x-pem-file" \
  -F "key=global-key"


echo "=== ALL DONE ==="

