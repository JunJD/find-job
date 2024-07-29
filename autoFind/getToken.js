
import fetch from 'node-fetch';
import { commonHeaders } from "./constants.js";
import { getTime, getCallback} from "./utils/index.js";

async function getToken(gid) {
    const tt = getTime()
    const response = await fetch(
        `https://passport.baidu.com/v2/api/?getapi&token=&tpl=nx&subpro=&apiver=v3&tt=${tt}&class=login&gid=${gid}&logintype=dialogLogin&traceid=&time=${tt}&alg=1&sig=1&elapsed=1&shaOne=1&callback=${getCallback()}`,
        {
            headers: commonHeaders
        }
    )
    const text = await response.text()
    const tokenMatch = text.match(/"token" : "(.*?)"/);
    return tokenMatch ? tokenMatch[1] : null;
}

export default getToken