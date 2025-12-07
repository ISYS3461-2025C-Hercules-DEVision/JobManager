# Technical Guide: Kafka Infrastructure Setup for DEVision

Project: DEVision (Job Manager & Job Applicant Subsystems)
Technology: Apache Kafka (KRaft Mode), Docker, Microservices
Author: Duong Phu Dong
Date: December 7, 2025

## 1. Overview

The DEVision backend utilizes an event-driven microservices architecture. To decouple our Job Manager and Job Applicant services, we use Apache Kafka as our message broker.

We are utilizing Kafka in KRaft mode (Kafka Raft Metadata mode), which eliminates the dependency on Zookeeper, resulting in a lightweight and easier-to-manage infrastructure.

### Network Architecture

To support both containerized microservices and local development, our Kafka setup exposes two distinct listeners:

- **Internal Network (Port 9092):** For communication between Docker containers (Service-to-Service).
- **External Network (Port 9094):** For local development access (Host-to-Container).

## 2. Prerequisites

Before proceeding, ensure your development machine has the following installed:

- Docker Desktop (latest version recommended)
- Docker Compose (v2.0+)

## 3. Infrastructure Configuration

We use docker-compose to orchestrate the infrastructure. The configuration file is located at the project root.

### docker-compose.yml

Create (or update) the file with the following configuration:

```yaml
version: '3'

services:

  # ==========================================
  # APACHE KAFKA (BROKER)
  # ==========================================

  kafka:
    image: apache/kafka:latest
    container_name: kafka
    # Port 9094 is exposed to the Host machine for local development/debugging
    ports:
      - "9094:9094"
    environment:
      # --- KRAFT SETTINGS ---
      - KAFKA_NODE_ID=1
      - KAFKA_PROCESS_ROLES=broker,controller
      - KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093

      # --- LISTENER CONFIGURATION ---
      # 1. CONTROLLER: Internal metadata management (Port 9093)
      # 2. INTERNAL: Service-to-Service communication inside Docker (Port 9092)
      # 3. EXTERNAL: Developer access from Localhost (Port 9094)
      - KAFKA_LISTENERS=CONTROLLER://:9093,INTERNAL://:9092,EXTERNAL://:9094
      
      # --- ADVERTISED LISTENERS ---
      # Clients will be told to connect to these addresses based on which port they hit
      - KAFKA_ADVERTISED_LISTENERS=INTERNAL://kafka:9092,EXTERNAL://localhost:9094
      
      # --- SECURITY & MAPPING ---
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT
      - KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_INTER_BROKER_LISTENER_NAME=INTERNAL
    
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - devision-network

  # ==========================================
  # KAFKA UI (VISUALIZATION)
  # ==========================================

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui
    ports:
      - "8080:8080"
    environment:
      - KAFKA_CLUSTERS_0_NAME=DEVision-Local
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
    depends_on:
      - kafka
    networks:
      - devision-network

  # ==========================================
  # MICROSERVICES (PLACEHOLDERS)
  # ==========================================

  job-manager:
    build: ./job-manager-service
    container_name: job-manager
    ports: ["3001:3000"]
    environment:
      - KAFKA_BROKER=kafka:9092 # Connects via internal Docker network
    depends_on: [kafka]
    networks: [devision-network]

  job-applicant:
    build: ./job-applicant-service
    container_name: job-applicant
    ports: ["3002:3000"]
    environment:
      - KAFKA_BROKER=kafka:9092 # Connects via internal Docker network
    depends_on: [kafka]
    networks: [devision-network]

volumes:
  kafka_data:
    driver: local

networks:
  devision-network:
    driver: bridge
```

## 4. Setup & Running

### Step 1: Start the Infrastructure

Open your terminal in the project root and run:

```bash
docker-compose up -d
```

### Step 2: Verification

1. Run `docker ps` and ensure `kafka` and `kafka-ui` are status `Up`.
2. Open your browser to <http://localhost:8080>.
3. You should see the Kafka UI dashboard.
4. The "Status" indicator on the right should be green (Online).

## 5. Developer Guide: How to Connect

Crucially, the connection string changes depending on where your code is running.

### Scenario A: Code running inside Docker

If you are deploying the Job Manager or Job Applicant services via Docker Compose:

- **Bootstrap Server:** `kafka:9092`
- **Why?** `kafka` is the container hostname within the Docker network.

### Scenario B: Code running Locally (Debugging)

If you are running `npm run start` or `go run main.go` directly on your laptop:

- **Bootstrap Server:** `localhost:9094`
- **Why?** Docker maps port 9094 from the container to your local machine.

### Implementation Example (Node.js/JS)

Do not hardcode the address. Use Environment Variables.

```javascript
// config.js
const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9094';

// kafka-client.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'devision-job-manager',
  brokers: [kafkaBroker], // Uses the variable based on environment
});
```

## 6. Workflow Example: Job Creation

To illustrate how DEVision services interact with this setup:

### Job Manager Service (Producer)

1. User posts a job via REST API.
2. Service saves to DB.
3. Service sends event to topic `job-created`.
4. Payload: `{ "jobId": 101, "title": "Senior Dev", "tags": ["microservices"] }`

### Job Applicant Service (Consumer)

1. Listens to `job-created`.
2. Matches tags with candidate preferences.
3. Sends email notifications to relevant candidates.

## 7. Troubleshooting

### Issue: "Connection Refused"

- **Check:** Are you using the right port?
  - Inside Docker → use `9092`
  - Outside Docker → use `9094`
- **Check:** Did you wait for Kafka to start? Kafka takes 10-20 seconds to be ready after the container starts.

### Issue: "Cannot resolve host 'kafka'"

- **Check:** This error only happens if you run code locally but try to connect to `kafka:9092`. Your local machine does not know what "kafka" is. Use `localhost:9094` instead.

### Issue: Kafka UI shows "Offline"

- **Check:** Ensure the `kafka` container is running (`docker ps`).
- **Check:** View logs: `docker logs kafka`. Look for "Kafka Server started".
