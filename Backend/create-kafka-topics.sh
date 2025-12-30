#!/bin/bash

# Docker-based Kafka Topic Creation
# This script uses the official Kafka Docker image to create topics
# No need to install Kafka locally!

BOOTSTRAP_SERVERS="b-1.jobmanager.a5ti5t.c3.kafka.ap-southeast-2.amazonaws.com:9092,b-3.jobmanager.a5ti5t.c3.kafka.ap-southeast-2.amazonaws.com:9092,b-2.jobmanager.a5ti5t.c3.kafka.ap-southeast-2.amazonaws.com:9092"

REPLICATION_FACTOR=3
PARTITIONS=3

topics=(
    "company-registration"
    "subscription-activated"
    "subscription-cancelled"
    "subscription-expired"
    "job-post-updates"
    "applicant-profile-updates"
    "subscription-created"
    "payment-failed"
    "subscription-expiring-soon"
)

echo "Creating Kafka topics using Docker..."
echo "Bootstrap servers: $BOOTSTRAP_SERVERS"
echo "----------------------------------------"

for topic in "${topics[@]}"; do
    echo "Creating topic: $topic"
    docker run --rm \
        confluentinc/cp-kafka:latest \
        kafka-topics \
        --bootstrap-server $BOOTSTRAP_SERVERS \
        --create \
        --topic $topic \
        --replication-factor $REPLICATION_FACTOR \
        --partitions $PARTITIONS \
        --if-not-exists
    
    if [ $? -eq 0 ]; then
        echo "✓ Topic '$topic' created successfully"
    else
        echo "✗ Failed to create topic '$topic'"
    fi
    echo "----------------------------------------"
done

echo ""
echo "Listing all topics:"
docker run --rm \
    confluentinc/cp-kafka:latest \
    kafka-topics \
    --bootstrap-server $BOOTSTRAP_SERVERS \
    --list

echo ""
echo "Done!"
