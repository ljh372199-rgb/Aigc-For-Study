#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENVIRONMENT="staging"
COMPOSE_FILE="${PROJECT_ROOT}/ops/docker-compose.ops.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

show_help() {
    cat << EOF
用法: $0 [选项]

选项:
    --env <环境>      设置环境 (staging/production)，默认: staging
    --help           显示此帮助信息

示例:
    $0 --env staging
    $0 --env production

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

validate_docker() {
    print_info "检查 Docker 安装..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker 服务未运行，请先启动 Docker"
        exit 1
    fi
    
    DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
    print_success "Docker ${DOCKER_VERSION} 已安装并运行"
}

validate_docker_compose() {
    print_info "检查 Docker Compose 安装..."
    
    COMPOSE_VERSION=""
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version | grep -oP '\d+\.\d+\.\d+')
        print_success "Docker Compose ${COMPOSE_VERSION} 已安装 (v2)"
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | grep -oP '\d+\.\d+\.\d+')
        print_success "Docker Compose ${COMPOSE_VERSION} 已安装 (v1)"
        COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
}

create_network() {
    print_info "检查 aigc-network 网络..."
    
    if docker network ls | grep -q "^aigc-network "; then
        print_success "aigc-network 网络已存在"
    else
        print_info "创建 aigc-network 网络..."
        docker network create aigc-network 2>/dev/null || true
        print_success "aigc-network 网络已创建"
    fi
}

create_directories() {
    print_info "创建监控数据目录..."
    
    DIRS=(
        "${PROJECT_ROOT}/ops/prometheus_data"
        "${PROJECT_ROOT}/ops/grafana_data"
        "${PROJECT_ROOT}/ops/loki_data"
        "${PROJECT_ROOT}/ops/alertmanager_data"
    )
    
    for dir in "${DIRS[@]}"; do
        if [ -d "$dir" ]; then
            print_success "目录已存在: $dir"
        else
            mkdir -p "$dir"
            print_success "目录已创建: $dir"
        fi
        chmod 777 "$dir" 2>/dev/null || true
    done
}

start_monitoring_services() {
    print_info "启动监控服务 (环境: ${ENVIRONMENT})..."
    
    cd "${PROJECT_ROOT}/ops"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose 文件不存在: $COMPOSE_FILE"
        exit 1
    fi
    
    export ENVIRONMENT="${ENVIRONMENT}"
    
    ${COMPOSE_CMD} -f "$COMPOSE_FILE" up -d
    
    print_success "监控服务启动命令已执行"
}

wait_for_services() {
    print_info "等待服务启动..."
    
    local max_wait=120
    local elapsed=0
    local interval=5
    
    while [ $elapsed -lt $max_wait ]; do
        local running=$(${COMPOSE_CMD} -f "$COMPOSE_FILE" ps --services --filter "status=running" 2>/dev/null | wc -l)
        local total=$(${COMPOSE_CMD} -f "$COMPOSE_FILE" ps --services 2>/dev/null | wc -l)
        
        if [ "$running" -eq "$total" ] && [ "$total" -gt 0 ]; then
            print_success "所有服务已启动 (${running}/${total})"
            return 0
        fi
        
        echo -ne "\r${YELLOW}等待服务启动: ${running}/${total} 完成${NC}  "
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    echo ""
    print_warning "部分服务可能未完全启动，请在服务启动后进行验证"
    return 1
}

verify_services() {
    print_info "验证服务健康状态..."
    
    local services=(
        "prometheus:9090"
        "grafana:3000"
        "loki:3100"
        "alertmanager:9093"
    )
    
    local all_healthy=true
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        
        if curl -sf "http://localhost:${port}/-/healthy" &>/dev/null || \
           curl -sf "http://localhost:${port}/health" &>/dev/null; then
            print_success "${name} (http://localhost:${port}) 健康"
        else
            print_warning "${name} (http://localhost:${port}) 未就绪"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        return 0
    else
        return 1
    fi
}

display_access_info() {
    echo ""
    echo "========================================"
    echo "         监控服务访问信息"
    echo "========================================"
    echo ""
    echo -e "${GREEN}Prometheus:${NC}  http://localhost:9090"
    echo -e "${GREEN}Grafana:${NC}      http://localhost:3000"
    echo -e "${GREEN}Loki:${NC}         http://localhost:3100"
    echo -e "${GREEN}Alertmanager:${NC} http://localhost:9093"
    echo ""
    echo -e "${YELLOW}提示:${NC}"
    echo "  - Prometheus 默认用户: admin"
    echo "  - Grafana 默认用户: admin / admin"
    echo ""
    echo "========================================"
    echo ""
}

main() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}      监控环境设置脚本${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    validate_docker
    validate_docker_compose
    create_network
    create_directories
    start_monitoring_services
    
    if wait_for_services; then
        verify_services
    fi
    
    display_access_info
    
    print_success "监控服务设置完成！"
}

main
