# notify-tool

跨平台桌面通知工具，支持 Windows 和 macOS 系统通知。

## 安装

```bash
cd notify-tool
npm install
```

## 使用方法

### 命令行基本用法

```bash
# 基本通知
node src/index.js "标题" "内容"

# 带参数运行
node src/index.js -t "标题" -m "内容"                      # -t 指定标题，-m 指定消息内容
node src/index.js -i warn -t "标题" -m "内容"              # -i 指定图标类型 (info/warn/error/success)
node src/index.js -s false -t "标题" -m "内容"             # -s false 禁用声音
node src/index.js -a "AppID" -t "标题" -m "内容"           # -a 指定 appID (默认: notify-tool)
```

### 全局安装（可选）

```bash
npm link
```

之后可以直接使用 `notify` 命令：

```bash
notify "权限确认" "是否允许删除文件？"
notify -i warn "权限确认" "是否允许删除文件？"
```

## Claude Code Hook 集成示例

在 `~/.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "hooks": [
          {
            "async": true,
            "command": "\"/path/to/node\" \"/path/to/notify-tool/src/index.js\" -a \"Claude Code\" -t \"权限请求\" -m \"正在请求操作权限\"",
            "type": "command"
          }
        ]
      }
    ]
  }
}
```

Hook 支持的事件类型: `PermissionRequest`, `SessionEnd`, `Stop`, `SubagentStop`

事件图标映射:
- `PermissionRequest` → warn 图标
- `SessionEnd` → info 图标
- `Stop` → success 图标
- `SubagentStop` → success 图标

## 图标类型

| 类型 | 说明 |
|------|------|
| `info` | 信息（默认） |
| `warn` | 警告 |
| `error` | 错误 |
| `success` | 成功 |

## 跨平台支持

- **Windows**: 使用 Windows Toast 通知
- **macOS**: 使用 macOS Notification Center

## 项目结构

```
notify-tool/
├── src/
│   ├── index.js     # CLI 入口，解析命令行参数，处理 stdin (Claude Code hook 元数据)
│   ├── notifier.js  # 核心通知逻辑，封装 node-notifier
│   └── config.js    # 配置文件（通知默认配置）
├── package.json
└── README.md
```

### 模块职责

- **index.js**: 命令行参数解析 (`parseArgs`)、stdin JSON 读取 (Claude Code hook)、选项处理
- **notifier.js**: 通知发送 (`sendNotification`/`notifySync`)、图标路径映射
- **config.js**: 通知默认配置 (`defaultIcon`, `defaultSound`)
