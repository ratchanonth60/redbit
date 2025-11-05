#!/bin/sh
set -e

KEY_DIR="/app/keys"
PRIVATE_KEY_PATH="${KEY_DIR}/private_key.pem"
PUBLIC_KEY_PATH="${KEY_DIR}/public_key.pem"

if [ -f "$PRIVATE_KEY_PATH" ]; then
  echo "JWT keys already exist. Skipping generation."
else
  echo "Generating new JWT private/public key pair..."

  mkdir -p "$KEY_DIR"
  chown -R "$(id -u)":"$(id -g)" "$KEY_DIR"
  chmod 700 "$KEY_DIR"

  openssl genpkey -algorithm RSA -out "$PRIVATE_KEY_PATH" -pkeyopt rsa_keygen_bits:2048
  openssl rsa -pubout -in "$PRIVATE_KEY_PATH" -out "$PUBLIC_KEY_PATH"

  chmod 600 "$PRIVATE_KEY_PATH"
  chmod 644 "$PUBLIC_KEY_PATH"

  echo "Key pair generation complete."
fi

exec "$@"
