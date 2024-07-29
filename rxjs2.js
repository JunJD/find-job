import fetch from 'node-fetch';
import NodeRSA from 'node-rsa';
import crypto from 'crypto';
import { from, of } from 'rxjs';
import { map, switchMap, catchError, delay } from 'rxjs/operators';
import { URLSearchParams } from 'url';
import fs from 'node:fs';
import path from 'node:path';
const BAIDU_URL = "https://tieba.baidu.com/"
// 公用headers
const commonHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': 'BAIDUID=29AEC92C15F4F8B29546989A97823E6A:FG=1; BAIDUID_BFESS=29AEC92C15F4F8B29546989A97823E6A:FG=1; UBI=fi_PncwhpxZ%7ETaJc4Hn86slmgIPTypSTsf0fa%7Em1uZ0wzHrjOxxVk2FCyzctkT7FWpoiQfVjyTxrhUlPBXM; UBI_BFESS=fi_PncwhpxZ%7ETaJc4Hn86slmgIPTypSTsf0fa%7Em1uZ0wzHrjOxxVk2FCyzctkT7FWpoiQfVjyTxrhUlPBXM; BAIDU_WISE_UID=wapp_1722119540475_390; ab_sr=1.0.1_NjMzMjQ5NDk2MGEzM2U3ZTFlNjZiMTQ2YzFiZGQ3NjRjZGJjN2YyNWExMzhmMmExYzJjNDgyYmE5ZjRkZDcyNWEwY2VmYjIwMGI0MTc5ODYxYjljNTA1OTU1YWExNWM0YWFjYWViODkzYTMxZDVjN2EwMDgyNTJjODYyNzNmNDk5ZTg5ODU3MzQ0N2NmOGFhN2JiYmY1YmMzYzA0ZTg3OGI0YzllNWI3YTI0NGJmMmJjMGJkZDQ0NGM0Yjg5NTZiYjM2YmEzOTc0ZGU1ZjdlY2VkYzc2YmIzYTM4ODc1MDQ=; HOSUPPORT=1; HOSUPPORT_BFESS=1; ppfuid=FOCoIC3q5fKa8fgJnwzbE0LGziLN3VHbX8wfShDP6RCsfXQp/69CStRUAcn/QmhIlFDxPrAc/s5tJmCocrihdwitHd04Lvs3Nfz26Zt2holplnIKVacidp8Sue4dMTyfg65BJnOFhn1HthtSiwtygiD7piS4vjG/W9dLb1VAdqMruOyYxu8xgrK49GD5UPdKO0V6uxgO+hV7+7wZFfXG0MSpuMmh7GsZ4C7fF/kTgmvq/k11nkKpEvJu9aKoOwiuNqiSlcS58Ly9mjkdbS+gNuLgcrFRyrB1NUhD+vuUH5U1v2iwj13daM+9aWJ5GJCQM+RpBohGNhMcqCHhVhtXpVObaDCHgWJZH3ZrTGYHmi7XJB9z3y2o8Kqxep5XBCsugNOW5C73e/g54kuY4PKIS8TtlheGhftBTbUILzt33xSjQXz/gJEgSYx1vUQMipXdSecr9yhMSRLVoFktEC1isGYTwrsZLf0WqmZ//cYy3MWvK/S9Ff5RtLDcahg8QCqqP/JUZA7BRBFh68uqDQax10gfXgGxCNf3Sx8e4KXUBrqV/g3hEEf9luu8oPziRIwanIJY1XZupqPZgmfh8BLwT9YUuyc0u8RKTitzO23hSwGX7sI4U3M5cfLBwVX5m74NveYUNi7Li87S8ZbXy31eyxBDK4IiDGlt1VFsxDIz0RsVHZudegSJ4zYa95fLOW41HdqdlVsa4ORVPwaoYgWzWigT4KUSvejPWWbczD37o0JAMY0Xq/mt7JbC+fPJzgUfd9svt2KsTM2NM3tfRHJpB3BWSLl2pae5DO76/xQFgbnRUmmXSoE2caKfAIbUu9YuHJMc4xeuRg7bfpEY/vwboa87Mf4DRxb3AAPFSzwHIQsKUb2NhurFXPHTBQ0ZqOMmlY+ev7ywybLL8HzYMUKf7xXkuNYCZBWkNbmLJnCAaUcxvvi236pnhRAiCpqFQgkNjC1A5ggMDnpv8k9lbQM2eIu01rzx5KJW22MzZ0c8aSEaiiS5MGq2rHDxd+cheyqXoKDbFUOPsQE72/a0kEWC2KhuPKLM9/6dZ00isWP1M71YVK+GcriYXdSGsdTLua2Z4rsiMpSciOy0GtH0BDIaHROBNUIGus13vk3BD9zddjzj9ZJseUlzwEV+bscicwIjSCwQvM4e3xnzVzlld+zvYN0q7Yw+xx5u95PSoz+nO88s9TqjpS2CuGXeoK3JV0ZsrYL63KbB6FE0u0LGhMX2XqphVNhJG/707P2GcCYlcR4=; arialoadData=false; RT="z=1&dm=baidu.com&si=361064dd-f623-491e-b232-a8e35fd96f91&ss=lz4pid2m&sl=3&tt=1lz&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=2fy&ul=dae3&hd=dapp"; pplogid=3728fyRIEHFkxupU7JsnpymZnTA1AUJtgy%2BeRn3gx3CFDm3izpKBZZTb0TbTnkqkGu9e%2FTszX595A4%2FlYVJH6zU44LEBVT9%2FUb%2Fw93H0KlCN%2FHekzaHfArODeyBc%2BlG5SHCd; pplogid_BFESS=3728fyRIEHFkxupU7JsnpymZnTA1AUJtgy%2BeRn3gx3CFDm3izpKBZZTb0TbTnkqkGu9e%2FTszX595A4%2FlYVJH6zU44LEBVT9%2FUb%2Fw93H0KlCN%2FHekzaHfArODeyBc%2BlG5SHCd; logTraceID=49d7e6ce4e7f6acaf61db17844e8e41278ee9d2f72b20f424c',
    'Origin': 'https://www.baidu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://www.baidu.com/',
    'Sec-Fetch-Dest': 'iframe',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
};

