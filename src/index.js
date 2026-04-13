#!/usr/bin/env node

/**
 * notify-tool - 跨平台桌面通知工具
 *
 * 用法:
 *   notify "标题" "内容"              # 基本通知
 *   notify -t "标题" "内容"          # 使用 -t 指定标题
 *   notify -m "内容" "标题"          # 使用 -m 指定消息内容
 *   notify -i warn "标题" "内容"     # 使用 -i 指定图标类型 (info/warn/error/success)
 *   notify -s false "标题" "内容"    # 使用 -s 禁用声音
 *
 * Claude Code hooks 调用时会通过 stdin 传递 JSON 元数据
 */

const { sendNotification, notifySync } = require('./notifier');
const fs = require('fs');

// 简单的命令行参数解析
function parseArgs(args) {
  const result = {
    title: '通知',
    message: '',
    icon: 'info',
    sound: true,
    appId: 'notify-tool'
  };

  // 先收集位置参数（非flag的参数）
  const positional = [];
  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '-t' || arg === '--title') {
      result.title = args[++i];
      i++;
    } else if (arg === '-a' || arg === '--app-id') {
      result.appId = args[++i];
      i++;
    } else if (arg === '-m' || arg === '--message') {
      result.message = args[++i];
      i++;
    } else if (arg === '-i' || arg === '--icon') {
      result.icon = args[++i] || 'info';
      i++;
    } else if (arg === '-s' || arg === '--sound') {
      result.sound = args[++i] !== 'false';
      i++;
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      positional.push(arg);
      i++;
    }
  }

  // 根据位置参数数量设置 title 和 message
  if (positional.length >= 2) {
    result.title = positional[0];
    result.message = positional[1];
  } else if (positional.length === 1) {
    // 只有一个位置参数时，如果 title 已被 -t 设置，则作为 message
    // 否则作为 title
    result.message = positional[0];
  }

  return result;
}

function printHelp() {
  console.log(`
notify-tool - 跨平台桌面通知工具

用法:
  notify "标题" "内容"              # 基本通知
  notify -t "标题" "内容"           # 使用 -t 指定标题
  notify -m "内容" "标题"           # 使用 -m 指定消息内容
  notify -i warn "标题" "内容"      # 使用 -i 指定图标类型
  notify -s false "标题" "内容"     # 使用 -s 禁用声音
  notify -a "AppID" "标题" "内容"   # 使用 -a 指定 appID

图标类型:
  info    - 信息 (默认)
  warn    - 警告
  error   - 错误
  success - 成功

示例:
  notify "权限确认" "是否允许删除文件？"
  notify -i warn "权限确认" "是否允许删除文件？"
  notify -t "任务完成" "代码构建成功"
`);
}

// 从 stdin 读取 Claude Code hook 的 JSON 元数据
function readStdinJson() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      if (data) {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(null);
      }
    });
    process.stdin.on('error', reject);
  });
}

// 主入口
async function main() {
  const args = process.argv.slice(2);

  // 检查是否有 stdin 数据（Claude Code hook 会传递 JSON）
  let hookMeta = null;
  if (!process.stdin.isTTY) {
    try {
      hookMeta = await readStdinJson();
    } catch (e) {
      // stdin 不是 JSON，忽略
    }
  }

  if (args.length === 0 && !hookMeta) {
    printHelp();
    return;
  }

  // 如果有 hook 元数据，尝试从中获取信息
  let options;
  if (hookMeta && args.length === 0) {
    // 只有 stdin 数据，没有命令行参数
    const eventName = hookMeta.hook_event_name || 'Hook 事件';
    const iconMap = {
      'PermissionRequest': 'warn',
      'SessionEnd': 'info',
      'Stop': 'success',
      'SubagentStop': 'success'
    };
    const messageMap = {
      'PermissionRequest': '权限确认请求',
      'SessionEnd': '会话已结束',
      'Stop': '任务已完成',
      'SubagentStop': '子任务已完成'
    };
    options = {
      title: eventName,
      message: messageMap[eventName] || hookMeta.last_assistant_message?.substring(0, 100) || '事件已触发',
      icon: iconMap[eventName] || 'info',
      sound: true
    };
  } else {
    options = parseArgs(args);
  }

  try {
    if (!options.message) {
      console.error('错误: 请提供通知内容');
      console.error('用法: notify "标题" "内容"');
      process.exit(1);
    }

    notifySync(options.title, options.message, {
      icon: options.icon,
      sound: options.sound,
      appId: options.appId
    });

    console.log('通知已发送:', options.title, '-', options.message);
  } catch (error) {
    console.error('发送通知失败:', error.message);
    process.exit(1);
  }
}

main();
