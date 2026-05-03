#!/usr/bin/env bash
# Arranca backend + frontend en dev (sin Docker). Ctrl+C para detener ambos.
#
# Requisitos:
#   - Python 3.10+ con backend/requirements.txt instalado
#   - Node 22+ con frontend/node_modules instalado (npm install --legacy-peer-deps)
set -euo pipefail

cd "$(dirname "$0")/.."

cleanup() {
  echo ""
  echo "Deteniendo servicios..."
  jobs -p | xargs -r kill 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "[backend]  uvicorn en http://localhost:8000"
PYTHONIOENCODING=utf-8 python -m uvicorn backend.app.main:app --port 8000 --reload &

echo "[frontend] ng serve en http://localhost:4200"
(cd frontend && npx ng serve --port 4200 --host 127.0.0.1) &

wait