// 工具函数
const getGid = () => crypto.randomBytes(16).toString('hex');
const getTime = () => new Date().getTime().toString();
const getCallback = () => `callback${Math.floor(Math.random() * 10000)}`;
const getParams = async () => {
    return {
        time: getTime(),
        alg: 'v3',
        sig: '1',
        elapsed: '1',
        shaOne: '00912dfb663cb85c53acd01d89d9d86d9b0fafb8'
    };
};

async function getCookie() {
    try {
        const response = await fetch('http://www.baidu.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
            },
            credentials: 'include' // 确保包含凭据信息
        });

        // 检查响应是否成功
        if (response.ok) {
            // 从响应头中获取 'set-cookie'
            const cookies = response.headers.get('set-cookie');
            console.log('cookies==>', cookies);
        } else {
            console.error('请求失败：', response.status);
        }
    } catch (error) {
        console.error('请求错误：', error);
    }
}

async function getStyle() {
    const response = await fetch("https://passport.baidu.com/cap/style", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": "BAIDUID=29AEC92C15F4F8B29546989A97823E6A:FG=1; BAIDUID_BFESS=29AEC92C15F4F8B29546989A97823E6A:FG=1; UBI=fi_PncwhpxZ%7ETaJc4Hn86slmgIPTypSTsf0fa%7Em1uZ0wzHrjOxxVk2FCyzctkT7FWpoiQfVjyTxrhUlPBXM; UBI_BFESS=fi_PncwhpxZ%7ETaJc4Hn86slmgIPTypSTsf0fa%7Em1uZ0wzHrjOxxVk2FCyzctkT7FWpoiQfVjyTxrhUlPBXM; BAIDU_WISE_UID=wapp_1722119540475_390; HOSUPPORT=1; HOSUPPORT_BFESS=1; ppfuid=FOCoIC3q5fKa8fgJnwzbE0LGziLN3VHbX8wfShDP6RCsfXQp/69CStRUAcn/QmhIlFDxPrAc/s5tJmCocrihdwitHd04Lvs3Nfz26Zt2holplnIKVacidp8Sue4dMTyfg65BJnOFhn1HthtSiwtygiD7piS4vjG/W9dLb1VAdqMruOyYxu8xgrK49GD5UPdKO0V6uxgO+hV7+7wZFfXG0MSpuMmh7GsZ4C7fF/kTgmvq/k11nkKpEvJu9aKoOwiuNqiSlcS58Ly9mjkdbS+gNuLgcrFRyrB1NUhD+vuUH5U1v2iwj13daM+9aWJ5GJCQM+RpBohGNhMcqCHhVhtXpVObaDCHgWJZH3ZrTGYHmi7XJB9z3y2o8Kqxep5XBCsugNOW5C73e/g54kuY4PKIS8TtlheGhftBTbUILzt33xSjQXz/gJEgSYx1vUQMipXdSecr9yhMSRLVoFktEC1isGYTwrsZLf0WqmZ//cYy3MWvK/S9Ff5RtLDcahg8QCqqP/JUZA7BRBFh68uqDQax10gfXgGxCNf3Sx8e4KXUBrqV/g3hEEf9luu8oPziRIwanIJY1XZupqPZgmfh8BLwT9YUuyc0u8RKTitzO23hSwGX7sI4U3M5cfLBwVX5m74NveYUNi7Li87S8ZbXy31eyxBDK4IiDGlt1VFsxDIz0RsVHZudegSJ4zYa95fLOW41HdqdlVsa4ORVPwaoYgWzWigT4KUSvejPWWbczD37o0JAMY0Xq/mt7JbC+fPJzgUfd9svt2KsTM2NM3tfRHJpB3BWSLl2pae5DO76/xQFgbnRUmmXSoE2caKfAIbUu9YuHJMc4xeuRg7bfpEY/vwboa87Mf4DRxb3AAPFSzwHIQsKUb2NhurFXPHTBQ0ZqOMmlY+ev7ywybLL8HzYMUKf7xXkuNYCZBWkNbmLJnCAaUcxvvi236pnhRAiCpqFQgkNjC1A5ggMDnpv8k9lbQM2eIu01rzx5KJW22MzZ0c8aSEaiiS5MGq2rHDxd+cheyqXoKDbFUOPsQE72/a0kEWC2KhuPKLM9/6dZ00isWP1M71YVK+GcriYXdSGsdTLua2Z4rsiMpSciOy0GtH0BDIaHROBNUIGus13vk3BD9zddjzj9ZJseUlzwEV+bscicwIjSCwQvM4e3xnzVzlld+zvYN0q7Yw+xx5u95PSoz+nO88s9TqjpS2CuGXeoK3JV0ZsrYL63KbB6FE0u0LGhMX2XqphVNhJG/707P2GcCYlcR4=; arialoadData=false; RT=\"z=1&dm=baidu.com&si=361064dd-f623-491e-b232-a8e35fd96f91&ss=lz4pid2m&sl=3&tt=1lz&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=2fy&ul=dae3&hd=dapp\"; PSTM=1722126736; H_PS_PSSID=60275_60470_60492_60502_60519_60523; BIDUPSID=08CCA4868D6A12731D726D7A765EE15D; BA_HECTOR=2g8l8g00a580a0040h2085249p0av01jab4ci1v; ZFY=PBiKyGsOxOnqoWAYaTCSp9vL0wgI20hBXnPSE8eMUVY:C; pplogid=98701DpuMvAqqXg%2BUXzFlGFCsQsDwAFnmwA5bf6jIHW6MBULt9w7byfSD00kRmLEhq%2BLmoFxkIabNb6Dohw8LH%2FKNNt2XUIa6WoNbhzGqcbcU52YCOV%2FLD5Qypuj5kKBcipI; pplogid_BFESS=98701DpuMvAqqXg%2BUXzFlGFCsQsDwAFnmwA5bf6jIHW6MBULt9w7byfSD00kRmLEhq%2BLmoFxkIabNb6Dohw8LH%2FKNNt2XUIa6WoNbhzGqcbcU52YCOV%2FLD5Qypuj5kKBcipI; logTraceID=1d33457107e702ae34d3a3dca37bc9233025e4f4d6816e0f51",
            "Referer": "https://www.baidu.com/",
            "Referrer-Policy": "unsafe-url"
        },
        "body": "_=1722136291948&refer=https%3A%2F%2Fwww.baidu.com%2F&ak=1e3f2dd1c81f2075171a547893391274&tk=8182nSotO2ZBmCDTSXGsTlLCD%2Bs%2BEQmmU0uLt4YnUwuluAwZ57w5qFJU21PZ75lkVvJkZM2It3fVUqnq2SxgIfludmDyYkiPNCmqeOgCD7kRv%2BAHdsuOv2x%2BGfo4vyz27C1Pfp7CxDi%2BJkiQmpnPw3Ha1wImTM%2FV4z9gLEIB%2BoWubKM%3D&scene=&isios=0&type=&ver=2",
        "method": "POST"
    });
    const styleContent = await response.json()
    getImgFile(styleContent)
}

