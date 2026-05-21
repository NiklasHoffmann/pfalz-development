#!/bin/sh
set -eu

UPLOAD_DIR="${INTAKE_UPLOAD_DIR:-/app/storage/intake}"

mkdir -p "$UPLOAD_DIR" /app/logs /app/.next
chown -R nextjs:nodejs "$UPLOAD_DIR" /app/logs /app/.next

exec su-exec nextjs "$@"