#!/bin/bash
# Run both backend and frontend locally without Docker.
# Prerequisites:
#   - Python 3.11+ with pip
#   - Node.js 20+
#
# Usage:
#   chmod +x run.sh
#   ./run.sh

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup INT TERM

# --- Backend ---
echo "=== Setting up backend ==="
cd "$ROOT/backend"

if [ ! -d "venv" ]; then
    if ! python3 -m venv venv 2>/dev/null; then
        rm -rf venv
        python3 -m virtualenv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip -q
else
    source venv/bin/activate
fi
pip install -q -r requirements.txt

mkdir -p uploads

echo "Starting backend on http://localhost:8000 ..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# --- Frontend ---
echo "=== Setting up frontend ==="
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
    npm install
fi

echo "Starting frontend on http://localhost:5173 ..."
echo "(API requests proxy to backend at :8000)"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== Ready ==="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Press Ctrl+C to stop both."
echo ""

wait
