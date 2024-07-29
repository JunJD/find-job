import { from, of } from 'rxjs';
import { catchError, switchMap, map, delay, concatMap } from 'rxjs/operators';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import NodeRSA from 'node-rsa';
import readline from 'readline';
import { createInterface } from 'readline';

// Helper function to simulate synchronous prompt for user input
const prompt = (query) => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        })
    );
};

// Initialization variables
const username = '天平地成';
const password = '021014';

const getToken = () =>
    from(fetch('http://www.baidu.com')).pipe(
        switchMap(() => {
            const timestamp = Math.floor(Date.now() / 1000);
            return from(
                fetch(
                    `https://passport.baidu.com/v2/api/?getapi&tpl=mn&apiver=v3&class=login&tt=${timestamp}&logintype=dialogLogin&callback=0`,
                    {
                        headers: {
                            accept: '*/*',
                            'accept-language': 'zh-CN,zh;q=0.9',
                            'cache-control': 'no-cache',
                            pragma: 'no-cache',
                            'sec-ch-ua':
                                '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                            'sec-ch-ua-mobile': '?0',
                            'sec-ch-ua-platform': '"Windows"',
                            'sec-fetch-dest': 'script',
                            'sec-fetch-mode': 'no-cors',
                            'sec-fetch-site': 'same-site',
                            cookie:
                                'BIDUPSID=FF435E2D2B385B38EE5ACCBF6956338D; PSTM=1693972530; HOSUPPORT=1; HOSUPPORT_BFESS=1; BAIDUID=B404E5D73818D6137A3A7921A41CA11A:FG=1; H_WISE_SIDS=40161_40210_40207_40216_40222_40294_40291_40289_40286_40318; H_WISE_SIDS_BFESS=40161_40210_40207_40216_40222_40294_40291_40289_40286_40318; BAIDUID_BFESS=B404E5D73818D6137A3A7921A41CA11A:FG=1; ZFY=zFDUcRqp7tJbZ0zjgBv6MS6d4nZoYEnXzqBdSIh0sNw:C; H_PS_PSSID=60360_60452_60469_60491_60502_60526; BA_HECTOR=2g81ak800hag2k842g0400803i9i981ja47n61v; UBI=fi_PncwhpxZ%7ETaJcytH3LHcO%7E808BwkepNvebAX-%7EJnEKReakyqokF-s9uBd4nM3B%7EphHXBxVm7PBOgPe54; UBI_BFESS=fi_PncwhpxZ%7ETaJcytH3LHcO%7E808BwkepNvebAX-%7EJnEKReakyqokF-s9uBd4nM3B%7EphHXBxVm7PBOgPe54; BAIDU_WISE_UID=wapp_1721901086370_454; arialoadData=false; HISTORY=439af17601ab523dfaa705dd42f7f8eb741951; HISTORY_BFESS=439af17601ab523dfaa705dd42f7f8eb741951; ppfuid=FOCoIC3q5fKa8fgJnwzbE67EJ49BGJeplOzf+4l4EOvDuu2RXBRv6R3A1AZMa49I27C0gDDLrJyxcIIeAeEhD8JYsoLTpBiaCXhLqvzbzmvy3SeAW17tKgNq/Xx+RgOdb8TWCFe62MVrDTY6lMf2GrfqL8c87KLF2qFER3obJGluLczhecqgremvAygsVvJeGEimjy3MrXEpSuItnI4KD49QspSMb2gaURUQm5tMeZ5XuaBIOsFln+30MpzXF/iVJMcEVqH/UKd3b2lVERTFXhJsVwXkGdF24AsEQ3K5XBbh9EHAWDOg2T1ejpq0s2eFy9ar/j566XqWDobGoNNfmfpaEhZpob9le2b5QIEdiQeMGGtnCq9fZ/aAmiQfaXFfXhLZ126CPFCIEuj/nWa+RPzg/CQV+t396RcQ+QB5B6TasmgOrJ40n63OsKSOpoSLpklEtTKfx5hHc9j4nurRraXUHgNWSPA31ou+XTSfsKyVXVSGGnkUB7qA0khSm2nsQwBpdgqbXUb4lU+zNAV2n0AktybhhKxhReRo8jZOXronbjpyaNZANNqEA4g1HmtdHmv/tVUjVExnyBvjSrtrPu8IrnpcuigpPlr6uwWt/lm7TLIKKJqASWGtMQ6010Ekmrx4fAQe4UGeL1qFLCkLuVsqRTBoofr21/QMVXuElE6IsRNIWWghWQd3Lf4jYlSvUuymUDPSEyRa3+0Ti1dVRXtBxMNNlZL/aYKhL8ZXc31rBDqIzqGz8FaOWCcRrX7m3wj9d8TG4nT8IuvZkoOKsBU2Pi6ulo2TY9YWTIdWDNjkUprNdxn+PjQUm/6IsYGfeeSSAeWd7rUjwjsqG1CAiSYEwkiM8yRL8vTnUx6p0ZJywphMm5K5yAjlzf7v15Uf7LZO9s5O64e/W4bHBcVvZq0hTVlg9uaZdy6WaLMpwoiu0wte1aGKzTL9WSo0bsCSwmslOTFxuROiuvx55Cu5DOAFGQM9PC1eNi2DOZbvibR8NTYxlrGkFlkXxi6t+hxhyYN1zEUp6ggVCZWoCgBT7dhxdC3bEpOFlnJXW/ewK+fOJ1Rm0oz1xFFR9FYG1BJvnQA8z6Cz/jTzGDsocIHwA4qlml8ik+FDREmF7DwZHRpOpiwmjUhELAzdRtuu+0nt6o8w3MlwZxJhxBabUW5sicyie973hz6nxWLbBzvYx9F54WJPMynUbqkO3Z7jSA8MZt1Aj6NtrhSNGXID70JtNbPvI2IjBBSQ1a2vY1slk3TKTLoU96dsmC3+9Ar1MCJM; logTraceID=e19c931d734fa29244ef1ee1fc308add3813f6f8f39f03aa7c; BDRCVFR[S4-dAuiWMmn]=I67x6TjHwwYf0; delPer=0; PSINO=3; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BAIDU_SSP_lcr=https://www.google.com/; ab_sr=1.0.1_Yzg1NGNmMzQ3NmMwNDQ4YzRiZTczZmI5ZWVhMjI5MDQ3MWFjOTBhMWVlYjY3NWM4YmQ3ZjliZjFlNzQ3YjM3MjAyMWQ2YWE5OTViNTYxMGUzYzk3NGI2YWExYmMwZGZkMWM0MWIyMWI2ZjM3ZWU5ZTVjOTM2ODQwNGJkMjUxZTliZmZmYzY3OGFjZWFjYmYxNmFlODQyM2E1NDQwMTZlNA==; RT="z=1&dm=baidu.com&si=58a8ee05-3d28-4ed7-ba75-280d4bc57692&ss=lz22q8q6&sl=2&tt=2sl&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=3hf&ul=qb2n&hd=qb3k"; pplogid=9319lS6HrWZGwB6RRL8TBLrG10kwAZRpRqkJo67iF0qr8%2F1%2FW3hue6EQNd5efVtyKkj9WY57UtJ9m0YzH6n6nmH6dZ1tq%2BYu31Fp%2BFf%2BP1zHF532fmJ7CoGwtzhwIvSL4JKI; pplogid_BFESS=9319lS6HrWZGwB6RRL8TBLrG10kwAZRpRqkJo67iF0qr8%2F1%2FW3hue6EQNd5efVtyKkj9WY57UtJ9m0YzH6n6nmH6dZ1tq%2BYu31Fp%2BFf%2BP1zHF532fmJ7CoGwtzhwIvSL4JKI',
                            Referer: 'https://www.baidu.com/',
                            'Referrer-Policy': 'unsafe-url',
                        },
                        body: null,
                        method: 'GET',
                    }
                )
            );
        }),
        switchMap((response) => response.text()),
        map((text) => {
            return JSON.parse(text.replace(/'/g, '"'));
        }),
        map((data) => {
            return data.data.token
        }),
        catchError((error) => {
            console.error('Error in init request:', error);
            return of({ error });
        })
    );

const fetchCaptcha = (codeString) =>
    from(fetch(`https://passport.baidu.com/cgi-bin/genimage?${codeString}`)).pipe(
        switchMap((response) => response.buffer()),
        map((buffer) => {
            fs.writeFileSync('/tmp/captcha.png', buffer);
            console.log('Captcha saved at /tmp/captcha.png');
            return prompt('Input verify code > ');
        }),
        catchError((error) => {
            console.error('Error in captcha request:', error);
            return of({ error });
        })
    );

const fetchPublicKey = (token) => {
    return from(fetch(`https://passport.baidu.com/v2/getpublickey?token=${token}`)).pipe(
        switchMap((response) => response.text()),
        map((text) => {
            const jdata = JSON.parse(text.replace(/'/g, '"'));
            return {
                // pubkey: jdata.pubkey.replace(/\\n/g, '\n'),
                pubkey: jdata.pubkey,
                rsakey: jdata.key
            };
        }),
        catchError((error) => {
            console.error('Error in public key request:', error);
            return of({ error });
        })
    );
}

const login = (token, pubkey, rsakey, captcha = '', codeString = '') => {
    const key = new NodeRSA(pubkey, 'pkcs8-public-pem');
    const encryptedPassword = key.encrypt(password, 'base64');
    const form = new FormData();
    form.append('staticpage', 'https://www.baidu.com/cache/user/html/v3Jump.html');
    form.append('charset', 'UTF-8');
    form.append('u', 'https://www.baidu.com/');
    form.append('token', token);
    form.append('tpl', 'pp');
    form.append('apiver', 'v3');
    form.append('tt', Date.now());
    form.append('codestring', codeString);
    form.append('isPhone', 'false');
    form.append('safeflg', '0');
    form.append('u', 'https://passport.baidu.com/');
    form.append('quick_user', '0');
    form.append('logLoginType', 'pc_loginBasic');
    form.append('loginmerge', 'true');
    form.append('logintype', 'basicLogin');
    form.append('username', username);
    form.append('password', encryptedPassword);
    form.append('verifycode', captcha);
    form.append('mem_pass', 'on');
    form.append('rsakey', rsakey);
    form.append('crypttype', '12');
    form.append('ppui_logintime', '50918');
    form.append('callback', 'parent.bd__pcbs__oa36qm');

    return from(
        fetch('https://passport.baidu.com/v2/api/?login', {
            headers: {
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                // "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "macOS",
                "sec-fetch-dest": "iframe",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-site",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": `BAIDUID_BFESS=08CCA4868D6A12731D726D7A765EE15D:FG=1; HOSUPPORT=1; HOSUPPORT_BFESS=1; MCITY=-162%3A; BIDUPSID=08CCA4868D6A12731D726D7A765EE15D; PSTM=1699753379; UBI=fi_PncwhpxZ%7ETaJc78KV1wpZC1MgOxKGBqAfAhSL7QPKpbGPod%7EVHg7jyWkP%7EMXhTUUw3Mpn01TFk26bEJj; UBI_BFESS=fi_PncwhpxZ%7ETaJc78KV1wpZC1MgOxKGBqAfAhSL7QPKpbGPod%7EVHg7jyWkP%7EMXhTUUw3Mpn01TFk26bEJj; HISTORY=439af17601ab523dfaa705dd42f7f8eb741951; HISTORY_BFESS=439af17601ab523dfaa705dd42f7f8eb741951; __bid_n=18f2ca6b1df1008a9d2c2e; BAIDU_WISE_UID=wapp_1715341765255_388; RT="z=1&dm=baidu.com&si=eda58f48-92fb-4bac-b522-ca0c186a8516&ss=lz0eq6is&sl=1l&tt=6tj1&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=2unyc&nu=3556etxz&cl=2ul1n&ul=59fi7&hd=59fjq"; H_PS_PSSID=60360_60454_60465_60492_60499_60471; BA_HECTOR=al8g8lagag8hak00a4010hak050uoa1ja8a1s1u; ZFY=1:B3VV0LQuHpzIHHAUMTRTC8E:AAq2uapOiK0hktBD1no:C; ppfuid=FOCoIC3q5fKa8fgJnwzbE0LGziLN3VHbX8wfShDP6RCsfXQp/69CStRUAcn/QmhIlFDxPrAc/s5tJmCocrihdwitHd04Lvs3Nfz26Zt2holplnIKVacidp8Sue4dMTyfg65BJnOFhn1HthtSiwtygiD7piS4vjG/W9dLb1VAdqMruOyYxu8xgrK49GD5UPdKO0V6uxgO+hV7+7wZFfXG0MSpuMmh7GsZ4C7fF/kTgmvq/k11nkKpEvJu9aKoOwiuNqiSlcS58Ly9mjkdbS+gNuLgcrFRyrB1NUhD+vuUH5U1v2iwj13daM+9aWJ5GJCQM+RpBohGNhMcqCHhVhtXpVObaDCHgWJZH3ZrTGYHmi7XJB9z3y2o8Kqxep5XBCsugNOW5C73e/g54kuY4PKIS8TtlheGhftBTbUILzt33xSjQXz/gJEgSYx1vUQMipXdSecr9yhMSRLVoFktEC1isGYTwrsZLf0WqmZ//cYy3MWvK/S9Ff5RtLDcahg8QCqqP/JUZA7BRBFh68uqDQax10gfXgGxCNf3Sx8e4KXUBrqV/g3hEEf9luu8oPziRIwanIJY1XZupqPZgmfh8BLwT9YUuyc0u8RKTitzO23hSwGX7sI4U3M5cfLBwVX5m74NveYUNi7Li87S8ZbXy31eyxBDK4IiDGlt1VFsxDIz0RsVHZudegSJ4zYa95fLOW41HdqdlVsa4ORVPwaoYgWzWigT4KUSvejPWWbczD37o0JAMY0Xq/mt7JbC+fPJzgUfd9svt2KsTM2NM3tfRHJpB3BWSLl2pae5DO76/xQFgbnRUmmXSoE2caKfAIbUu9YuHJMc4xeuRg7bfpEY/vwboa87Mf4DRxb3AAPFSzwHIQsKUb2NhurFXPHTBQ0ZqOMmlY+ev7ywybLL8HzYMUKf7xXkuNYCZBWkNbmLJnCAaUcxvvi236pnhRAiCpqFQgkNjC1A5ggMDnpv8k9lbQM2eIu01rzx5KJW22MzZ0c8aSEaiiS5MGq2rHDxd+cheyqXoKDbFUOPsQE72/a0kEWC2KhuPKLM9/6dZ00isWP1M71YVK+GcriYXdSGsdTLua2Z4rsiMpSciOy0GtH0BDIaHROBNUIGus13vk3BD9zddjzj9ZJseUlzwEV+bscicwIjSCwQvM4e3xnzVzlld+zvYN0q7Yw+xx5u95PSoz+nO88s9TqjpS2CuGXeoK3JV0ZsrYL63KbB6FE0u0LGhMX2XqphVNhJG/707P2GcCYlcR4=; newlogin=1; pplogid=2464tkJ%2Fq3SpcPkqR8S8pbtVtodJkP7UvfKPrglKDlJqzqjY2Hp2Hz7NZcB5fZRXsK%2BPSoQPAqRbj6xhqcPI%2BsAo%2FxgmxuxuTijAj1g%2FSLDWJw2n3gEuUJVaeHx5FfRYtiDS; pplogid_BFESS=2464tkJ%2Fq3SpcPkqR8S8pbtVtodJkP7UvfKPrglKDlJqzqjY2Hp2Hz7NZcB5fZRXsK%2BPSoQPAqRbj6xhqcPI%2BsAo%2FxgmxuxuTijAj1g%2FSLDWJw2n3gEuUJVaeHx5FfRYtiDS; logTraceID=1e6733d36a558a32851e29851312e36dfc0e2d9a3bfe40f087`,
                Referer: 'https://www.baidu.com/',
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            method: 'POST',
            body: form,
        })
    ).pipe(
        switchMap((response) => response.text()),
        map((text) => {
            console.log(text)
            return {
                success: text.includes('err_no=0') || text.includes('err_no=120021'),
                needsCaptcha: text.includes('err_no=257') || text.includes('err_no=6'),
                isRoateImg: text.includes('err_no=50052'),
                codeString: text.match(/codeString=([^&]+)&/),
            }
        }),
        catchError((error) => {
            console.error('Error in login request:', error);
            return of({ error });
        })
    );
};

// Main logic
const main = () => {
    getToken()
        .pipe(
            switchMap((token) => fetchPublicKey(token).pipe(map((keyData) => {
                return { token, ...keyData };
            }))),
            switchMap(({ token, pubkey, rsakey }) => {
                return login(token, pubkey, rsakey);
            }),
            switchMap((loginResult) => {
                if (loginResult.isRoateImg) {
                    console.log('loginResult ==>', 'isRoateImg')
                }
                if (loginResult.needsCaptcha) {
                    return fetchCaptcha(loginResult.codeString[1]).pipe(
                        switchMap((captcha) =>
                            login(token, pubkey, rsakey, captcha, loginResult.codeString[1])
                        )
                    );
                }
                return of(loginResult);
            }),
            catchError((error, caught) => {
                console.error('Caught error:', error);
                return of({ error });
            })
        )
        .subscribe({
            next: (result) => {
                if (result.error) {
                    console.error('Process failed:', result.error);
                } else {
                    console.log('Login successful');
                }
            },
            error: (error) => console.error('Error in subscription:', error),
        });
};

main();
