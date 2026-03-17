#!/usr/bin/env bash
# setup-local.sh — One-stop local dev environment setup for Brindin Platform
set -euo pipefail

# ─── Colors & Helpers ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*"; }
step()    { echo -e "\n${BOLD}[$1/$TOTAL_STEPS] $2${NC}"; }

TOTAL_STEPS=7

echo -e "${BOLD}━━━ Brindin Platform — Local Setup ━━━${NC}\n"

# ─── 1. Prerequisites ────────────────────────────────────────────────
step 1 "Checking prerequisites"

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "$1 is not installed"
    return 1
  fi
}

MISSING=0

check_cmd docker     || MISSING=1
check_cmd node       || MISSING=1
check_cmd pnpm       || MISSING=1
check_cmd python3    || MISSING=1

if ! docker compose version &>/dev/null; then
  error "docker compose (v2 plugin) is not available"
  MISSING=1
fi

if [ "$MISSING" -eq 1 ]; then
  error "Install missing prerequisites and re-run."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  error "Node.js >= 20 required (found v$(node -v))"
  exit 1
fi

success "docker, docker compose, node $(node -v), pnpm $(pnpm -v), python3"

# ─── 2. Environment Setup ────────────────────────────────────────────
step 2 "Setting up environment"

if [ ! -f .env ]; then
  cp .env.example .env
  # Swap R2 config to MinIO for local dev
  sed -i 's|^R2_ENDPOINT=.*|R2_ENDPOINT=http://localhost:9000|' .env
  sed -i 's|^R2_ACCESS_KEY=.*|R2_ACCESS_KEY=minioadmin|' .env
  sed -i 's|^R2_SECRET_KEY=.*|R2_SECRET_KEY=minioadmin|' .env
  success "Created .env from .env.example (configured for MinIO)"
else
  info ".env already exists — skipping"
fi

# ─── 3. Start Docker Services ────────────────────────────────────────
step 3 "Starting Docker services"

docker compose up -d

info "Waiting for services to be healthy..."
RETRIES=30
for i in $(seq 1 $RETRIES); do
  PG_READY=$(docker compose ps --format json 2>/dev/null | grep -c '"healthy"' || true)
  if [ "$PG_READY" -ge 3 ]; then
    break
  fi
  if [ "$i" -eq "$RETRIES" ]; then
    warn "Timed out waiting for all services — continuing anyway"
    break
  fi
  sleep 2
done

success "postgres, redis, minio are running"

# ─── 4. Install Dependencies ─────────────────────────────────────────
step 4 "Installing dependencies"

pnpm install
success "pnpm dependencies installed"

# ─── 5. Push Database Schema ─────────────────────────────────────────
step 5 "Pushing database schema"

pnpm --filter @brindin/backend db:push
success "Database schema pushed"

# ─── 6. Python Worker Setup ──────────────────────────────────────────
step 6 "Setting up Python workers"

WORKER_DIR="packages/workers-py"
if [ -d "$WORKER_DIR" ]; then
  if [ ! -d "$WORKER_DIR/.venv" ]; then
    python3 -m venv "$WORKER_DIR/.venv"
    success "Created Python venv"
  else
    info "Python venv already exists"
  fi

  if [ -f "$WORKER_DIR/requirements.txt" ]; then
    "$WORKER_DIR/.venv/bin/pip" install -q -r "$WORKER_DIR/requirements.txt"
    success "Python dependencies installed"
  else
    info "No requirements.txt found — skipping pip install"
  fi
else
  info "No packages/workers-py directory — skipping Python setup"
fi

# ─── 7. Verification ─────────────────────────────────────────────────
step 7 "Verifying services"

VERIFY_OK=1

# Postgres
if docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
  success "PostgreSQL is responding"
else
  error "PostgreSQL is not responding"
  VERIFY_OK=0
fi

# Redis
if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
  success "Redis is responding"
else
  error "Redis is not responding"
  VERIFY_OK=0
fi

# MinIO
if curl -sf http://localhost:9000/minio/health/live &>/dev/null; then
  success "MinIO is responding"
else
  error "MinIO is not responding"
  VERIFY_OK=0
fi

if [ "$VERIFY_OK" -eq 0 ]; then
  warn "Some services failed verification — check docker compose logs"
fi

# ─── Summary ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ Setup Complete ━━━${NC}"
echo ""
echo -e "  ${BOLD}Services:${NC}"
echo "    PostgreSQL   http://localhost:5432  (postgres/postgres)"
echo "    Redis        http://localhost:6379"
echo "    MinIO        http://localhost:9000  (minioadmin/minioadmin)"
echo "    MinIO Console http://localhost:9001"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo "    pnpm dev                 Start backend + frontend dev servers"
echo "    scripts/seed.sh          Seed demo data"
echo "    pnpm db:studio           Open Drizzle Studio (DB browser)"
echo ""
