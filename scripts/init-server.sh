#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/app/aigc-for-study"
GIT_REPO="https://github.com/ljh372199-rgb/Aigc-For-Study.git"
APP_USER="ubuntu"
APP_PORT_STAGING=38000
WEB_PORT_STAGING=38010
APP_PORT_PROD=38001
WEB_PORT_PROD=38002

show_help() {
    cat << EOF
${BLUE}Aigc For Study - Server Initialization Script${NC}

${GREEN}Usage:${NC}
    $0 [OPTIONS]

${GREEN}Options:${NC}
    --app-dir DIR        Application directory (default: /app/aigc-for-study)
    --git-repo URL       Git repository URL (default: ${GIT_REPO})
    --app-user USER      Application user (default: ubuntu)
    --skip-docker        Skip Docker installation
    --skip-firewall      Skip firewall configuration
    --help              Show this help message

${GREEN}This script will:${NC}
    1. Install Docker and Docker Compose
    2. Create application directory structure
    3. Configure firewall rules for the following ports:
       - Staging: ${APP_PORT_STAGING} (API), ${WEB_PORT_STAGING} (Web)
       - Production: ${APP_PORT_PROD} (API), ${WEB_PORT_PROD} (Web)
    4. Clone the Git repository
    5. Configure Docker daemon for multi-architecture builds

${GREEN}Examples:${NC}
    # Full installation
    sudo $0

    # Skip firewall configuration
    sudo $0 --skip-firewall

    # Custom directory
    sudo $0 --app-dir /opt/aigc-for-study

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

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
}

install_docker() {
    log_info "Installing Docker..."

    if command -v docker &> /dev/null; then
        log_info "Docker is already installed: $(docker --version)"
    else
        log_info "Installing Docker from official repository..."

        apt-get update
        apt-get install -y ca-certificates curl gnupg lsb-release

        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        echo \
            "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
            $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        log_success "Docker installed successfully"
    fi

    log_info "Docker version: $(docker --version)"
    log_info "Docker Compose version: $(docker compose version)"
}

enable_docker_buildx() {
    log_info "Enabling Docker Buildx for multi-architecture builds..."

    if docker buildx version &> /dev/null; then
        log_info "Docker Buildx is available: $(docker buildx version)"

        if ! docker buildx inspect aigc-builder &> /dev/null; then
            log_info "Creating Buildx builder..."
            docker buildx create --name aigc-builder --driver docker-container --bootstrap
        fi

        docker buildx use aigc-builder
        docker buildx inspect --bootstrap

        log_success "Docker Buildx configured successfully"
    else
        log_warning "Docker Buildx is not available"
    fi
}

configure_docker_service() {
    log_info "Configuring Docker service..."

    if [ -f /etc/docker/daemon.json ]; then
        log_info "Docker daemon.json already exists, backing up..."
        cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
    fi

    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF

    log_success "Docker daemon configured"
}

create_directories() {
    log_info "Creating application directories..."

    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/data/postgres"
    mkdir -p "$APP_DIR/data/redis"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/backups"

    chmod -R 755 "$APP_DIR"
    chmod -R 777 "$APP_DIR/data"

    log_success "Directories created at $APP_DIR"
}

setup_firewall() {
    log_info "Configuring firewall rules..."

    if command -v ufw &> /dev/null; then
        log_info "UFW firewall detected, configuring..."

        ufw --force enable

        ufw allow 22/tcp comment 'SSH'
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'

        ufw allow ${APP_PORT_STAGING}/tcp comment "Staging API"
        ufw allow ${WEB_PORT_STAGING}/tcp comment "Staging Web"
        ufw allow ${APP_PORT_PROD}/tcp comment "Production API"
        ufw allow ${WEB_PORT_PROD}/tcp comment "Production Web"

        ufw reload
        log_success "Firewall rules configured"
    elif command -v firewall-cmd &> /dev/null; then
        log_info "Firewalld detected, configuring..."

        firewall-cmd --permanent --add-port=22/tcp
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=${APP_PORT_STAGING}/tcp
        firewall-cmd --permanent --add-port=${WEB_PORT_STAGING}/tcp
        firewall-cmd --permanent --add-port=${APP_PORT_PROD}/tcp
        firewall-cmd --permanent --add-port=${WEB_PORT_PROD}/tcp

        firewall-cmd --reload
        log_success "Firewall rules configured"
    else
        log_warning "No supported firewall found. Please configure manually."
    fi
}

