# Prometheus 告警规则

本目录包含 Aigc For Study AI 学习平台的 Prometheus 告警规则配置。

## 告警文件列表

- **api_alerts.yml**: API 服务相关告警规则
- **system_alerts.yml**: 系统资源相关告警规则
- **container_alerts.yml**: 容器资源相关告警规则

## 告警严重等级

| 优先级 | 严重等级 | 说明 | 响应时间 |
|--------|----------|------|----------|
| P0 | Critical (严重) | 服务宕机、致命错误 | 立即响应 (5分钟内) |
| P1 | High (高) | 重要指标异常、性能下降 | 15分钟内响应 |
| P2 | Medium (中) | 资源使用较高、需要关注 | 1小时内响应 |
| P3 | Low (低) | 轻微异常、预警 | 工作时间内响应 |

## 告警标签

每个告警包含以下标签：

- **severity**: 严重等级 (critical/high/medium/low)
- **priority**: 优先级 (P0/P1/P2/P3)
- **team**: 负责团队 (backend/ops)

## 响应时间预期

### P0 - Critical (严重)

- **响应时间**: 5 分钟内
- **处理方式**: 立即通知 on-call 工程师，启动故障恢复流程
- **升级路径**: 15 分钟内未解决，升级至技术负责人

### P1 - High (高)

- **响应时间**: 15 分钟内
- **处理方式**: 尽快排查问题，必要时联系相关团队
- **升级路径**: 1 小时内未解决，升级至团队负责人

### P2 - Medium (中)

- **响应时间**: 1 小时内
- **处理方式**: 安排时间处理，持续监控
- **升级路径**: 4 小时内未解决，升级至 P1 处理

### P3 - Low (低)

- **响应时间**: 工作时间内
- **处理方式**: 记录问题，安排计划处理
- **升级路径**: 2 天内未解决，升级至 P2 处理

## 测试告警

### 1. 使用 Prometheus 表达式浏览器测试

在 Prometheus Web UI (http://localhost:9090) 中执行以下步骤：

1. 进入 "Graph" 页面
2. 输入告警的 PromQL 表达式
3. 点击 "Execute" 查看返回结果
4. 验证表达式返回的数据是否符合预期

示例测试命令：

```promql
# 测试 API 服务宕机告警
up{job="api"} == 0

# 测试 CPU 使用率告警
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80

# 测试容器 CPU 使用率告警
sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name)
```

### 2. 使用 promtool 验证告警规则

```bash
# 进入 Prometheus 容器
docker exec -it prometheus sh

# 验证告警规则语法
promtool check rules /etc/prometheus/alert_rules/*.yml

# 验证配置文件语法
promtool check config /etc/prometheus/prometheus.yml
```

### 3. 本地测试告警触发

```bash
# 模拟 CPU 使用率过高
# 在容器中运行 CPU 密集型任务

# 模拟高延迟
# 使用 ab 或 wrk 对 API 施加压力测试
```

### 4. 检查告警状态

在 Prometheus Web UI 中：

1. 进入 "Alerts" 页面查看所有告警状态
2. 查看 "Health" 页面确认告警规则加载成功
3. 使用 `ALERTS` 或 `ALERTS_BY_STATE` 指标查询告警状态

## 静默告警

### 通过 Alertmanager 静默

#### 1. 使用 amtool 命令行工具

```bash
# 进入 Alertmanager 容器
docker exec -it alertmanager amtool

# 创建静默规则
amtool silence add --alertmanager.url=http://localhost:9093 \
  --duration=4h \
  --reason="计划内维护" \
  alertname=HighCPUUsage

# 查看当前静默规则
amtool silence query --alertmanager.url=http://localhost:9093

# 删除静默规则
amtool silence expire <silence_id>
```

#### 2. 通过 Web UI 创建静默

1. 访问 Alertmanager Web UI (http://localhost:9093)
2. 点击 "Silences"
3. 点击 "New Silence"
4. 填写静默配置：
   - Matcher: 匹配要静默的告警 (如 `alertname="HighCPUUsage"`)
   - Duration: 静默时长
   - Author: 创建者
   - Comment: 静默原因
5. 点击 "Create"

#### 3. 通过配置文件静默

在 Alertmanager 配置中添加路由匹配规则：

```yaml
route:
  routes:
    - match:
        team: ops
      receiver: ops-pagerduty
      continue: true
    - match:
        severity: medium
      receiver: ops-email
```

### 静默最佳实践

1. **记录静默原因**: 始终记录静默的原因和持续时间
2. **设置过期时间**: 避免忘记取消静默导致漏报
3. **最小化范围**: 尽量只静默特定告警，避免过度静默
4. **通知相关人员**: 静默重要告警前通知相关团队
5. **定期审查**: 定期检查和清理过期的静默规则

### 使用标签静默

在特定环境中静默告警：

```yaml
# 在匹配条件中添加环境标签
- alert: HighCPUUsage
  expr: ...
  labels:
    severity: high
  annotations:
    summary: "..."
  # 在 Alertmanager 中配置
  # match:
  #   severity: high
  #   environment: production
```

## 告警处理流程

1. **接收告警**: 通过邮件、Slack、PagerDuty 等渠道接收告警通知
2. **评估严重性**: 根据告警优先级和影响范围评估响应级别
3. **排查问题**: 使用监控数据、日志、追踪系统定位问题根因
4. **采取行动**: 根据告警建议和实际场景采取修复措施
5. **记录事件**: 在事件管理系统中记录问题和解决方案
6. **后续跟进**: 分析问题根因，制定预防措施

## 告警优化建议

- 定期审查告警规则，删除误报和无效告警
- 根据业务特点调整告警阈值
- 建立告警分类和升级机制
- 实施告警聚合减少噪音
- 建立告警响应 SOP

## 相关资源

- [Prometheus 告警文档](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Alertmanager 配置文档](https://prometheus.io/docs/alerting/latest/configuration/)
- [PromQL 常用函数](https://prometheus.io/docs/prometheus/latest/querying/functions/)
