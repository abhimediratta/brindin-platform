#!/bin/sh
set -e

# Replace build-time placeholder with runtime env var
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  find /app/packages/frontend/.next -type f -name '*.js' \
    -exec sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|${NEXT_PUBLIC_API_URL}|g" {} +
fi

exec "$@"
