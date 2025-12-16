# Service Discovery with Eureka

This document explains the minimal changes needed to add Eureka service discovery to the project and how to test it locally.

## What I added
- `discovery` module: Eureka server (port 8761).
- `discovery/Dockerfile` for containerized builds.
- `docker-compose.yml` updated to include `discovery` service.
- `authentication` service updated as a Eureka client (Gradle + application.properties + @EnableDiscoveryClient).

## Steps to apply the same changes to other services
1. Update each service's `build.gradle`:
   - Add dependency management if not present (import Spring Cloud BOM):
```gradle
dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2023.0.6"
    }
}
```
   - Add dependencies:
```gradle
implementation 'org.springframework.cloud:spring-cloud-starter-netflix-eureka-client'
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

2. Update `src/main/resources/application.properties`:
```properties
# service name already present
spring.application.name=<your-service-name>

# Eureka
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
spring.cloud.discovery.enabled=true

# Actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

3. Add `@EnableDiscoveryClient` to the main application class (import `org.springframework.cloud.client.discovery.EnableDiscoveryClient`).

4. (Optional) Remove hard-coded `server.port` values if you want Docker to allocate ports dynamically, or keep them if you prefer fixed ports.

## How to build and run locally
1. Build discovery and the services (example for discovery & authentication):
```bash
cd Backend
./gradlew :discovery:bootJar :authentication:bootJar
```

2. Start the stack with Docker Compose:
```bash
cd Backend
docker-compose up --build
```

3. Verify Eureka UI:
- Open http://localhost:8761 — you should see the Eureka dashboard and, after services start, the registered instances.

4. Verify a service is registered:
- In Eureka UI, look for `AUTHENTICATION` (or the name you set) and confirm its health.

## Kong integration
- Once services register with Eureka, you can either:
  - Configure Kong to use service hostnames and dynamic ports (less straightforward), or
  - Use a small sync job that queries Eureka and registers services/upstreams/routes in Kong via the Admin API (recommended for explicit control).

## Notes & compatibility
- The Spring Cloud BOM version used: `2023.0.6`. Confirm compatibility with your Spring Boot version (3.4.0). Adjust if necessary.
- I updated only the `authentication` service as a template. Repeat the same steps for `company`, `job`, `subscription`, and `notification`.

If you want, I can now apply the same Gradle + properties edits to the remaining services and create a small Kong sync script that registers services from Eureka to Kong.
