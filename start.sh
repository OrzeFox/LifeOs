#!/bin/bash

ROOT=$(cd "$(dirname "$0")" && pwd)

echo "[LifeOS] Levantando API y Web..."

# API
cd "$ROOT/lifeos-api"
npm install --silent
npm run start:dev &
API_PID=$!

# Web
cd "$ROOT/lifeos-web"
npm install --silent
npm run dev &
WEB_PID=$!

echo "[LifeOS] API  → http://localhost:3000/api"
echo "[LifeOS] Web  → http://localhost:5173"
echo "[LifeOS] Ctrl+C para detener ambos"

trap "echo ''; echo '[LifeOS] Deteniendo...'; kill $API_PID $WEB_PID 2>/dev/null; exit 0" INT TERM

wait
