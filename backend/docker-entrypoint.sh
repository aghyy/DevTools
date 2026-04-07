#!/bin/sh
set -e

if [ ! -f /app/keys/private.pem ]; then
  echo "Generating RSA key pair for JWT signing..."
  mkdir -p /app/keys
  openssl genrsa -out /app/keys/private.pem 2048
  openssl rsa -in /app/keys/private.pem -pubout -out /app/keys/public.pem
  echo "RSA key pair generated."
fi

mkdir -p /app/public/uploads/avatars

exec "$@"
