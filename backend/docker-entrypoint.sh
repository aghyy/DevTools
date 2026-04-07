#!/bin/sh
set -e

mkdir -p /app/keys

if [ ! -f /app/keys/private.pem ]; then
  echo "Generating RSA key pair for JWT signing..."
  openssl genrsa -out /app/keys/private.pem 2048
  echo "RSA private key generated."
fi

# Always derive public key from private key to prevent key mismatch.
openssl rsa -in /app/keys/private.pem -pubout -out /app/keys/public.pem

mkdir -p /app/public/uploads/avatars

exec "$@"
