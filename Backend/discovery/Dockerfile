# Discovery Service Dockerfile
# Build from Backend directory: docker-compose up -d
# Works on Windows, Mac, and Linux

# Build stage
FROM gradle:8-jdk21 AS builder
WORKDIR /home/gradle/project/discovery

# Copy gradle wrapper files
COPY discovery/gradlew discovery/gradlew.bat ./
COPY discovery/gradle gradle

# Copy project files
COPY discovery/build.gradle discovery/settings.gradle ./
COPY discovery/src src

#Build the application
RUN gradle bootJar --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /home/gradle/project/discovery/build/libs/discovery-0.0.1-SNAPSHOT.jar /app/discovery.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/discovery.jar"]