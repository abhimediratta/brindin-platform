#!/usr/bin/env bash
# seed.sh — Seed the Brindin database with demo data
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*" >&2; }

# ─── Parse Flags ──────────────────────────────────────────────────────
RESET=""
ONLY=""
PASSTHROUGH_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reset)
      RESET="--reset"
      PASSTHROUGH_ARGS+=("$1")
      shift
      ;;
    --only)
      ONLY="$2"
      PASSTHROUGH_ARGS+=("$1" "$2")
      shift 2
      ;;
    *)
      PASSTHROUGH_ARGS+=("$1")
      shift
      ;;
  esac
done

echo -e "${BOLD}━━━ Brindin Platform — Database Seed ━━━${NC}\n"

# ─── Check Database Connectivity ─────────────────────────────────────
info "Checking database connectivity..."

# Source .env for DATABASE_URL
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep 'DATABASE_URL' | xargs)
fi

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/brindin}"
if ! pg_isready -d "$DB_URL" &>/dev/null; then
  # Fallback: try via docker
  if ! docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
    error "Cannot connect to database. Is PostgreSQL running?"
    error "Run: docker compose up -d postgres"
    exit 1
  fi
fi
success "Database is reachable"

# ─── Seed Regional Profiles ──────────────────────────────────────────
echo ""
info "Seeding regional creative profiles..."
pnpm --filter @brindin/backend seed:regional-profiles
success "Regional profiles seeded"

# ─── Seed Main Demo Data ─────────────────────────────────────────────
echo ""
info "Seeding main demo data..."
pnpm --filter @brindin/backend seed "${PASSTHROUGH_ARGS[@]}"
success "Demo data seeded"

echo ""
echo -e "${BOLD}━━━ Seeding Complete ━━━${NC}"
echo ""
echo "  Inspect data:  pnpm --filter @brindin/backend db:studio"
echo ""