clone_repository() {
    log_info "Cloning Git repository..."

    if [ -d "$APP_DIR/.git" ]; then
        log_info "Repository already exists, pulling latest changes..."
        cd "$APP_DIR"
        sudo -u $APP_USER git pull origin main
        cd - > /dev/null
    else
        if [ -d "$APP_DIR" ]; then
            log_warning "Application directory exists but is not a git repository."
            log_info "Please remove or backup the directory first."
            read -p "Remove and re-clone? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm -rf "$APP_DIR"
                sudo -u $APP_USER git clone "$GIT_REPO" "$APP_DIR"
            fi
        else
            sudo -u $APP_USER git clone "$GIT_REPO" "$APP_DIR"
        fi
    fi

    chown -R $APP_USER:$APP_USER "$APP_DIR"
    log_success "Repository cloned to $APP_DIR"
}

create_service_user() {
    log_info "Creating application user..."

    if id "$APP_USER" &>/dev/null; then
        log_info "User '$APP_USER' already exists"
    else
        useradd -m -s /bin/bash -G docker $APP_USER
        log_success "User '$APP_USER' created and added to docker group"
    fi
}

verify_installation() {
    log_info "Verifying installation..."

    local errors=0

    if ! command -v docker &> /dev/null; then
        log_error "Docker not found"
        errors=$((errors + 1))
    fi

    if ! command -v git &> /dev/null; then
        log_error "Git not found"
        errors=$((errors + 1))
    fi

    if [ ! -d "$APP_DIR" ]; then
        log_error "Application directory not found"
        errors=$((errors + 1))
    fi

    if [ $errors -eq 0 ]; then
        log_success "All verification checks passed!"
        return 0
    else
        log_error "Verification failed with $errors error(s)"
        return 1
    fi
}

parse_args() {
    SKIP_DOCKER=false
    SKIP_FIREWALL=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --app-dir)
                APP_DIR="$2"
                shift 2
                ;;
            --git-repo)
                GIT_REPO="$2"
                shift 2
                ;;
            --app-user)
                APP_USER="$2"
                shift 2
                ;;
            --skip-docker)
                SKIP_DOCKER=true
                shift
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
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
}

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Aigc For Study - Server Setup${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    check_root
    parse_args "$@"

    echo ""
    log_info "Configuration:"
    log_info "  Application Directory: $APP_DIR"
    log_info "  Git Repository: $GIT_REPO"
    log_info "  Application User: $APP_USER"
    log_info "  Staging Ports: API=$APP_PORT_STAGING, Web=$WEB_PORT_STAGING"
    log_info "  Production Ports: API=$APP_PORT_PROD, Web=$WEB_PORT_PROD"
    echo ""

    if [ "$SKIP_DOCKER" = false ]; then
        install_docker
        enable_docker_buildx
        configure_docker_service
    else
        log_info "Skipping Docker installation"
    fi

    create_directories

    if [ "$SKIP_FIREWALL" = false ]; then
        setup_firewall
    else
        log_info "Skipping firewall configuration"
    fi

    create_service_user
    clone_repository

    echo ""
    verify_installation

    echo ""
    echo -e "${GREEN}========================================${NC}"
    log_success "Server initialization completed!"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    log_info "Next steps:"
    echo "  1. Switch to application user: sudo su - $APP_USER"
    echo "  2. Navigate to app: cd $APP_DIR"
    echo "  3. Create branch: git checkout -b develop"
    echo "  4. Build and deploy: cd scripts && ./deploy.sh --env staging --registry YOUR_REGISTRY"
    echo ""
    log_info "To check Docker status: docker ps"
    log_info "To view logs: docker-compose -f $APP_DIR/docker-compose.staging.yml logs -f"
}

main "$@"
