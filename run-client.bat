@echo off
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting frontend on http://localhost:5173
echo API requests proxy to backend at :8000
npm run dev
