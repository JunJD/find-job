import { BAIDU_URL, ak, commonHeaders } from "./constants.js";
import fetch from 'node-fetch';
import { getTime } from "./utils/index.js";
import { from, of } from "rxjs";
import { catchError, switchMap } from 'rxjs/operators';
import FormData from 'form-data'
import crypto from 'crypto';
// import fs from 'node:fs';
class Reply {
    count = 0;
    cookie
    tk
    as
    constructor(cookie, tk, as) {
        this.cookie = cookie
        this.tk = tk
        this.as = as
    }

    run() {
        console.log('reply running')
        this.count++
        return from(this.getStyle()).pipe(
            switchMap(async (styleContent) => {
                // get F1
                const backStr = styleContent['data']['backstr']
                const angle = await this.getImgFile(styleContent)
                const acC = this.getAcC(angle)
                const ran2 = this.get_mv2_num(acC)
                const mv2 = this.generateTrajectorySpin(ran2)
                const ran1 = acC < 0.5 ? 1 : 2
                const distance = angle * 238 / 360
                const mv1 = generate_trajectory(ran1, distance)
                let _str = `{"common":{"cl":[],"mv":${mv1},"sc":[],"kb":[],"sb":[],"sd":[],"sm":[],"cr":{"screenTop":0,"screenLeft":0,"clientWidth":1920,"clientHeight":919,"screenWidth":1920,"screenHeight":1080,"availWidth":1920,"availHeight":1040,"outerWidth":1920,"outerHeight":1040,"scrollWidth":1920,"scrollHeight":1920},"simu":0},"backstr":"${back_str}","captchalist":{"spin-0":{"cr":{"left":815,"top":307,"width":290,"height":280},"back":{"left":884,"top":351,"width":152,"height":152},"mv":${mv2},"ac_c":${ac_c},"p":{}}}}`;
                _str = _str.replace(/\s/g, '');
                console.log(_str);
                const key = get_new_key(this.as)
                const f1 = this.aesEncrypt(_str, key);
                // getF2
                
                const need_encrypt = `{"common_en":"${f1}","backstr":"${backStr}"}`.replace(' ', '')
                const key2 = get_new_key(this.as)
                const f2 = this.aesEncrypt(need_encrypt, key2);
                return of({ f2 });
            }),
            switchMap((result) => {
                console.log("prediction===>", result);
                return of(result);  // 确保返回的是一个 Observable
            }),
            catchError((error) => {
                console.error('Error in login request:', error);
                return of({ error });
            })
        )
    }



