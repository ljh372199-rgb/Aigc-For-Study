#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

show_help() {
    cat << EOF
${BLUE}Aigc For Study - Backup Script${NC}

${GREEN}Usage:${NC}
    $0 [OPTIONS]

${GREEN}Options:${NC}
    --env ENV           Environment to backup (staging/production/all)
                        (default: all)
    --backup-dir DIR    Backup directory (default: ./backups)
    --keep-days DAYS    Number of days to keep backups (default: 7)
    --db-only          Backup database only
    --files-only       Backup files only
    --help             Show this help message

${GREEN}Examples:${NC}
    # Backup all (database + files)
    $0

    # Backup staging database only
    $0 --env staging --db-only

    # Backup all, keep for 14 days
    $0 --keep-days 14

${GREEN}Backup Contents:${NC}
    - PostgreSQL database dump
    - Redis data
    - Uploaded files
    - Configuration files (excluding secrets)

EOF
    exit 0
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

backup_postgres() {
    local env=$1
    local db_port=$2
    local db_name=$3
    local backup_file="${BACKUP_DIR}/${env}_postgres_${TIMESTAMP}.sql.gz"

    log_info "Backing up PostgreSQL (${env})..."

    if docker exec "aigc-db-${env}" pg_dump -U aigc -d "${db_name}" 2>/dev/null | gzip > "${backup_file}"; then
        local size=$(du -h "${backup_file}" | cut -f1)
        log_success "PostgreSQL backup created: ${backup_file} (${size})"
    else
        log_warning "Failed to backup PostgreSQL for ${env}"
        return 1
    fi
}

backup_redis() {
    local env=$1
    local backup_file="${BACKUP_DIR}/${env}_redis_${TIMESTAMP}.rdb.gz"

    log_info "Backing up Redis (${env})..."

    if docker exec "aigc-redis-${env}" redis-cli SAVE 2>/dev/null && \
       docker cp "aigc-redis-${env}:/data/dump.rdb" - 2>/dev/null | gzip > "${backup_file}"; then
        local size=$(du -h "${backup_file}" | cut -f1)
        log_success "Redis backup created: ${backup_file} (${size})"
    else
        log_warning "Failed to backup Redis for ${env}"
        return 1
    fi
}

backup_files() {
    local env=$1
    local backup_file="${BACKUP_DIR}/${env}_files_${TIMESTAMP}.tar.gz"

    log_info "Backing up files (${env})..."

    if tar -czf "${backup_file}" \
           -C "$(dirname ${PROJECT_ROOT})" \
           "$(basename ${PROJECT_ROOT})/uploads" 2>/dev/null; then
        local size=$(du -h "${backup_file}" | cut -f1)
        log_success "Files backup created: ${backup_file} (${size})"
    else
        log_warning "Failed to backup files for ${env}"
        return 1
    fi
}

backup_staging() {
    log_info "Backing up STAGING environment..."

    local env="staging"

    if [ "$DB_ONLY" = false ]; then
        backup_postgres "$env" "5433" "aigc_staging"
        backup_redis "$env"
        backup_files "$env"
    else
        backup_postgres "$env" "5433" "aigc_staging"
    fi
}

backup_production() {
    log_info "Backing up PRODUCTION environment..."

    local env="production"

    if [ "$DB_ONLY" = false ]; then
        backup_postgres "$env" "5434" "aigc_prod"
        backup_redis "$env"
        backup_files "$env"
    else
        backup_postgres "$env" "5434" "aigc_prod"
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    local deleted=$(find "${BACKUP_DIR}" -name "*.sql.gz" -o -name "*.rdb.gz" -o -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null | wc -l)

    if [ "$deleted" -gt 0 ]; then
        log_success "Deleted $deleted old backup file(s)"
    else
        log_info "No old backups to delete"
    fi
}

list_backups() {
    log_info "Available backups in ${BACKUP_DIR}:"

    if [ -d "${BACKUP_DIR}" ] && [ "$(ls -A ${BACKUP_DIR} 2>/dev/null)" ]; then
        echo ""
        ls -lh "${BACKUP_DIR}" | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'
        echo ""
    else
        log_info "No backups found"
    fi
}

restore_postgres() {
    local env=$1
    local backup_file=$2

    log_info "Restoring PostgreSQL from ${backup_file}..."

    if gunzip -c "${backup_file}" | docker exec -i "aigc-db-${env}" psql -U aigc -d "aigc_${env}" 2>/dev/null; then
        log_success "PostgreSQL restored successfully"
    else
        log_error "Failed to restore PostgreSQL"
        exit 1
    fi
}

parse_args() {
    BACKUP_ENV="all"
    DB_ONLY=false
    FILES_ONLY=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                BACKUP_ENV="$2"
                shift 2
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --keep-days)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --db-only)
                DB_ONLY=true
                shift
                ;;
            --files-only)
                FILES_ONLY=true
                shift
                ;;
            --list)
                list_backups
                exit 0
                ;;
            --help)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Aigc For Study - Backup${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    parse_args "$@"

    if ! mkdir -p "${BACKUP_DIR}"; then
        log_error "Failed to create backup directory: ${BACKUP_DIR}"
        exit 1
    fi

    echo ""
    log_info "Backup Configuration:"
    log_info "  Environment: ${BACKUP_ENV}"
    log_info "  Backup Directory: ${BACKUP_DIR}"
    log_info "  Retention Days: ${RETENTION_DAYS}"
    log_info "  Database Only: ${DB_ONLY}"
    log_info "  Files Only: ${FILES_ONLY}"
    echo ""

    case $BACKUP_ENV in
        staging)
            backup_staging
            ;;
        production)
            backup_production
            ;;
        all)
            backup_staging
            echo ""
            backup_production
            ;;
        *)
            log_error "Unknown environment: $BACKUP_ENV"
            exit 1
            ;;
    esac

    cleanup_old_backups

    echo ""
    log_success "Backup completed!"
    echo ""

    list_backups
}

main "$@"
