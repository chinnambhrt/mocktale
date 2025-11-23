@echo off
echo Starting Mocktale...

start "Mocktale Service" cmd /k "cd service && npm start"
start "Mocktale UI" cmd /k "cd ui && npm run dev"

echo Services started in separate windows.
