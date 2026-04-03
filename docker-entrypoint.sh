#!/bin/sh
# docker-entrypoint.sh

echo "🚀 Starting Smart Campus UniPortal 4.0..."

# Apply database migrations
echo "📂 Applying database migrations..."
npx prisma migrate deploy

# Seed the database if needed (optional, depends on if users/courses should be reset)
# echo "🌱 Seeding database..."
# npx prisma db seed

# Start the Next.js server
echo "✨ Launching server on port $PORT..."
node server.js
