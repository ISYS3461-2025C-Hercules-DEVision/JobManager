#!/bin/bash

echo "=== Stopping Spring Boot services ==="

# Detect Spring Boot processes
PIDS=$(pgrep -f "java -jar")

if [ -z "$PIDS" ]; then
  echo "No Spring services are running."
  exit 0
fi

for pid in $PIDS; do
  echo "Stopping process $pid"
  kill "$pid"
done

echo "=== All Spring Boot services stopped ==="

