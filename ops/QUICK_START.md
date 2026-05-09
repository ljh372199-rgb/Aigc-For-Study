# Aigc For Study 监控平台 - 快速启动指南

**版本:** v1.0  
**创建日期:** 2026-05-09

---

## 📋 当前状态

### ✅ 已完成
- 监控平台代码和配置文件已创建
- 应用服务（API、Web、DB、Redis）已在运行
- Prometheus 和 Grafana 容器正在下载中

### ⚠️ 待解决
- 后端 API 服务缺少 prometheus-client 依赖
- 部分监控镜像下载较慢

---

## 🚀 快速启动步骤

### 步骤 1: 等待监控服务启动完成

镜像下载完成后，运行以下命令查看状态：

```bash
# 查看所有容器状态
docker ps -a

# 查看监控容器
docker ps -a | grep -E "prometheus|grafana|alertmanager"
```

### 步骤 2: 验证服务

```bash
# 验证 Prometheus
curl http://localhost:29090/-/healthy

# 验证 Grafana
curl http://localhost:23000/api/health

# 验证 Alertmanager
curl http://localhost:29093/-/healthy
```

### 步骤 3: 访问 Grafana

打开浏览器访问: http://localhost:23000

- **用户名:** admin
- **密码:** admin123

### 步骤 4: 查看仪表盘

在 Grafana 中：
1. 点击左侧菜单 "Dashboards"
2. 选择 "Browse"
3. 查看已导入的仪表盘：
   - AIGC Study 系统概览
   - AIGC Study API 性能
   - AIGC Study 系统指标

---

## 🔧 手动修复 (可选)

### 修复 API 服务的 Metrics 端点

如果 API 服务无法访问 `/metrics` 端点，需要重新构建：

```bash
# 方法 1: 重新构建 API 容器
cd /path/to/Aigc-For-Study
docker-compose -f docker-compose.staging.yml build api
docker-compose -f docker-compose.staging.yml up -d api

# 方法 2: 在容器内安装依赖 (临时方案)
docker exec aigc-api pip install prometheus-client
docker restart aigc-api
```

---

## 📊 监控配置说明

### Prometheus 配置

配置文件位于: `ops/prometheus/prometheus.yml`

**监控目标:**
- `api:8000/metrics` - API 应用指标
- `node-exporter:9100` - 系统指标 (待部署)
- `cadvisor:8080` - 容器指标 (待部署)

### 告警规则

告警规则位于: `ops/prometheus/alert_rules/`

- `api_alerts.yml` - API 告警 (7个规则)
- `system_alerts.yml` - 系统告警 (5个规则)
- `container_alerts.yml` - 容器告警 (4个规则)

### Grafana 仪表盘

位于: `ops/grafana/dashboards/`

| 仪表盘 | UID | 说明 |
|--------|-----|------|
| overview.json | aigc-overview | 系统概览 |
| api-performance.json | aigc-api-performance | API 性能 |
| system-metrics.json | aigc-system-metrics | 系统指标 |
| container-monitoring.json | aigc-container-monitoring | 容器监控 |

---

## 🐛 故障排查

### 问题 1: Grafana 无法连接到 Prometheus

检查 Prometheus 是否正常运行：
```bash
docker logs aigc-prometheus
```

检查网络连接：
```bash
docker network inspect aigc-network
```

### 问题 2: Prometheus 无法采集 API 指标

检查 API 服务是否在运行：
```bash
curl http://localhost:38000/health
```

检查 API 是否支持 metrics：
```bash
curl http://localhost:38000/metrics
```

如果返回 404，需要重新构建后端容器：
```bash
docker-compose -f docker-compose.staging.yml build api
docker-compose -f docker-compose.staging.yml up -d api
```

### 问题 3: 镜像下载失败

如果镜像下载失败，可以使用国内镜像源：

```bash
# 配置 Docker 镜像加速器
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}

# 重启 Docker
sudo systemctl restart docker

# 重新拉取镜像
docker-compose -f ops/docker-compose.core.yml pull
```

---

## 📝 常用命令

### 启动/停止监控服务
```bash
# 启动
cd ops
docker-compose -f docker-compose.core.yml up -d

# 停止
docker-compose -f docker-compose.core.yml down

# 重启
docker-compose -f docker-compose.core.yml restart
```

### 查看日志
```bash
# Prometheus 日志
docker logs -f aigc-prometheus

# Grafana 日志
docker logs -f aigc-grafana

# 所有监控服务日志
docker-compose -f docker-compose.core.yml logs -f
```

### 验证配置
```bash
# 验证 Prometheus 配置
docker exec aigc-prometheus promtool check config /etc/prometheus/prometheus.yml

# 验证告警规则
docker exec aigc-prometheus promtool check rules /etc/prometheus/alert_rules/*.yml

# 查看采集目标
curl http://localhost:29090/api/v1/targets
```

---

## 🔗 访问地址汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| Grafana | http://localhost:23000 | 监控可视化 (admin/admin123) |
| Prometheus | http://localhost:29090 | 指标采集和查询 |
| Alertmanager | http://localhost:29093 | 告警管理 |
| API 服务 | http://localhost:38000 | 后端 API |
| API Metrics | http://localhost:38000/metrics | Prometheus 指标 |
| Web 服务 | http://localhost:38010 | 前端应用 |

---

## 📚 相关文档

- [运维平台使用手册](../docs/运维平台使用手册.md)
- [监控指标说明文档](../docs/监控指标说明文档.md)
- [故障排查指南](../docs/故障排查指南.md)

---

**更新时间:** 2026-05-09
**维护团队:** AIGC Ops Team
