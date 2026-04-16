/**
 * 跨平台通知逻辑封装
 * 支持 Windows 和 macOS 系统通知
 */

const notifier = require('node-notifier');
const path = require('path');
const { exec } = require('child_process');

const defaultIcon = 'claude-color.png';

// 图标映射
const ICON_MAP = {
  info: {
    windows: defaultIcon,
    mac: defaultIcon
  },
  warn: {
    windows: defaultIcon,
    mac: defaultIcon
  },
  error: {
    windows: defaultIcon,
    mac: defaultIcon
  },
  success: {
    windows: defaultIcon,
    mac: defaultIcon
  }
};

/**
 * 使用 AppleScript 发送 macOS 通知（最可靠的方式）
 */
function sendMacNotification(title, message, options = {}) {
  const { sound = true } = options;

  // 转义引号，防止 AppleScript 注入
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedMessage = message.replace(/"/g, '\\"');

  let script = `display notification "${escapedMessage}" with title "${escapedTitle}"`;
  if (sound) {
    script += ' sound name "Ping"';
  }

  return new Promise((resolve, reject) => {
    exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 发送系统通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {object} options - 选项
 * @param {string} options.icon - 图标类型 (info/warn/error/success)
 * @param {string} options.sound - 声音 (true/false)
 */
async function sendNotification(title, message, options = {}) {
  const { icon = 'info', sound = true, appId = 'notify-tool' } = options;

  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isMac) {
    // macOS: 使用 AppleScript（最可靠）
    return sendMacNotification(title, message, { sound });
  }

  // Windows 或其他平台使用 node-notifier
  const notifierOptions = {
    title: title,
    message: message,
    sound: sound,
    wait: false
  };

  if (isWindows) {
    notifierOptions.appID = appId;
    try {
      notifierOptions.icon = getWindowsIcon(icon);
    } catch (e) {
      // 图标可选
    }
  }

  return new Promise((resolve, reject) => {
    notifier.notify(notifierOptions, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * 获取 Windows 图标路径
 */
function getWindowsIcon(iconType) {
  const icon = ICON_MAP[iconType] || ICON_MAP.info;
  return path.join(__dirname, 'assets', icon.windows);
}

/**
 * 发送通知（同步版本，不返回 Promise）
 * 用于 CLI 调用
 */
function notifySync(title, message, options = {}) {
  const { icon = 'info', sound = true, appId = 'notify-tool' } = options;

  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isMac) {
    // macOS: 使用 AppleScript（最可靠）
    // 转义引号
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedMessage = message.replace(/"/g, '\\"');

    let script = `display notification "${escapedMessage}" with title "${escapedTitle}"`;
    if (sound) {
      script += ' sound name "Ping"';
    }

    exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        console.error('Notification error:', error);
      }
    });
    return;
  }

  // Windows 或其他平台使用 node-notifier
  const notifierOptions = {
    title: title,
    message: message,
    sound: sound
  };

  if (isWindows) {
    notifierOptions.appID = appId;
    try {
      notifierOptions.icon = getWindowsIcon(icon);
    } catch (e) {
      // 图标可选
    }
  }

  try {
    notifier.notify(notifierOptions, (err) => {
      if (err) {
        console.error('Notification error:', err);
      }
    });
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
}

module.exports = {
  sendNotification,
  notifySync
};
