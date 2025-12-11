# Development Environment Setup Guide

This project contains multiple microservices (Authentication, Company, Job, Notification, Subscription), along with Kafka, PostgreSQL, MongoDB, and Kong Gateway.  
This document explains how to set up and run the entire environment for local development.

---

# 🚀 1. First-time Setup

For the first time you run the project, execute:

chmod +x setup.sh
chmod +x start-services.sh
chmod +x stop-services.sh
./setup.sh

This script will:

### ✅ 1. Start Docker infrastructure
- Mongo database
- Kafka + Zookeeper  
- Kafka UI  
- Kong Gateway  
- Kong migrations  
- Konga (optional)

### ✅ 2. Create required Kafka topics
- `company-registration`  
- `job-post-updates`  
- `applicant-profile-updates`  

### ✅ 3. Import RSA public key into Kong
This allows Kong to verify JWTs issued by the Authentication service.

### ✅ 4. Register Global Kong Consumer
Used by all backend services communicating through Kong.

---

# 🔁 2. Running the Environment Again (after first setup)

After the initial setup, you can start the environment simply by running:

docker compose up -d

This will start:
- Kafka  
- Database  
- Kong  
- Konga  
- All supporting tools

You **DO NOT** need to run `setup.sh` again, because:
- Topics are already created  
- RSA keys already imported  
- Kong consumer already exists  

---

# 🟦 3. Start/Stop All Spring Services

Your microservices live in folders:

authentication/
company/
job/
notification/
subscription/

---

## ▶️ Start all backend services

./start-services.sh

This will:
- Build each Spring Boot service (Maven/Gradle auto-detection)
- Start each in background
- Create log file for each:  
  - `authentication.log`  
  - `company.log`  
  - etc.

---

## ⏹️ Stop all backend services

./stop-services.sh

This will:
- Find all running Spring Boot processes  
- Gracefully kill them  

---

# 📸 4. System Architecture & Flow Diagrams

Below are placeholder diagrams.  
Replace them later with real PNG/SVG images inside `/docs/images/`.

---

## 🔐 Authentication Flow

![Authentication Flow](docs/images/authentication-flow.png)

**Flow Summary:**

1. User signs up or logs in via Authentication service  
2. Authentication issues a JWT signed with **RS256 Private Key**  
3. Kong verifies the token using the **Public RSA Key**  
4. Authentication service publish events (if user signs up) to Company Service to create Company profile

---

## 📣 Real-time Notification Flow

![Notification Flow](docs/images/notification-flow.png)

**Flow Summary:**

1. Microservices produce events to Kafka  
2. Notification service consumes events  
3. Notification service sends real-time updates  
4. Future: WebSocket, SSE, or Push Notifications  

---

## 🏢 Company Job Update Flow

![Company Job Update Flow](docs/images/company-job-update-flow.png)

**Flow Summary:**

1. Company updates job in Job service
2. Job service publish `job-update` event to Kafka for applicant system

---

# 🗂️ 5. Project Structure

```
root/
├── authentication/
├── company/
├── job/
├── notification/
├── subscription/
├── docker-compose.yml
├── setup.sh
├── start-services.sh
├── stop-services.sh
└── README.md
```

---

# 💡 6. Tips & Troubleshooting

### ❗ Change in Kong / Kafka / DB after code updates?
Restart Docker:

docker compose down
docker compose up -d

### ❗ Authentication failing with "Invalid Signature"?
Regenerate RSA key pair and re-import public key using setup script.

### ❗ Some microservices not starting?
Check logs:

tail -f authentication.log
