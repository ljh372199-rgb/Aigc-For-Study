# 统一运维平台实施任务

## 项目背景
构建统一的苹果风格运维平台，整合监控、告警、日志功能于单一界面。

---

## 任务列表

### 阶段一: 项目初始化

- [ ] **1.1 创建统一运维平台目录结构**
  - 创建 `ops-hub/` 目录
  - 初始化前端项目 (React + TypeScript + Vite)
  - 初始化后端项目 (FastAPI)

- [ ] **1.2 配置 Apple 设计系统**
  - 安装配置 Tailwind CSS
  - 创建 Apple 风格 CSS 变量
  - 配置深色/浅色主题
  - 设置字体栈 (SF Pro)

- [ ] **1.3 创建基础组件库**
  - Card 组件 (default/elevated/glass 变体)
  - Button 组件 (primary/secondary/ghost)
  - Badge/Tag 组件
  - StatusIndicator 组件
  - Skeleton 加载组件
  - Toast 通知组件

### 阶段二: 布局与导航

- [ ] **2.1 实现全局布局组件**
  - 顶部导航栏 (Logo + 标题 + 操作按钮)
  - 侧边栏导航 (Dashboard/Monitoring/Alerts/Logs)
  - 内容区域容器
  - 响应式布局适配

- [ ] **2.2 实现路由与状态管理**
  - React Router 路由配置
  - Zustand 状态管理配置
  - 全局 Loading 状态管理
  - 主题切换状态

### 阶段三: 后端 API 开发

- [ ] **3.1 Prometheus 数据代理 API**
  - 实现 `/api/v1/metrics/query` 端点
  - 实现 `/api/v1/metrics/series` 端点
  - 实现指标数据格式化处理

- [ ] **3.2 Loki 日志查询 API**
  - 实现 `/api/v1/logs/query` 端点
  - 实现 `/api/v1/logs/labels` 端点
  - 实现 WebSocket 实时日志流

- [ ] **3.3 Alertmanager 告警 API**
  - 实现 `/api/v1/alerts` 获取告警列表
  - 实现 `/api/v1/alerts/silence` 静默告警
  - 实现 `/api/v1/alerts/status` 告警状态

### 阶段四: 前端功能页面

- [ ] **4.1 概览仪表盘 (Dashboard) 页面**
  - 系统健康状态卡片组件
  - 核心指标卡片 (QPS/延迟/错误率)
  - 服务状态列表组件
  - 告警摘要组件
  - 最近事件时间线组件
  - 指标趋势图表

- [ ] **4.2 监控中心 (Monitoring) 页面**
  - 指标选择器组件
  - 时间范围选择器组件
  - 折线图组件 (Recharts)
  - 柱状图组件
  - 数据表格组件
  - 指标详情面板

- [ ] **4.3 告警中心 (Alerts) 页面**
  - 告警统计卡片 (Critical/High/Medium/Low)
  - 告警列表组件 (支持筛选)
  - 告警详情抽屉组件
  - 告警操作按钮 (确认/静默/解决)
  - 告警历史组件

- [ ] **4.4 日志中心 (Logs) 页面**
  - 日志搜索输入组件
  - 日志过滤器组件
  - 日志量趋势图表
  - 实时日志列表组件
  - 日志详情展开组件
  - 日志下载功能

### 阶段五: 交互与动效

- [ ] **5.1 实现页面过渡动画**
  - Tab 切换动画
  - 路由过渡效果
  - 卡片进入动画

- [ ] **5.2 实现组件交互动效**
  - 按钮点击反馈
  - 卡片悬停效果
  - 状态变化动画
  - 加载状态动画

- [ ] **5.3 实现 Toast 通知系统**
  - 成功/警告/错误通知样式
  - 自动消失机制
  - 手动关闭功能

### 阶段六: 集成与部署

- [ ] **6.1 Docker 编排配置**
  - 前端 Dockerfile
  - 后端 Dockerfile
  - docker-compose.yml 统一编排
  - 环境变量配置

- [ ] **6.2 本地开发环境**
  - 前端开发服务器配置
  - 后端热重载配置
  - 代理配置 (开发环境)

- [ ] **6.3 验证与测试**
  - API 接口测试
  - 页面功能测试
  - 响应式测试
  - 性能测试

---

## 任务依赖关系

```
阶段一 (1.1-1.3)
    ↓
阶段二 (2.1-2.2) ← 依赖阶段一
    ↓
阶段三 (3.1-3.3) ← 可与阶段二并行
    ↓
阶段四 (4.1-4.4) ← 依赖阶段二和阶段三
    ↓
阶段五 (5.1-5.3) ← 依赖阶段四
    ↓
阶段六 (6.1-6.3) ← 依赖所有阶段
```

---

## 技术栈清单

| 类别 | 技术 | 备注 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 组件化开发 |
| 构建工具 | Vite | 快速开发体验 |
| UI 样式 | Tailwind CSS | 原子化 CSS |
| 状态管理 | Zustand | 轻量级 |
| 路由 | React Router v6 | SPA 路由 |
| 图表 | Recharts | React 原生 |
| HTTP | Axios | API 调用 |
| 后端框架 | FastAPI | Python 高性能 |
| 实时通信 | WebSocket | 实时日志 |
| 容器化 | Docker Compose | 部署 |

---

## 关键文件清单

```
ops-hub/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Card/
│   │   │   ├── Button/
│   │   │   ├── StatusBadge/
│   │   │   ├── Chart/
│   │   │   └── Toast/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Monitoring/
│   │   │   ├── Alerts/
│   │   │   └── Logs/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── prometheus.ts
│   │   │   ├── loki.ts
│   │   │   └── alertmanager.ts
│   │   ├── stores/
│   │   └── styles/
│   │       └── apple-theme.css
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routers/
│   │   │   ├── metrics.py
│   │   │   ├── logs.py
│   │   │   └── alerts.py
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
│
└── docker-compose.yml
```

---

## 验收检查点

- [ ] 项目结构符合规范
- [ ] Apple 设计风格统一
- [ ] 所有 API 端点可用
- [ ] 四个主要页面完整
- [ ] 动画流畅无卡顿
- [ ] 响应式布局正常
- [ ] Docker 容器正常运行
