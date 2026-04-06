#!/usr/bin/env sh
# docker-entrypoint.sh

echo "🚀 Starting Smart Campus UniPortal 4.0..."

# Apply database migrations
# Using npx to run prisma from local dependencies
# If it's not in the path, npx will find it in node_modules
echo "📂 Applying database migrations..."

# Ensure we're in the right directory
cd /app

# Run migrations
if npx prisma@5.22.0 migrate deploy; then
  echo "✅ Migrations applied successfully."
else
  echo "⚠️ Migration failed or already applied. Continuing..."
fi

# Start the Next.js server
echo "✨ Launching server on port ${PORT:-7860}..."
node server.js
