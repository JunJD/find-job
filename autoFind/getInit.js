import fetch from 'node-fetch';
import { BAIDU_URL, ak, commonHeaders } from "./constants.js";
import { getTime } from "./utils/index.js";

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
    return {
        s: jdata.data.ds,
        k: jdata.data.tk
    };
}

export default getInit