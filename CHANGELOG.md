# Changelog

所有重要的项目变更都会记录在此文件中。

## [1.0.0] - 2026-04-16

### 新增

- macOS 系统通知使用 AppleScript `display notification` 实现，更可靠
- macOS 标题添加 emoji 图标前缀（ℹ️/⚠️/❌/✅），使通知类型更直观
- Windows 系统标题不加 emoji，保持简洁

### 优化

- 优化图标加载逻辑，图标变为可选
- 通知错误处理更加健壮

### 修复

- 修复 macOS 通知可能失败的问题

## [0.1.0] - 2026-04-16

### 新增

- 初始版本发布
- 支持 Windows 和 macOS 桌面通知
- 支持命令行参数配置（标题、消息、图标类型、声音等）
- 支持 Claude Code Hook 集成
- 支持 `PermissionRequest`、`SessionEnd`、`Stop`、`SubagentStop` 事件类型
