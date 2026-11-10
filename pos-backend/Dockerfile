# ----------------------------------------------------------------------
# Stage 1: Build & Package
# ----------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy source and build executable JAR (skipping unit tests during packaging)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ----------------------------------------------------------------------
# Stage 2: Production JRE Runtime
# ----------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Create non-root application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Add curl for container health check probes
RUN apk add --no-cache curl

# Copy packaged JAR artifact
COPY --from=builder --chown=appuser:appgroup /build/target/*.jar /app/app.jar

USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/v3/api-docs || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
