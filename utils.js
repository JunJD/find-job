/**
 * 工具函数
 */
const fs = require("fs");

// 模拟等待
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 读取简历信息
const getResumeInfo = () => {
  fs.readFile("./简历基本信息.txt", "utf8", (err, data) => {
    if (err) {
      console.error("读取文件时出错:", err);
      return;
    }

    // 输出文件内容
    return data;
  });
};

async function fixChrome(options) {
  options.excludeSwitches(["enable-automation"]);
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments(
    "--disable-blink-features=AutomationControlled", // 禁用自动化检测特征
    "--disable-infobars",                            // 禁用信息栏
    "--disable-dev-shm-usage",                       // 禁用/dev/shm使用
    "--no-sandbox",                                  // 禁用沙盒模式
    "--disable-gpu",                                 // 禁用GPU加速
    "--window-size=1920,1080",                       // 设置窗口大小
    "--start-maximized"                              // 最大化窗口
  );
  //   await driver.executeScript(`
  //   Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  //   Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  //   Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  //   Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
  // `);
  //   await driver.executeScript(`
  //     const getParameter = WebGLRenderingContext.prototype.getParameter;
  //     WebGLRenderingContext.prototype.getParameter = function(parameter) {
  //       if (parameter === 37445) {
  //         return 'Intel Inc.';
  //       }
  //       if (parameter === 37446) {
  //         return 'Intel Iris OpenGL Engine';
  //       }
  //       return getParameter(parameter);
  //     };
  //   `);

  //   await driver.executeScript(`
  //   const getUserMedia = navigator.mediaDevices.getUserMedia;
  //   navigator.mediaDevices.getUserMedia = function(constraints) {
  //     if (constraints.audio || constraints.video) {
  //       return Promise.reject(new Error('WebRTC is disabled'));
  //     }
  //     return getUserMedia.call(navigator.mediaDevices, constraints);
  //   };
  // `);
  // const actions = driver.actions({ bridge: true });
  // await actions.move({ duration: 500, origin: { x: 0, y: 0 }, x: 200, y: 200 }).perform();
  // await actions.click().perform();
}

module.exports = {
  getResumeInfo,
  sleep,
  fixChrome
};