    async getStyle() {
        const response = await fetch('https://passport.baidu.com/cap/style', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': this.cookie,
                'Origin': 'https://www.baidu.com',
                'Pragma': 'no-cache',
                'Referer': BAIDU_URL,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"'
            },
            body: new URLSearchParams({
                '_': getTime(),
                'refer': BAIDU_URL,
                ak,
                tk: this.tk,
                'scene': '',
                'isios': '0',
                'type': '',
                'ver': '2'
            })
        });
        const styleContent = await response.json()
        return styleContent
    }

    async getImgFile(styleContent) {
        try {
            const img_url = styleContent.data.captchalist[0].source.back.path;
            const response = await fetch(img_url, { headers: { ...commonHeaders } });
            const imgBuffer = await response.buffer();
            // 读取本地 img_file/demo_aqc.png
            // const imgBuffer = fs.readFileSync('img_file/demo_aqc.png');

            // save
            // fs.writeFileSync('img_file/demo_aqc.png', imgBuffer);
            // 构建 form-data 并附加 buffer 数据
            const form = new FormData();
            form.append('file', imgBuffer, { filename: 'demo_aqc.png', contentType: 'image/png' });

            const data = await this.predict(form);
            return data.predicted_angle;
        } catch (error) {
            console.error('获取图片或处理时出错:', error);
            throw error;
        }
    }

    async predict(form) {
        const response = await fetch('http://127.0.0.1:5050/predict', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        const json = await response.json()
        return json
    }

    getAcC(angle) {
        const distance = angle / 360;
        const finalResult = parseFloat(distance.toFixed(2));
        return finalResult;
    }

    get_mv2_num(ac_c) {
        if (ac_c < 0.33) {
            return 3
        } else if (0.33 <= ac_c < 0.66) {
            return 4
        } else {
            return 5
        }
    }

    generateTrajectorySpin(numPoints) {
        if (numPoints === 0) {
            return [];
        }

        // 初始化时间戳和坐标
        var startTime = Date.now();
        var fxValues = [];
        var fyValues = [];
        var trajectory = [];

        // 生成 fx 和 fy 值
        for (var i = 0; i < numPoints; i++) {
            var fx, fy;
            if (i === 0) {
                fx = Math.floor(Math.random() * (900 - 880 + 1)) + 880;
            } else if (i < Math.floor(numPoints / 2)) {
                fx = fxValues[fxValues.length - 1] - Math.floor(Math.random() * (6 - 5 + 1)) + 5;
            } else {
                fx = fxValues[fxValues.length - 1] + Math.floor(Math.random() * (6 - 5 + 1)) + 5;
            }

            fy = Math.floor(Math.random() * (570 - 550 + 1)) + 550;
            fxValues.push(fx);
            fyValues.push(fy);
        }

        // 生成轨迹点
        for (var i = 0; i < numPoints; i++) {
            trajectory.push({
                t: startTime + i * (Math.floor(Math.random() * (200 - 100 + 1)) + 100), // 模拟时间滑动
                fx: fxValues[i],
                fy: fyValues[i]
            });
        }

        return JSON.stringify(trajectory);
    }

    generateTrajectory(numPoints, totalDistance) {
        const currentTime = Date.now();
        let result = [];

        if (numPoints === 0) {
            return JSON.stringify(result);
        } else if (numPoints === 1) {
            let fx = Math.floor(Math.random() * 26) + 828 + totalDistance;
            result.push({
                t: currentTime,
                fx: fx,
                fy: Math.floor(Math.random() * 21) + 660
            });
        } else {
            let averageDistance = totalDistance / (numPoints - 1);
            let fxStart = Math.floor(Math.random() * 26) + 828;
            let fxCurrent = fxStart;
            let fyStart = Math.floor(Math.random() * 6) + 660;

            for (let i = 0; i < numPoints; i++) {
                let fx, fy;
                if (i === 0) {
                    fx = fxStart;
                    fy = fyStart;
                } else {
                    let segmentDistance = averageDistance + (Math.random() * 2 - 1) * (averageDistance * 0.2);
                    fxCurrent += segmentDistance;
                    fx = Math.floor(fxCurrent);
                    fy += Math.floor(Math.random() * 4) + 2;
                }

                result.push({
                    t: currentTime,
                    fx: fx,
                    fy: fy
                });

                currentTime += Math.floor(Math.random() * 3801) + 200; // 增加时间戳
            }
        }

        return JSON.stringify(result);
    }

    get_sha3_encrypt(data, bits) {
        if (bits === 256) {
            return sha3_256(data);
        } else if (bits === 512) {
            return sha3_512(data);
        }
        return null;
    }
    
    get_new_key(_as) {
        const mode_dict = {
            "DZ": ["0", "1", "2", "3", "4"],
            "FB": ["A", "B", "C", "D", "E", "F", "G", "a", "b", "c", "d", "e", "f", "g"],
            "GU": 'appsapi2',
            "JQ": ["O", "P", "Q", "R", "S", "T", "o", "p", "q", "r", "s", "t"],
            "NZ": ["5", "6", "7", "8", "9"],
            "eR": ["H", "I", "J", "K", "L", "M", "N", "h", "i", "j", "k", "l", "m", "n"],
            "px": "https://wappass.baidu.com/static/touch/js/lib/fingerprint.js",
            "o": ["U", "V", "W", "X", "Y", "Z", "u", "v", "w", "x", "y", "z"],
            "q4": 2
        };
    
        let r = _as[_as.length - 1];
        let data = `${_as}${mode_dict["GU"]}`;
    
        let mess;
        if (mode_dict['FB'].includes(r)) {
            mess = crypto.createHash('md5').update(data).digest('hex');
        } else if (mode_dict['eR'].includes(r)) {
            mess = crypto.createHash('sha1').update(data).digest('hex');
        } else if (mode_dict['JQ'].includes(r)) {
            mess = crypto.createHash('sha256').update(data).digest('hex');
        } else if (mode_dict['o'].includes(r)) {
            mess = crypto.createHash('sha512').update(data).digest('hex');
        } else if (mode_dict['DZ'].includes(r)) {
            mess = this.get_sha3_encrypt(data, 256);
        } else if (mode_dict['NZ'].includes(r)) {
            mess = this.get_sha3_encrypt(data, 512);
        } else {
            return null;
        }
        return mess.substring(0, 16);
    }

    zeroPad(buffer, blockSize) {
        const padLength = blockSize - (buffer.length % blockSize);
        const padding = Buffer.alloc(padLength, 0);
        return Buffer.concat([buffer, padding]);
    }
    
    aesEncrypt(_str, key) {
        const plaintextBytes = Buffer.from(_str, 'utf-8');
        const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key, 'utf-8'), null);
        cipher.setAutoPadding(false); // Disable auto padding
        const paddedPlaintext = zeroPad(plaintextBytes, cipher.getBlockSize());
        const ciphertext = Buffer.concat([cipher.update(paddedPlaintext), cipher.final()]);
        const encodedCiphertext = ciphertext.toString('base64');
        return encodedCiphertext;
    }
    
}

export default Reply