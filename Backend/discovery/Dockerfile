# Discovery Service Dockerfile
# Build from Backend directory: docker-compose up -d
# Works on Windows, Mac, and Linux

# Build stage
FROM gradle:8-jdk21 AS builder
WORKDIR /home/gradle/project

# Copy discovery service files from Backend directory (build context)
COPY discovery/ ./discovery/

# Build the discovery service
WORKDIR /home/gradle/project/discovery

# Windows: Use gradle from base image (avoids line-ending issues)
RUN gradle bootJar --no-daemon -x test

# Mac/Linux: Uncomment below and comment above if you prefer gradlew
# RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /home/gradle/project/discovery/build/libs/discovery-0.0.1-SNAPSHOT.jar /app/discovery.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/discovery.jar"]