#!/bin/sh
# 健康检查脚本
# 用于Docker HEALTHCHECK

# 检查nginx进程是否运行
if ! pgrep -x nginx > /dev/null; then
    echo "nginx is not running"
    exit 1
fi

# 检查nginx是否能响应请求
if wget --quiet --tries=1 --spider http://localhost/ > /dev/null 2>&1; then
    exit 0
else
    echo "nginx is not responding"
    exit 1
fi
