
const { By, Key, until } = require("selenium-webdriver");
const { openBrowserWithOptions, getLoginDialog, runTask, getDriver } = require("./service")

async function main(url, browserType) {
    try {
        // 打开浏览器
        await openBrowserWithOptions(url, browserType);
        // 点击登录按钮，并等待登录成功
        await getLoginDialog();

        await runTask()
        // await driver.quit();
        
    } catch (e) { 
        console.log('错误<<<<<',e, '>>>>错误')
        const driver = getDriver()
        await driver.quit();
    }
}

const url =
    "https://baidu.com";
const browserType = "chrome";

main(url, browserType);