# Build stage
FROM gradle:8-jdk-21 AS builder
WORKDIR /home/gradle/project

# Docker build context phải là Backend/, 
# nên trong Dockerfile (ở discovery) dùng:
COPY .. .

RUN chmod +x gradlew
RUN ./gradlew :discovery:bootJar --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /home/gradle/project/discovery/build/libs/discovery-0.0.1-SNAPSHOT.jar /app/discovery.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/discovery.jar"]