#!/bin/bash

# Exit on error
set -e

echo -e "\033[0;36mBuilding UI...\033[0m"
cd ui
npm run build
cd ..

echo -e "\033[0;36mMoving UI artifacts to service/static...\033[0m"
# Ensure the directory exists
mkdir -p service/static

# Clean old files (optional, but good for consistency)
# Using find to delete files to avoid issues if folder doesn't exist or permissions
rm -rf service/static/*

# Copy new files
cp -r ui/dist/* service/static/

echo -e "\033[0;36mStarting Service in Dev Mode...\033[0m"
cd service
npm install
npm run dev
