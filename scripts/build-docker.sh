#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILDER_NAME="aigc-builder"

PLATFORMS="linux/amd64"
REGISTRY=""
IMAGE_NAME="aigc-api"
IMAGE_TAG="latest"
BUILD_CONTEXT="./backend"
PUSH=false
DOCKERFILE="Dockerfile"

show_help() {
    cat << EOF
${BLUE}Aigc For Study - Docker Multi-Architecture Build Script${NC}

${GREEN}Usage:${NC}
    $0 [OPTIONS]

${GREEN}Options:${NC}
    --platforms PLATFORMS    Target platforms (default: linux/amd64,linux/arm64)
    --registry REGISTRY     Docker registry URL (e.g., registry.cn-hangzhou.aliyuncs.com)
    --name IMAGE_NAME       Image name (default: aigc-api)
    --tag IMAGE_TAG         Image tag (default: latest)
    --context CONTEXT       Build context path (default: ./backend)
    --dockerfile FILE       Dockerfile name (default: Dockerfile)
    --push                  Push image to registry after build
    --help                  Show this help message

${GREEN}Examples:${NC}
    # Build for local testing (amd64 only)
    $0 --platforms linux/amd64 --tag dev

    # Build multi-architecture for local
    $0 --tag latest

    # Build and push to Docker Hub
    $0 --registry docker.io --name username/aigc-api --tag v1.0.0 --push

    # Build and push to Aliyun
    $0 --registry registry.cn-hangzhou.aliyuncs.com --name namespace/aigc-api --tag v1.0.0 --push

${GREEN}Port Configuration:${NC}
    API Server: 38000
    Web Server: 3000
    PostgreSQL: 5432
    Redis: 6379

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

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    local docker_version=$(docker --version | grep -oP '\d+\.\d+' | head -1)
    if [ "${docker_version%%.*}" -lt 19 ]; then
        log_error "Docker version 19.03+ is required. Current version: $(docker --version)"
        exit 1
    fi

    log_info "Docker version: $(docker --version)"
}

check_docker_buildx() {
    if ! docker buildx version &> /dev/null; then
        log_info "Docker Buildx not available, attempting to enable..."
        export DOCKER_CLI_EXPERIMENTAL=enabled
        if ! docker buildx version &> /dev/null; then
            log_error "Docker Buildx is not available. Please install docker-buildx-plugin."
            exit 1
        fi
    fi
    log_info "Docker Buildx version: $(docker buildx version)"
}

setup_builder() {
    log_info "Setting up Docker Buildx builder..."

    if docker buildx inspect "$BUILDER_NAME" &> /dev/null; then
        log_info "Builder '$BUILDER_NAME' already exists, using it."
    else
        log_info "Creating new builder '$BUILDER_NAME'..."
        docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
    fi

    docker buildx use "$BUILDER_NAME"
    log_success "Builder '$BUILDER_NAME' is ready."
}

build_image() {
    local full_image_name

    if [ -n "$REGISTRY" ]; then
        full_image_name="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    else
        full_image_name="${IMAGE_NAME}:${IMAGE_TAG}"
    fi

    log_info "Building Docker image: ${full_image_name}"
    log_info "Platforms: ${PLATFORMS}"
    log_info "Build context: ${BUILD_CONTEXT}"

    local build_cmd="docker buildx build \
        --platform ${PLATFORMS} \
        --tag ${full_image_name} \
        --file ${BUILD_CONTEXT}/${DOCKERFILE} \
        ${BUILD_CONTEXT}"

    if [ "$PUSH" = true ]; then
        build_cmd="${build_cmd} --push"
        log_info "Image will be pushed to registry after build."
    else
        build_cmd="${build_cmd} --load"
    fi

    eval $build_cmd

    if [ $? -eq 0 ]; then
        log_success "Image built successfully: ${full_image_name}"

        if [ "$PUSH" = true ]; then
            log_success "Image pushed to registry: ${full_image_name}"
        fi
    else
        log_error "Image build failed!"
        exit 1
    fi
}

inspect_image() {
    local full_image_name

    if [ -n "$REGISTRY" ]; then
        full_image_name="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    else
        full_image_name="${IMAGE_NAME}:${IMAGE_TAG}"
    fi

    if docker buildx imagetools inspect "$full_image_name" &> /dev/null; then
        log_info "Image architectures:"
        docker buildx imagetools inspect "$full_image_name" | grep -A2 "Platform:"
    else
        log_warning "Could not inspect image. It may not be a multi-arch image or not yet created."
    fi
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
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
                IMAGE_TAG="$2"
                shift 2
                ;;
            --context)
                BUILD_CONTEXT="$2"
                shift 2
                ;;
            --dockerfile)
                DOCKERFILE="$2"
                shift 2
                ;;
            --push)
                PUSH=true
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
    echo -e "${BLUE}  Aigc For Study - Docker Build${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    parse_args "$@"

    cd "$PROJECT_ROOT"

    check_docker
    check_docker_buildx
    setup_builder
    build_image

    if [ "$PUSH" = false ]; then
        inspect_image
    fi

    echo ""
    log_success "Build process completed!"
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: docker run -p 38000:38000 ${IMAGE_NAME}:${IMAGE_TAG}"
    echo "  2. Push to registry: $0 --registry YOUR_REGISTRY --name YOUR_IMAGE --tag ${IMAGE_TAG} --push"
}

main "$@"
