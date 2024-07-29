import crypto from 'crypto';
const getGid = () => crypto.randomBytes(16).toString('hex');
const getTime = () => new Date().getTime().toString();
const getCallback = () => `callback${Math.floor(Math.random() * 10000)}`;

export {
    getGid,
    getTime,
    getCallback
}