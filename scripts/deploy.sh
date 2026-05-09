#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DEPLOY_ENV="staging"
VERSION="latest"
REGISTRY=""
APP_DIR="/app/aigc-for-study"
API_PORT=""
WEB_PORT=""

show_help() {
    cat << EOF
${BLUE}Aigc For Study - Deployment Script${NC}

${GREEN}Usage:${NC}
    $0 [OPTIONS]

${GREEN}Required Options:${NC}
    --registry REGISTRY    Docker registry URL (required)

${GREEN}Options:${NC}
    --env ENV             Deployment environment (staging/production)
                          staging: API on 38000, Web on 38010
                          production: API on 38001, Web on 38002
                          (default: staging)
    --version VERSION     Image tag/version to deploy (default: latest)
    --registry REGISTRY   Docker registry URL (required)
    --help                Show this help message

${GREEN}Examples:${NC}
    # Deploy to staging environment
    $0 --env staging --version v1.0.0 --registry registry.cn-hangzhou.aliyuncs.com

    # Deploy to production environment
    $0 --env production --version v1.0.0 --registry registry.cn-hangzhou.aliyuncs.com

    # Quick deploy latest to staging
    $0 --registry docker.io/username/aigc-api

${GREEN}Port Configuration:${NC}
    Staging Environment:
      API:    38000
      Web:    38010
      DB:     5433
      Redis:  6380

    Production Environment:
      API:    38001
      Web:    38002
      DB:     5434
      Redis:  6381

${GREEN}Workflow:${NC}
    1. Pull specified image from registry
    2. Stop existing containers
    3. Start new containers with new image
    4. Run health check
    5. Report deployment status

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

set_ports() {
    case $DEPLOY_ENV in
        staging)
            API_PORT=38000
            WEB_PORT=38010
            log_info "Deploying to STAGING environment"
            log_info "  API Port: $API_PORT"
            log_info "  Web Port: $WEB_PORT"
            ;;
        production)
            API_PORT=38001
            WEB_PORT=38002
            log_info "Deploying to PRODUCTION environment"
            log_info "  API Port: $API_PORT"
            log_info "  Web Port: $WEB_PORT"
            ;;
        *)
            log_error "Unknown environment: $DEPLOY_ENV"
            log_error "Valid options: staging, production"
            exit 1
            ;;
    esac
}

pull_image() {
    local full_image="${REGISTRY}:${VERSION}"

    log_info "Pulling Docker image: ${full_image}"

    if docker pull "${full_image}"; then
        log_success "Image pulled successfully: ${full_image}"
    else
        log_error "Failed to pull image: ${full_image}"
        exit 1
    fi
}

stop_containers() {
    log_info "Stopping existing containers..."

    local compose_file="docker-compose.${DEPLOY_ENV}.yml"
    local compose_cmd="docker-compose -f ${compose_file}"

    if [ -f "${APP_DIR}/${compose_file}" ]; then
        cd "$APP_DIR"
        $compose_cmd down --remove-orphans 2>/dev/null || true
        cd - > /dev/null
    fi

    local containers=$(docker ps -aq --filter "name=aigc-" --filter "label=env=${DEPLOY_ENV}" 2>/dev/null || true)
    if [ -n "$containers" ]; then
        docker stop $containers 2>/dev/null || true
        docker rm $containers 2>/dev/null || true
        log_info "Existing containers stopped and removed"
    else
        log_info "No existing containers found"
    fi
}

start_containers() {
    local full_image="${REGISTRY}:${VERSION}"
    local compose_file="docker-compose.${DEPLOY_ENV}.yml"

    log_info "Starting containers with image: ${full_image}"

    if [ ! -f "${APP_DIR}/${compose_file}" ]; then
        log_warning "Compose file not found at ${APP_DIR}/${compose_file}"
        log_info "Pulling code from repository..."
        cd "$APP_DIR"
        git pull origin ${DEPLOY_ENV:-develop} 2>/dev/null || git pull origin main
        cd - > /dev/null
    fi

    cd "$APP_DIR"

    if [ -f "docker-compose.${DEPLOY_ENV}.yml" ]; then
        sed -i "s|image:.*:latest|image: ${full_image}|g" "docker-compose.${DEPLOY_ENV}.yml" 2>/dev/null || true

        docker-compose -f "docker-compose.${DEPLOY_ENV}.yml" up -d

        if [ $? -eq 0 ]; then
            log_success "Containers started successfully"
        else
            log_error "Failed to start containers"
            exit 1
        fi
    else
        log_error "Compose file not found: ${compose_file}"
        exit 1
    fi

    cd - > /dev/null
}

health_check() {
    log_info "Running health check..."

    local max_attempts=30
    local attempt=1
    local api_url="http://localhost:${API_PORT}/health"
    local web_url="http://localhost:${WEB_PORT}"

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt ${attempt}/${max_attempts}..."

        if curl -sf "$api_url" &>/dev/null; then
            log_success "API health check passed!"
            return 0
        fi

        if curl -sf "$web_url" &>/dev/null; then
            log_success "Web health check passed!"
            return 0
        fi

        attempt=$((attempt + 1))
        sleep 2
    done

    log_warning "Health check timed out, but containers are running"
    return 1
}

rollback() {
    log_warning "Rolling back to previous version..."

    local previous_tag=$(docker images "${REGISTRY}:"* --format "{{.Tag}}" | head -2 | tail -1 || echo "none")

    if [ "$previous_tag" != "none" ]; then
        VERSION="$previous_tag"
        pull_image
        stop_containers
        start_containers
        log_success "Rollback completed to version: $previous_tag"
    else
        log_error "No previous version found for rollback"
        exit 1
    fi
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                DEPLOY_ENV="$2"
                shift 2
                ;;
            --version)
                VERSION="$2"
                shift 2
                ;;
            --registry)
                REGISTRY="$2"
                shift 2
                ;;
            --rollback)
                ROLLBACK=true
                shift
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

    if [ -z "$REGISTRY" ]; then
        log_error "--registry is required"
        show_help
        exit 1
    fi
}

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Aigc For Study - Deployment${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    parse_args "$@"
    set_ports

    echo ""
    log_info "Deployment Configuration:"
    log_info "  Environment: ${DEPLOY_ENV}"
    log_info "  Version: ${VERSION}"
    log_info "  Registry: ${REGISTRY}"
    log_info "  API Port: ${API_PORT}"
    log_info "  Web Port: ${WEB_PORT}"
    echo ""

    pull_image
    stop_containers
    start_containers
    health_check

    echo ""
    echo -e "${GREEN}========================================${NC}"
    log_success "Deployment completed successfully!"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    log_info "Access URLs:"
    log_info "  API: http://localhost:${API_PORT}"
    log_info "  Web: http://localhost:${WEB_PORT}"
    echo ""
    log_info "To rollback: $0 --rollback --env ${DEPLOY_ENV} --registry ${REGISTRY}"
}

main "$@"
