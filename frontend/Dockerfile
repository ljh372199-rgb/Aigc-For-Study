# ===============================================
# Aigc For Study - Frontend Dockerfile
# 多阶段构建，支持 amd64/arm64 双架构
# 容器端口: 80
# ===============================================

# ===============================================
# Stage 1: Builder - 构建阶段
# ===============================================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置npm源（可选，国内加速）
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 设置环境变量（构建时注入）
ARG VITE_API_BASE_URL=http://localhost:38000/api/v1
ARG VITE_APP_NAME=Aigc\ For\ Study
ARG VITE_APP_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_ENV=$VITE_APP_ENV

# 构建生产版本
RUN npm run build

# ===============================================
# Stage 2: Runtime - 运行阶段
# ===============================================
FROM nginx:alpine AS runtime

# 安装必要的工具
RUN apk add --no-cache \
    tzdata \
    wget \
    ca-certificates

# 设置时区
ENV TZ=Asia/Shanghai

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从builder阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制健康检查脚本
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# 暴露端口（nginx默认80）
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]

# ===============================================
# Stage 3: Dev - 开发阶段（可选）
# ===============================================
FROM builder AS dev

# 安装开发依赖
RUN npm install

# 暴露Vite默认端口
EXPOSE 5173

# 启动开发服务器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
