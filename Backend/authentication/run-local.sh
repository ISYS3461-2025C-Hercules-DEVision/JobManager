#!/usr/bin/env bash
set -euo pipefail

# Deprecated: you don't need this script.
# The authentication service already loads `Backend/authentication/.env` automatically
# via dotenv-java in `AuthenticationApplication`.
#
# Preferred workflow:
#   ./gradlew bootRun

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x ./gradlew
./gradlew bootRun
