# 统一运维平台开发任务清单

**版本:** v2.0
**制定日期:** 2026-05-09
**目标:** 构建具有苹果风格的统一运维平台，整合监控、告警、日志功能

---

## 阶段一：项目初始化

### Task 1: 创建前端项目结构

- [x] **Task 1.1:** 初始化 React + TypeScript 项目
- [x] **Task 1.2:** 配置 Tailwind CSS 主题
- [x] **Task 1.3:** 配置路径别名 (@/)
- [x] **Task 1.4:** 配置 ESLint + Prettier
- [x] **Task 1.5:** 创建目录结构 (components, pages, hooks, stores, api, tokens)

### Task 2: 设计系统配置

- [x] **Task 2.1:** 创建颜色系统 tokens
- [x] **Task 2.2:** 创建字体系统 tokens
- [x] **Task 2.3:** 创建间距系统 tokens
- [x] **Task 2.4:** 创建圆角系统 tokens
- [x] **Task 2.5:** 创建动画系统 tokens

### Task 3: 基础组件开发

- [x] **Task 3.1:** Button 组件
- [x] **Task 3.2:** Input 组件
- [x] **Task 3.3:** Select 组件
- [x] **Task 3.4:** Card 组件
- [x] **Task 3.5:** Modal 组件
- [x] **Task 3.6:** Badge 组件
- [x] **Task 3.7:** Tooltip 组件

---

## 阶段二：布局框架

### Task 4: 整体布局组件

- [x] **Task 4.1:** AppLayout 主布局框架
- [x] **Task 4.2:** Sidebar 侧边栏组件
- [x] **Task 4.3:** Header 顶部栏组件
- [x] **Task 4.4:** Navigation 导航组件

### Task 5: 路由配置

- [x] **Task 5.1:** 配置 React Router
- [x] **Task 5.2:** 创建路由表
- [x] **Task 5.3:** 路由守卫 (可选)

---

## 阶段三：后端 API

### Task 6: FastAPI 后端搭建

- [x] **Task 6.1:** 创建 FastAPI 项目结构
- [x] **Task 6.2:** 配置 CORS 跨域
- [x] **Task 6.3:** 集成 Prometheus 客户端
- [x] **Task 6.4:** 集成 Loki 客户端
- [x] **Task 6.5:** 创建数据库模型

### Task 7: API 端点开发

- [x] **Task 7.1:** 指标查询 API (`/api/v1/metrics/*`)
- [x] **Task 7.2:** 告警管理 API (`/api/v1/alerts/*`)
- [x] **Task 7.3:** 日志查询 API (`/api/v1/logs/*`)
- [x] **Task 7.4:** 服务管理 API (`/api/v1/services/*`)
- [x] **Task 7.5:** 仪表盘数据 API (`/api/v1/dashboard/*`)

---

## 阶段四：核心页面开发

### Task 8: 仪表盘概览页 (Dashboard)

- [x] **Task 8.1:** 系统状态卡片
- [x] **Task 8.2:** 关键指标网格
- [x] **Task 8.3:** 活跃告警列表
- [x] **Task 8.4:** 最近日志列表
- [x] **Task 8.5:** 快速操作入口

### Task 9: 监控详情页 (Monitor)

- [x] **Task 9.1:** 时间序列图表组件
- [x] **Task 9.2:** 指标选择器
- [x] **Task 9.3:** 百分位数展示
- [x] **Task 9.4:** 数据表格
- [x] **Task 9.5:** 时间范围选择器

### Task 10: 告警中心页 (Alerts)

- [x] **Task 10.1:** 告警列表组件
- [x] **Task 10.2:** 筛选器组件
- [x] **Task 10.3:** 告警详情面板
- [x] **Task 10.4:** 告警处理功能
- [x] **Task 10.5:** 告警统计图表

### Task 11: 日志查询页 (Logs)

- [x] **Task 11.1:** 查询构建器
- [x] **Task 11.2:** 日志列表组件
- [x] **Task 11.3:** 日志详情弹窗
- [x] **Task 11.4:** 日志统计
- [x] **Task 11.5:** 关键词高亮

### Task 12: 服务管理页 (Services)

- [x] **Task 12.1:** 服务卡片网格
- [x] **Task 12.2:** 服务详情面板
- [x] **Task 12.3:** 资源使用图表
- [x] **Task 12.4:** 操作按钮组

---

## 阶段五：图表组件

### Task 13: 图表组件库

- [x] **Task 13.1:** TimeSeriesChart 时序图
- [x] **Task 13.2:** BarChart 柱状图
- [x] **Task 13.3:** PieChart 饼图
- [x] **Task 13.4:** GaugeChart 仪表图
- [x] **Task 13.5:** 图表通用包装器

---

## 阶段六：数据集成

### Task 14: API 集成

- [x] **Task 14.1:** API 客户端封装
- [x] **Task 14.2:** 错误处理
- [x] **Task 14.3:** 请求缓存
- [x] **Task 14.4:** 数据转换层

### Task 15: 状态管理

- [x] **Task 15.1:** Zustand store 配置
- [x] **Task 15.2:** 指标数据 store
- [x] **Task 15.3:** 告警数据 store
- [x] **Task 15.4:** 日志数据 store
- [x] **Task 15.5:** 服务数据 store

---

## 阶段七：交互优化

### Task 16: 动画与过渡

- [x] **Task 16.1:** Framer Motion 配置
- [x] **Task 16.2:** 页面过渡动画
- [x] **Task 16.3:** 组件入场动画
- [x] **Task 16.4:** 悬停效果

### Task 17: 加载与反馈

- [x] **Task 17.1:** Skeleton 骨架屏
- [x] **Task 17.2:** Loading 组件
- [x] **Task 17.3:** Toast 提示
- [x] **Task 17.4:** 空状态组件

---

## 阶段八：Docker 部署

### Task 18: 容器化配置

- [x] **Task 18.1:** 创建 Dockerfile
- [x] **Task 18.2:** 创建 docker-compose.yml
- [x] **Task 18.3:** 配置 Nginx
- [x] **Task 18.4:** 环境变量配置

---

## 任务完成状态

✅ **所有任务已完成** - 2026-05-09

---

## 项目结构概览

```
ops-platform/
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # UI 组件库 (Button, Card, Modal...)
│   │   │   ├── layout/       # 布局组件 (Sidebar, Header, MainLayout)
│   │   │   └── charts/       # 图表组件 (TimeSeries, Bar, Pie, Gauge)
│   │   ├── pages/            # 页面 (Dashboard, Monitor, Alerts, Logs, Services)
│   │   ├── api/              # API 客户端
│   │   ├── stores/           # Zustand 状态管理
│   │   └── tokens/           # 设计系统 tokens
│   └── Dockerfile
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/          # API 端点
│   │   └── core/            # Prometheus, Loki 客户端
│   └── Dockerfile
├── docker-compose.yml         # 完整部署配置
├── nginx.conf                  # Nginx 配置
└── README.md                  # 使用文档
```

---

## 技术栈总结

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Recharts + Zustand
- **后端**: FastAPI + Python + Prometheus Client + Loki Client
- **数据库**: PostgreSQL + Redis
- **监控**: Prometheus + Grafana + Loki + Alertmanager
- **设计**: 苹果风格 Dark Mode
