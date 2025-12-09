# DEVision Kafka & Docker Cheatsheet

Since you are running Kafka inside Docker, the best way to run Kafka commands is by "executing" them inside the running container. This saves you from installing Kafka tools on your local machine.

## 1. Docker Lifecycle Commands

Run these in the folder containing your `docker-compose.yml`.

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Up** | `docker-compose up -d` | Starts Zookeeper, Kafka, and UI in background. |
| **Shut Down** | `docker-compose down` | Stops and removes containers/networks. |
| **View Logs** | `docker-compose logs -f kafka` | Follows the logs of the Kafka container. |
| **Restart** | `docker-compose restart kafka` | Quick restart if Kafka gets stuck. |
| **Check Status** | `docker ps` | Verify containers are "Up". |

---

## 2. Topic Management (DEVision Specific)

Run these commands in your terminal. They instruct Docker to run the Kafka tools inside the container `devision-kafka`.

### Create Topics

Create the specific DEVision topics:

```bash
# Payment Service -> Notification
docker exec devision-kafka kafka-topics --create --topic payment.events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

# Job Service -> Notification
docker exec devision-kafka kafka-topics --create --topic job.events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

# Matching Service -> Notification
docker exec devision-kafka kafka-topics --create --topic matching.events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

# Applicant Service -> Job Manager
docker exec devision-kafka kafka-topics --create --topic applicant.events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
````

### List all topics

```bash
docker exec devision-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Describe a topic

Check partition count and details:

```bash
docker exec devision-kafka kafka-topics --describe --topic payment.events --bootstrap-server localhost:9092
```

### Delete a topic

If you made a mistake (Caution: this deletes data):

```bash
docker exec devision-kafka kafka-topics --delete --topic payment.events --bootstrap-server localhost:9092
```

---

## 3\. Testing Data Flow (Manual Debugging)

Use these to manually send or read messages to verify your Microservices are working.

### A. Listen to Messages (Consumer)

Run this to "spy" on the traffic between your services. It will hang and wait for messages.
*(Example: Watch for payment notifications)*

```bash
docker exec devision-kafka kafka-console-consumer --topic payment.events --bootstrap-server localhost:9092 --from-beginning
```

### B. Send a Message (Producer)

Run this to simulate a service sending a message. This is useful if the Payment Service isn't built yet, but you want to test the Notification Service.

**1. Run the command:**

```bash
docker exec -it devision-kafka kafka-console-producer --topic payment.events --bootstrap-server localhost:9092
```

**2. Send Data:**
You will get a `>` prompt. Type JSON (or text) and hit **Enter**:

```json
{"userId": "101", "status": "PREMIUM_UNLOCKED", "amount": 50.00}
```

**3. Exit:**
Press `Ctrl+C` to exit the producer.

---

## 4\. Connection Details Cheatsheet

When configuring your Spring Boot Microservices (`application.yml`):

| Scenario | Setting Value | Why? |
| :--- | :--- | :--- |
| **Local Development** | `bootstrap-servers: localhost:9092` | Your IDE runs on host; Kafka exposes 9092 to host. |
| **Docker Deployment** | `bootstrap-servers: kafka:29092` | Service runs inside Docker network; talks to internal port. |
| **Kafka UI URL** | `http://localhost:8090` | Visual dashboard (easier than CLI). |
