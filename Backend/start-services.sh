#!/bin/bash

echo "=== Starting all Spring Boot services ==="

ROOT=$(pwd)

for dir in authentication company job notification subscription; do
  SERVICE_PATH="$ROOT/$dir"

  if [ -d "$SERVICE_PATH" ]; then
    echo "---- Building $dir ----"

    cd "$SERVICE_PATH"

    # Build service
    if [ -f "./mvnw" ]; then
      ./mvnw clean package -DskipTests
    elif [ -f "./gradlew" ]; then
      ./gradlew build -x test
    else
      echo "❌ No build tool found in $dir (expected mvnw or gradlew)"
      cd "$ROOT"
      continue
    fi

    # Find jar
    JAR_FILE=$(find target build/libs -name "*.jar" 2>/dev/null | head -n 1)

    if [ -z "$JAR_FILE" ]; then
      echo "❌ No JAR file found for $dir"
      cd "$ROOT"
      continue
    fi

    echo "---- Starting $dir ----"
    nohup java -jar "$JAR_FILE" > "$ROOT/$dir.log" 2>&1 &

    echo "$dir started. Logs: $dir.log"

    cd "$ROOT"
  fi
done

echo "=== All services started ==="

