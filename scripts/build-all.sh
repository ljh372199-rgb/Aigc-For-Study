#!/bin/bash

# ===============================================
# Aigc For Study - 统一Docker构建脚本
# 支持一键构建前端和后端镜像
# ===============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 默认配置
BUILD_ALL=true
BUILD_BACKEND=false
BUILD_FRONTEND=false
PLATFORMS="linux/amd64,linux/arm64"
REGISTRY=""
TAG="latest"
PUSH=false
NO_CACHE=false
BUILD_BACKEND_ONLY=""
BUILD_FRONTEND_ONLY=""

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 帮助信息
show_help() {
    cat << EOF
${CYAN}========================================${NC}
${CYAN}  Aigc For Study - 统一构建脚本${NC}
${CYAN}========================================${NC}

${GREEN}用法:${NC}
    $0 [选项]

${GREEN}构建选项:${NC}
    --all          构建所有服务（默认）
    --backend      仅构建后端
    --frontend     仅构建前端

${GREEN}镜像配置:${NC}
    --platforms <平台>   目标平台 (默认: linux/amd64,linux/arm64)
    --registry <地址>    镜像仓库地址
    --tag <标签>        镜像标签 (默认: latest)
    --push             构建后推送到仓库

${GREEN}高级选项:${NC}
    --no-cache         不使用构建缓存
    --help             显示帮助信息

${GREEN}示例:${NC}
    # 构建所有服务（amd64，仅本地）
    $0 --all --platforms linux/amd64 --tag dev

    # 构建所有服务（双架构）
    $0 --all --tag v1.0.0

    # 仅构建后端
    $0 --backend --tag v1.0.0

    # 仅构建前端
    $0 --frontend --tag v1.0.0

    # 构建并推送到阿里云
    $0 --all \\
        --registry registry.cn-hangzhou.aliyuncs.com \\
        --name your-namespace/aigc \\
        --tag v1.0.0 \\
        --push

${GREEN}端口配置:${NC}
    后端 API:  38000
    前端 Web: 3000 (本地) / 38010 (测试) / 38002 (生产)

${GREEN}前置要求:${NC}
    1. Docker 19.03+
    2. docker-buildx-plugin 已安装
    3. 执行权限: chmod +x scripts/*.sh

EOF
    exit 0
}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi

    if ! docker buildx version &> /dev/null; then
        log_error "Docker Buildx 未安装"
        exit 1
    fi

    log_success "依赖检查通过"
}

# 解析参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                BUILD_ALL=true
                BUILD_BACKEND=false
                BUILD_FRONTEND=false
                shift
                ;;
            --backend)
                BUILD_ALL=false
                BUILD_BACKEND=true
                BUILD_FRONTEND=false
                shift
                ;;
            --frontend)
                BUILD_ALL=false
                BUILD_BACKEND=false
                BUILD_FRONTEND=true
                shift
                ;;
            --platforms)
                PLATFORMS="$2"
                shift 2
                ;;
            --registry)
                REGISTRY="$2"
                shift 2
                ;;
            --name)
                IMAGE_NAME="$2"
                shift 2
                ;;
            --tag)
                TAG="$2"
                shift 2
                ;;
            --push)
                PUSH=true
                shift
                ;;
            --no-cache)
                NO_CACHE=true
                shift
                ;;
            --help)
                show_help
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 构建后端镜像
build_backend() {
    log_step "构建后端镜像"

    local backend_script="$SCRIPT_DIR/build-docker.sh"

    if [ ! -f "$backend_script" ]; then
        log_error "后端构建脚本不存在: $backend_script"
        return 1
    fi

    log_info "执行: $backend_script --platforms $PLATFORMS --tag $TAG"
    echo ""

    "$backend_script" --platforms "$PLATFORMS" --tag "$TAG"
    
    if [ $? -eq 0 ]; then
        log_success "后端镜像构建完成"
        return 0
    else
        log_error "后端镜像构建失败"
        return 1
    fi
}

# 构建前端镜像
build_frontend() {
    log_step "构建前端镜像"

    local frontend_script="$SCRIPT_DIR/build-frontend-docker.sh"

    if [ ! -f "$frontend_script" ]; then
        log_error "前端构建脚本不存在: $frontend_script"
        return 1
    fi

    log_info "执行: $frontend_script --platforms $PLATFORMS --tag $TAG"
    echo ""

    "$frontend_script" --platforms "$PLATFORMS" --tag "$TAG"
    
    if [ $? -eq 0 ]; then
        log_success "前端镜像构建完成"
        return 0
    else
        log_error "前端镜像构建失败"
        return 1
    fi
}

# 打印构建摘要
print_summary() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  构建摘要${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "${GREEN}镜像标签:${NC} $TAG"
    echo -e "${GREEN}目标平台:${NC} $PLATFORMS"
    echo -e "${GREEN}镜像仓库:${NC} ${REGISTRY:-本地}"

    if [ -n "$REGISTRY" ]; then
        echo ""
        echo -e "${GREEN}镜像地址:${NC}"
        if [ "$BUILD_ALL" = true ] || [ "$BUILD_BACKEND" = true ]; then
            echo "  后端: $REGISTRY/aigc-api:$TAG"
        fi
        if [ "$BUILD_ALL" = true ] || [ "$BUILD_FRONTEND" = true ]; then
            echo "  前端: $REGISTRY/aigc-frontend:$TAG"
        fi
    fi

    echo ""
    echo -e "${GREEN}下一步操作:${NC}"
    echo "  1. 本地测试: docker-compose up -d"
    echo "  2. 查看日志: docker-compose logs -f"
    echo "  3. 推送到仓库: ./scripts/$0 --all --tag $TAG --push --registry YOUR_REGISTRY"
    echo ""
}

# 主函数
main() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  Aigc For Study - 统一构建${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""

    parse_args "$@"

    cd "$PROJECT_ROOT"

    log_info "构建配置:"
    log_info "  模式: $([ "$BUILD_ALL" = true ] && echo "全部" || ([ "$BUILD_BACKEND" = true ] && echo "后端" || echo "前端"))"
    log_info "  平台: $PLATFORMS"
    log_info "  标签: $TAG"
    log_info "  仓库: ${REGISTRY:-本地}"
    log_info "  推送: $([ "$PUSH" = true ] && echo "是" || echo "否")"
    echo ""

    check_dependencies

    local build_failed=false

    # 执行构建
    if [ "$BUILD_ALL" = true ]; then
        log_step "构建全部服务"
        build_backend || build_failed=true
        echo ""
        build_frontend || build_failed=true

    elif [ "$BUILD_BACKEND" = true ]; then
        build_backend || build_failed=true

    elif [ "$BUILD_FRONTEND" = true ]; then
        build_frontend || build_failed=true

    else
        log_error "未指定构建目标"
        show_help
        exit 1
    fi

    # 打印摘要
    print_summary

    # 返回状态
    if [ "$build_failed" = true ]; then
        log_error "部分构建失败"
        exit 1
    fi

    log_success "所有构建任务完成！"
}

main "$@"