async function getImgFile(styleContent) {
    try {
        const img_url = styleContent.data.captchalist[0].source.back.path;
        console.log('获取到的图片链接', img_url);
        const response = await fetch(img_url, { headers: {...commonHeaders} });
        const imgBuffer = await response.buffer();
        const imgPath = path.join('img_file', 'demo_aqc.png');
        fs.writeFileSync(imgPath, imgBuffer);
        
        // await new Promise(resolve => setTimeout(resolve, 1500)); // 等待 1.5 秒

        // const { results, avgDiff } = await getResult('img_file');
        // const predicted_angle = results[0].Infer;
        // return predicted_angle;
    } catch (error) {
        console.error('获取图片或处理时出错:', error);
        throw error;
    }
}

getStyle()

const ak = '1e3f2dd1c81f2075171a547893391274'
const fuid = 'FOCoIC3q5fKa8fgJnwzbE0LGziLN3VHbX8wfShDP6RCsfXQp/69CStRUAcn/QmhIlFDxPrAc/s5tJmCocrihdwitHd04Lvs3Nfz26Zt2holplnIKVacidp8Sue4dMTyfg65BJnOFhn1HthtSiwtygiD7piS4vjG/W9dLb1VAdqMruOyYxu8xgrK49GD5UPdKO0V6uxgO+hV7+7wZFfXG0MSpuMmh7GsZ4C7fF/kTgmvq/k11nkKpEvJu9aKoOwiuNqiSlcS58Ly9mjkdbS+gNuLgcrFRyrB1NUhD+vuUH5U1v2iwj13daM+9aWJ5GJCQM+RpBohGNhMcqCHhVhtXpVObaDCHgWJZH3ZrTGYHmi7XJB9z3y2o8Kqxep5XBCsugNOW5C73e/g54kuY4PKIS8TtlheGhftBTbUILzt33xSjQXz/gJEgSYx1vUQMipXdSecr9yhMSRLVoFktEC1isGYTwrsZLf0WqmZ//cYy3MWvK/S9Ff5RtLDcahg8QCqqP/JUZA7BRBFh68uqDQax10gfXgGxCNf3Sx8e4KXUBrqV/g3hEEf9luu8oPziRIwanIJY1XZupqPZgmfh8BLwT9YUuyc0u8RKTitzO23hSwGX7sI4U3M5cfLBwVX5m74NveYUNi7Li87S8ZbXy31eyxBDK4IiDGlt1VFsxDIz0RsVHZudegSJ4zYa95fLOW41HdqdlVsa4ORVPwaoYgWzWigT4KUSvejPWWbczD37o0JAMY0Xq/mt7JbC+fPJzgUfd9svt2KsTM2NM3tfRHJpB3BWSLl2pae5DO76/xQFgbnRUmmXSoE2caKfAIbUu9YuHJMc4xeuRg7bfpEY/vwboa87Mf4DRxb3AAPFSzwHIQsKUb2NhurFXPHTBQ0ZqOMmlY+ev7ywybLL8HzYMUKf7xXkuNYCZBWkNbmLJnCAaUcxvvi236pnhRAiCpqFQgkNjC1A5ggMDnpv8k9lbQM2eIu01rzx5KJW22MzZ0c8aSEaiiS5MGq2rHDxd+cheyqXoKDbFUOPsQE72/a0kEWC2KhuPKLM9/6dZ00isWP1M71YVK+GcriYXdSGsdTLua2Z4rsiMpSciOy0GtH0BDIaHROBNUIGus13vk3BD9zddjzj9ZJseUlzwEV+bscicwIjSCwQvM4e3xnzVzlld+zvYN0q7Yw+xx5u95PSoz+nO88s9TqjpS2CuGXeoK3JV0ZsrYL63KbB6FE0u0LGhMX2XqphVNhJG/707P2GcCYlcR4='
// 获取初始参数
const fetchInitialParams = async () => {
    const params = await getParams();
    const url = `https://passport.baidu.com/viewlog?ak=${ak}&callback=${getCallback()}&v=${Math.floor(10000 * Math.random() + 500)}&t=${getTime()}`;
    const response = await fetch(url, { headers: commonHeaders });
    const text = await response.text();
    const json = JSON.parse(text.match(/\((.*)\)/)[1]);
    return json.data;
};

