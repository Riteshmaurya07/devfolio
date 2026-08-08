#!/bin/bash
# shellcheck shell=bash
# =============================================================================
# start_local.sh — Devfolio OS, local development.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colors & Helpers ──────────────────────────────────────────────────
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'

ok() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1" >&2; [[ -n "${2:-}" ]] && echo -e "  ${DIM}$2${NC}" >&2; exit 1; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
step() { echo -e "${CYAN}→${NC} $1"; }
hr() { echo -e "${DIM}----------------------------------------------------------------------${NC}"; }

compose() {
    docker-compose -f docker-compose.yml "$@"
}

# ── Configuration ─────────────────────────────────────────────────────
PROJECT_NAME="devfolio-local"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"
REQUIRED_PORTS=(3000 8000 5432 6379)
HEALTH_TIMEOUT=180

# ── Banner ────────────────────────────────────────────────────────────
banner() {
    echo -e "${CYAN}${BOLD}"
    cat <<'EOF'
  ██████╗ ███████╗██╗   ██╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
  ██╔══██╗██╔════╝██║   ██║██╔════╝██╔═══██╗██║     ██║██╔═══██╗
  ██║  ██║█████╗  ██║   ██║█████╗  ██║   ██║██║     ██║██║   ██║
  ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║   ██║██║     ██║██║   ██║
  ██████╔╝███████╗ ╚████╔╝ ██║     ╚██████╔╝███████╗██║╚██████╔╝
  ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
EOF
    echo -e "                            ${DIM}Devfolio OS — Local Development${NC}${NC}"
    echo ""
}

# ── Pre-flight checks ─────────────────────────────────────────────────
check_prereq() {
    command -v docker >/dev/null 2>&1 || fail "Docker not found" "Install Docker Desktop"
    command -v docker-compose >/dev/null 2>&1 || fail "docker-compose not found" "Install Docker Compose"
    docker info >/dev/null 2>&1 || fail "Docker daemon not running" "Start Docker Desktop"
    ok "Docker and Compose are ready"
}

check_ports() {
    # Simple check on windows using netstat (git bash friendly) or standard netstat.
    # We will just warn if it fails but we won't heavily break on Windows if tools differ.
    ok "Required ports target: ${REQUIRED_PORTS[*]}"
}

# ── Credentials box ───────────────────────────────────────────────────
print_ready() {
    echo ""
    echo -e "  ${PURPLE}┌────────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "  ${PURPLE}│${NC}  ${PURPLE}🚀${NC}  ${BOLD}Devfolio OS is live${NC}                                         ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}├────────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}Frontend:${NC}  ${CYAN}${FRONTEND_URL}${NC}                                      ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}API:${NC}       ${CYAN}${BACKEND_URL}${NC}                                      ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}API Docs:${NC}  ${CYAN}${BACKEND_URL}/docs${NC}                                 ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}PostgreSQL:${NC} ${CYAN}localhost:5432${NC}    ${BOLD}Redis:${NC} ${CYAN}localhost:6379${NC}                 ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}├────────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}Common Commands:${NC}                                                          ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}bash start_local.sh logs${NC}           ${DIM}follow recent logs${NC}                  ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}bash start_local.sh migrate${NC}        ${DIM}run alembic upgrade head${NC}            ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}bash start_local.sh stop${NC}           ${DIM}stop services (keep DB)${NC}             ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}bash start_local.sh start --fresh${NC}  ${DIM}nuke everything, rebuild${NC}           ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}└────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# ── Commands ──────────────────────────────────────────────────────────
cmd_start() {
    local fresh=false
    [[ "${1:-}" == "--fresh" ]] && fresh=true

    banner
    hr; echo -e "  ${BOLD}PRE-FLIGHT${NC}"; hr; echo ""
    check_prereq
    check_ports
    echo ""

    hr; echo -e "  ${BOLD}LAUNCHING${NC}"; hr; echo ""

    if $fresh; then
        step "Fresh mode: stopping containers + removing volumes + images"
        compose down -v --rmi local 2>/dev/null || true
        ok "Old state wiped"
    fi

    step "Building and starting services..."
    compose up -d --build
    
    step "Waiting for database to be ready..."
    sleep 5 # Provide simple backoff for db readiness before migrations
    
    cmd_migrate
    
    ok "All services healthy"
    print_ready
}

cmd_stop() {
    step "Stopping services..."
    compose stop
    ok "Services stopped"
}

cmd_restart() {
    cmd_stop
    cmd_start
}

cmd_logs() {
    compose logs -f "$@"
}

cmd_shell() {
    local svc="${1:-backend}"
    compose exec "$svc" sh
}

cmd_db() {
    compose exec db psql -U devfolio_user -d devfolio_db
}

cmd_migrate() {
    step "Applying existing database migrations..."
    # First, always try to apply existing migrations (e.g., files pulled from other branches)
    if ! compose exec -T backend alembic upgrade head; then
        warn "Failed to apply migrations! You may have multiple heads due to a branch merge."
        warn "To fix this manually: 'docker-compose exec backend alembic merge heads' then run this script again."
        return
    fi
    ok "Existing migrations applied."

    step "Scanning for new model changes (auto-migration)..."
    # Autogenerate any new changes made locally and apply them immediately
    compose exec -T backend alembic revision --autogenerate -m "auto" 2>/dev/null || true
    compose exec -T backend alembic upgrade head 2>/dev/null || true
    ok "Database schema is fully up to date."
}

cmd_help() {
    echo -e "${BOLD}Devfolio OS — start_local.sh${NC}"
    echo ""
    echo "Commands:"
    echo "  start [--fresh]        Start services (default)"
    echo "  stop                   Stop services (keep DB)"
    echo "  restart                Stop + start"
    echo "  logs [service]         Follow recent logs"
    echo "  shell <svc>            Open shell inside container (e.g., backend, frontend)"
    echo "  db                     Open psql prompt"
    echo "  migrate                Run alembic autogenerate and upgrade"
    echo "  help                   This message"
}

# ── Dispatcher ────────────────────────────────────────────────────────
cmd="${1:-start}"
shift || true

case "$cmd" in
    start)              cmd_start "$@" ;;
    stop)               cmd_stop ;;
    restart)            cmd_restart ;;
    logs)               cmd_logs "$@" ;;
    shell)              cmd_shell "$@" ;;
    db)                 cmd_db ;;
    migrate)            cmd_migrate ;;
    help|--help|-h)     cmd_help ;;
    *)                  echo "Unknown: $cmd"; cmd_help; exit 1 ;;
esac
