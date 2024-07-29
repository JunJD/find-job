import fetch from 'node-fetch';

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
            return cookies
        } else {
            console.error('请求失败：', response.status);
        }
    } catch (error) {
        console.error('请求错误：', error);
    }
}

export default getCookie;