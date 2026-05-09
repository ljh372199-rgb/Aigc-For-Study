#!/bin/bash
# ===============================================
# Aigc For Study - 前端Docker镜像构建脚本
# 支持 amd64/arm64 双架构构建
# ===============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
IMAGE_NAME="aigc-frontend"
IMAGE_TAG="latest"
REGISTRY=""
PLATFORMS="linux/amd64,linux/arm64"
CONTEXT="./frontend"
DOCKERFILE="Dockerfile"
PUSH=false
LOAD=true

# 帮助信息
show_help() {
    cat << EOF
${GREEN}Aigc For Study - 前端Docker镜像构建脚本${NC}

${YELLOW}用法:${NC}
    $0 [选项]

${YELLOW}选项:${NC}
    --registry <地址>     镜像仓库地址 (如: docker.io, registry.cn-hangzhou.aliyuncs.com)
    --name <名称>        镜像名称 (默认: aigc-frontend)
    --tag <标签>          镜像标签 (默认: latest)
    --platforms <平台>   目标平台 (默认: linux/amd64,linux/arm64)
    --context <路径>      构建上下文路径 (默认: ./frontend)
    --file <文件>         Dockerfile路径 (默认: Dockerfile)
    --push                构建后推送到仓库
    --no-load             不加载到本地Docker (仅配合--push使用)
    --help                显示帮助信息

${YELLOW}示例:${NC}
    # 本地构建 amd64
    $0 --platforms linux/amd64 --tag dev

    # 本地构建双架构
    $0 --tag latest

    # 推送到Docker Hub
    $0 --registry docker.io --name aigcstudy/aigc-frontend --tag v1.0.0 --push

    # 推送到阿里云
    $0 --registry registry.cn-hangzhou.aliyuncs.com --name your-namespace/aigc-frontend --tag v1.0.0 --push

${YELLOW}前置要求:${NC}
    1. Docker 19.03+
    2. 创建builder: docker buildx create --name aigc-frontend-builder --driver docker-container --bootstrap
    3. 使用builder: docker buildx use aigc-frontend-builder

EOF
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

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        --context)
            CONTEXT="$2"
            shift 2
            ;;
        --file)
            DOCKERFILE="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            LOAD=false
            shift
            ;;
        --no-load)
            LOAD=false
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 构建完整镜像标签
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
    FULL_IMAGE_TAG="${IMAGE_NAME}:${IMAGE_TAG}"
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装"
    exit 1
fi

# 检查Docker版本
DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [ -n "$DOCKER_VERSION" ]; then
    if ! docker version --format '{{.Server.Version}}' > /dev/null 2>&1; then
        log_warn "无法获取Docker版本，跳过版本检查"
    fi
fi

# 检查Buildx是否可用
if ! docker buildx version &> /dev/null; then
    log_error "Docker Buildx 未安装"
    exit 1
fi

# 检查builder是否存在
BUILDER_NAME="aigc-frontend-builder"
if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
    log_warn "Builder '$BUILDER_NAME' 不存在，正在创建..."
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
fi

# 使用builder
docker buildx use "$BUILDER_NAME"

# 检查上下文目录
if [ ! -d "$CONTEXT" ]; then
    log_error "构建上下文目录不存在: $CONTEXT"
    exit 1
fi

# 检查Dockerfile
if [ ! -f "$CONTEXT/$DOCKERFILE" ]; then
    log_error "Dockerfile 不存在: $CONTEXT/$DOCKERFILE"
    exit 1
fi

# 构建前端（如果dist目录不存在）
if [ ! -d "$CONTEXT/dist" ]; then
    log_warn "dist目录不存在，正在构建前端..."
    if [ -f "$CONTEXT/package.json" ]; then
        (cd "$CONTEXT" && npm install && npm run build)
    else
        log_error "package.json 不存在，无法构建前端"
        exit 1
    fi
fi

# 构建命令
if [ "$PUSH" = true ]; then
    log_info "开始构建并推送镜像..."
    log_info "镜像: $FULL_IMAGE_TAG"
    log_info "平台: $PLATFORMS"
    log_info "上下文: $CONTEXT"
    log_info "构建目标: runtime (生产环境)"
    docker buildx build \
        --platform "$PLATFORMS" \
        --tag "$FULL_IMAGE_TAG" \
        --file "$CONTEXT/$DOCKERFILE" \
        --target runtime \
        --push \
        "$CONTEXT"
else
    log_info "开始构建镜像（仅加载到本地）..."
    log_info "镜像: $FULL_IMAGE_TAG"
    log_info "平台: $PLATFORMS"
    log_info "上下文: $CONTEXT"
    log_info "构建目标: runtime (生产环境)"
    docker buildx build \
        --platform "$PLATFORMS" \
        --tag "$FULL_IMAGE_TAG" \
        --file "$CONTEXT/$DOCKERFILE" \
        --target runtime \
        --load \
        "$CONTEXT"
fi

echo ""
echo -e "${GREEN}镜像信息:${NC}"
echo "  镜像: $FULL_IMAGE_TAG"
echo "  平台: $PLATFORMS"
echo ""
echo -e "${YELLOW}使用示例:${NC}"
echo "  # 本地运行"
echo "  docker run -p 3000:80 $FULL_IMAGE_TAG"
echo ""
echo "  # Docker Compose"
echo "  image: $FULL_IMAGE_TAG"
echo ""