const getLog = async (tk, as, fs) => {
    const response = await fetch('https://passport.baidu.com/cap/log', {
        method: 'POST',
        headers: {
            ...commonHeaders
        },
        body: new URLSearchParams({
            "_": getTime(),
            "refer": BAIDU_URL,
            ak,
            'as': as,
            "scene": "",
            "tk": tk,
            "ver": "2",
            "cv": "submit",
            "typeid": "spin-0",
            fuid,
            // "fs": fs
        })
    });
    const text = await response.text();
    // console.log('get log:', text)
    const jdata = JSON.parse(text.replace(/'/g, '"'));
    console.log('json.dat====>', jdata.data)
    getInit()
    return {
        s: jdata.data.ds,
        k: jdata.data.tk
    };
}

async function getInit() {
    const response = await fetch('https://passport.baidu.com/cap/init', {
        method: 'POST',
        headers: {
            ...commonHeaders
        },
        body: new URLSearchParams({
            "_": getTime(),
            "refer": BAIDU_URL,
            ak,
            "ver": "2",
            "qrsign": ""
        })
    });
    const text = await response.text();

    const jdata = JSON.parse(text.replace(/'/g, '"'));
    console.log('getInit====>', jdata.data)
    return {
        s: jdata.data.ds,
        k: jdata.data.tk
    };
    // return jdata
}

// 获取公钥
const fetchPublicKey = (token, gid) => {
    const params = {
        token,
        tpl: 'nx',
        subpro: '',
        apiver: 'v3',
        tt: getTime(),
        gid,
        traceid: '',
        ...getParams()
    };
    return from(fetch(`https://passport.baidu.com/v2/getpublickey?${new URLSearchParams(params).toString()}`, { headers: commonHeaders }))
        .pipe(
            switchMap((response) => response.text()),
            map((text) => {
                const jdata = JSON.parse(text.replace(/'/g, '"'));
                return {
                    publicKey: jdata.pubkey,
                    key: jdata.key
                };
            }),
            catchError((error) => {
                console.error('Error in public key request:', error);
                return of({ error });
            })
        );
};

// 加密密码
const encryptPassword = (password, publicKey) => {
    const key = new NodeRSA(publicKey, 'pkcs8-public-pem');
    const encryptedPassword = key.encrypt(password, 'base64');
    return encryptedPassword;
};

// 登录请求
const login = (username, password) => {
    const gid = getGid();
    const tt = getTime();

    from(fetch(`https://passport.baidu.com/v2/api/?getapi&token=&tpl=nx&subpro=&apiver=v3&tt=${tt}&class=login&gid=${gid}&logintype=dialogLogin&traceid=&time=${tt}&alg=1&sig=1&elapsed=1&shaOne=1&callback=${getCallback()}`, { headers: commonHeaders })
        .then(res => res.text()))
        .pipe(
            map(response => {
                const tokenMatch = response.match(/"token" : "(.*?)"/);
                return tokenMatch ? tokenMatch[1] : null;
            }),
            switchMap(token => fetchPublicKey(token, gid).pipe(
                map((resFor) => ([resFor, token]))
            )),
            map(([{ publicKey, key }, token]) => {
                const encryptedPassword = encryptPassword(password, publicKey);
                return { encryptedPassword, key, token };
            }),
            switchMap(async ({ encryptedPassword, key, token }) => {
                const initialParams = await fetchInitialParams();
                // tk as ds

                const { s, k } = getInit(initialParams.tk, initialParams.as,)
                //从界面到登陆的的时间，简单用随机数代替一下
                const ppuiLogintime = Math.floor(Math.random() * 10000);
                const tt = getTime()
                const data = {
                    staticpage: 'https://www.baidu.com/cache/user/html/v3Jump.html',
                    charset: 'UTF-8',
                    tpl: 'mn',
                    subpro: '',
                    apiver: 'v3',
                    codestring: '',
                    safeflg: '0',
                    u: 'https://www.baidu.com/',
                    isPhone: '',
                    detect: '1',
                    gid: '5A41F57-CF8B-41F5-95E8-8A26A031A746',
                    quick_user: '0',
                    logintype: 'dialogLogin',
                    logLoginType: 'pc_loginDialog',
                    idc: '',
                    mkey: '',
                    splogin: 'rate',
                    username: '不腻',
                    password: 'kOHs2R7PxqVkmvdVbn7Mxrzb1cDkFhSj8kLUZTQBT/uILHRLgM1EdKDH0QdQ3rR24G0i5mVFoBtBKktYjoUdufqws30XOwEl1xcts1tgVnJXN4qDSFDKTrEyMwBQ/YSINBt3ns0VyZFD2MLe7JWj61fx2AUhCtXashiPvITVEw4=',
                    mem_pass: 'on',
                    isagree: 'on',
                    rsakey: 'C15VcpWTE1ZFOfIgG1zEMJakaqc8pSvB',
                    crypttype: '12',
                    ppui_logintime: '70218438',
                    countrycode: '',
                    fp_uid: '',
                    fp_info: '',
                    loginversion: 'v4',
                    supportdv: '1',
                    bdint_sync_cookie: '',
                    tk: '56405LUQGZ11IipxtiHW3okzjDhU86dqrGAKsO60Guvd0jfqFlC5aj6UiFbYIB4jfNuR/GIuJJPJ5MDWbtuQ1bZ9Ch6YWWVcdJWXcXJnO4eLltY87e+JIeW+giaKpesQS2mW',
                    dv: 'tk0.61983360462070381722055026471@ttk0ynARNZ0mQYDEQZ2kNx0RKy06yl09yy2vlxOvyZo7NQ07NzLk3Q2kqZO6GZOmylAgK~AgFdo7sZ0mQ5t5lu53nAMxjt5xhL07nLMiGgrM8oHExT2k0gAg3iAg3QLkHx2kqZGsnoFx8h7GjL5nAtMgsQMxjxN-Gz7WnXr9yg0gNlAg3youy_nk0oIAkp~2kp-A1yQARqx2nFh73D9t5xLMxh75ndQ0GjL5M8RO-FTFvjiOWQSHEFdoksQ2kslA1yl0gtl2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~LkKz09yz0R0Zo73aA1Q5t5lu53nAMxjt5xhL07nLMiAxHWxIDuyiAR3Z0R5Q2ksQ0Rsx2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~Gi8UNuhTN6yl0g3Z07Nx2kszAgqQ2nFh73D9t5xLMxh75ndQ0GjLrWjzOMy_ImmPxmuzTuIWhuk-0zyz2kszAy__wkjDvZy2RHQo7Kg0gHyAkHz0kNy0gKQAgpz0k5x0kp-AkNQhkjPuF~Nu0V2zjiDiNYHWnIru5YH-jX2zQxOWFTrWTYrEt_Akv0R5Z0myQAkty2kpa0myQAkty2k3y0myQAkty2ks~AkqZoksl',
                    fuid,
                    s: "MSy7RWg3vwUgNaY51+9K5Zy88wTi63rDD8GM238rKbkkufcExfn0DsXf3fJ3MWHd5SfnS4fsrd6IFrQ6xyk2w9MGuZZSexONPPq1C5MLdfGI5i/YMj8nyxizXg9FSOC71KlZn/Drbi4KBOZLo2Uyf1OjOhTm0BLmMhcNni7xnL33vUAN5imJ1JHhp3rQQYOamro8HPuhLgKzEMykmY1QPZWtchzwle2tFMuMfiaapKrhw9AUk835Y7ljBLhtsuw4p3MOV2gGI63VsMfQvPlhK1npxttpE2RYgShaPZ3xn8CFjMIHFwzrc3j8CSeEHTiKG9rC7HwftVpdRhVnf8vzNk0I8jrRDkSUEV1xzTzkHyCTJPO6votUyUw5+VB2IIpMks6p2tsr1OkuWrTtQPCbk2rEe6RV4WbxkVh3e8jygMA=",
                    k: "7485XJsApsZyI0jb4AN8CqHFYBYX7ITVil8KeQo3LEAuKOvvcMc0trOIbj4d1ppjv3U3QZAeJp4mFabsvsEyhN+k3Uf2vn7l/ZDD59nQHNnY3Fsp/dlGbSPCdbA0dZqcckmLy52jDugJkgC9sOkY6tHOi/c7eR9B1Cc7/RoShJFm7MY=",
                    alg: 'v3',
                    sig: 'WDlSbVhiYkhPNVNUdkMydDhicStrUDY5VGt2d2w0ODQvWGJqdWUrSFZ2NDdpOFFLSElFZFBlQXR4ZDU4WmExSQ==',
                    elapsed: '2',
                    rinfo: `{"fuid":"e6dff83b0c6ccd098414591296a4bf73"}'`,


                    shaOne: '000af72aedb153fe9a3d31c135903b9068a8e860',
                    traceid: '2FA09501',
                    loginmerge: true,
                    token: token,
                    tt,
                    time: tt.slice(0, -3),
                    username,
                    password: encryptedPassword,
                    // 变
                    ds: initialParams.ds,
                    rsakey: key,
                    tk: initialParams.tk,
                    ppui_logintime: ppuiLogintime,
                };
                console.log(data)
                return fetch('https://passport.baidu.com/v2/api/?login', {
                    method: 'POST',
                    headers: {
                        ...commonHeaders
                    },
                    body: new URLSearchParams(data)
                });
            })
        )
        .pipe(
            switchMap((response) => response.text()),
            map((text) => {
                console.log(text, 'text')
                return {
                    success: text.includes('err_no=0') || text.includes('err_no=120021'),
                    needsCaptcha: text.includes('err_no=257') || text.includes('err_no=6'),
                    isRotateImg: text.includes('err_no=50052'),
                    codeString: text.match(/codeString=([^&]+)&/),
                };
            }),
            catchError((error) => {
                console.error('Error in login request:', error);
                return of({ error });
            })
        )
        .subscribe(response => {
            console.log(response);
            // 处理响应逻辑
        });
};

// Initialization variables
const username = '13156626720';
const password = '13156626720';
// 使用示例
login(username, password);