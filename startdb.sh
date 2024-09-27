#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for Postgres..."

while ! nc -z db 5432; do
  sleep 1
done

echo "Postgres is up and running!"

# Run migrations
npx prisma migrate deploy

# Start the application
npm run dev
