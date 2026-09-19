#!/usr/bin/env sh
# Start vulnerable demonstration services
# Author: Aadhil Rizwan

echo "Starting ISEC3004 Vulnerable Application Services..."

if [ -d "nosql-injection/vulnerable" ]; then
  cd nosql-injection/vulnerable || exit 1
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies in nosql-injection/vulnerable..."
    npm install
  fi
  npm start
else
  echo "Error: nosql-injection/vulnerable directory not found."
  exit 1
fi
