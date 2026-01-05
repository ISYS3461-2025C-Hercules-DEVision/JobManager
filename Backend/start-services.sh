#!/bin/bash

echo "=== Starting all Spring Boot services ==="

ROOT=$(pwd)

for dir in authentication company job notification subscription; do
  SERVICE_PATH="$ROOT/$dir"

  if [ -d "$SERVICE_PATH" ]; then
    echo "---- Building $dir ----"

    cd "$SERVICE_PATH"

    # Load environment variables from .env if present.
    # Note: We parse KEY=VALUE lines ourselves so values with spaces don't break (unlike `source`).
    if [ -f "$SERVICE_PATH/.env" ]; then
      while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        case "$line" in
          ''|'#'*) continue ;;
        esac
        # Only process KEY=VALUE lines
        if [[ "$line" == *"="* ]]; then
          key="${line%%=*}"
          value="${line#*=}"
          # Trim whitespace around key
          key="${key//[[:space:]]/}"
          # Export as a single argument to preserve spaces in value
          export "$key=$value"
        fi
      done < "$SERVICE_PATH/.env"
    fi

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

    # Find executable Spring Boot jar (avoid Gradle's *-plain.jar)
    JAR_FILE=$(find target build/libs -name "*.jar" ! -name "*-plain.jar" 2>/dev/null | head -n 1)

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

