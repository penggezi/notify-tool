/**
 * 跨平台通知逻辑封装
 * 支持 Windows 和 macOS 系统通知
 */

const notifier = require('node-notifier');
const path = require('path');

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

  const notifierOptions = {
    title: title,
    message: message,
    sound: sound,
    wait: false
  };

  if (isWindows) {
    // Windows 平台配置
    notifierOptions.appID = appId;
    notifierOptions.icon = getWindowsIcon(icon);
  } else if (isMac) {
    // macOS 平台配置
    notifierOptions.appID = appId;
    notifierOptions.icon = getMacIcon(icon);
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
  // 使用 assets 目录中的默认图标
  return path.join(__dirname, 'assets', icon.windows);
}

/**
 * 获取 macOS 图标名称
 */
function getMacIcon(iconType) {
  const icon = ICON_MAP[iconType] || ICON_MAP.info;
  return path.join(__dirname, 'assets', icon.mac);
}

/**
 * 发送通知（同步版本，不返回 Promise）
 * 用于 CLI 调用
 */
async function notifySync(title, message, options = {}) {
  const { icon = 'info', sound = true, appId = 'notify-tool' } = options;

  const notifierOptions = {
    title: title,
    message: message,
    sound: sound,
    wait: false
  };

  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWindows) {
    notifierOptions.appID = appId;
    notifierOptions.icon = getWindowsIcon(icon);
  } else if (isMac) {
    notifierOptions.icon = getMacIcon(icon);
  }

  notifier.notify(notifierOptions);
}

module.exports = {
  sendNotification,
  notifySync
};
