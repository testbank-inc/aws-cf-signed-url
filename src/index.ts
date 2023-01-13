import url from 'url'
import util from 'util'
import { KJUR } from 'jsrsasign'
// @ts-ignore
import CryptoJS from 'crypto-js'
import _ from 'lodash'
import buffer from 'buffer'
import { CannedPolicy } from './cannyPolicy'
import { disableWarning } from './util';

disableWarning()
global.Buffer = global.Buffer || buffer.Buffer

export type TGetSignedUrl = {
    cfURL: string;
    expireTime?: number;
    ipRange?: string;
};

export class SignedURLService {
    keyPairId: string;
    privateKey: string;
    defaultExpireTimeMs: number;

    constructor(keyPairId: string, privateKey: string, defaultExpireTimeMs = 30000) {
        this.keyPairId = keyPairId
        this.privateKey = getPrivateKey(privateKey)
        this.defaultExpireTimeMs = defaultExpireTimeMs
    }

    getSignedURL({cfURL, expireTime, ipRange}: TGetSignedUrl): string {
        const privateKey = this.privateKey
        const expireTimeVale = expireTime || (Math.round(Date.now() + this.defaultExpireTimeMs))
        const policy = createPolicy({ url: cfURL, expireTime: expireTimeVale, ipRange })
        const signature = createPolicySignature(policy, privateKey)
        const policyStr = new Buffer(policy.toJSON()).toString('base64')
        const parsedUrl = url.parse(cfURL, true);
        parsedUrl.search = '';
        _.extend(parsedUrl.query, {
            'Expires': policy.expireTime,
            'Policy': normalizeBase64(policyStr),
            'Signature': normalizeBase64(signature),
            'Key-Pair-Id': this.keyPairId
        });
        return url.format(parsedUrl)
    }
}

function createPolicy({url, expireTime, ipRange}: { url: string, expireTime?: number, ipRange?: string }) {
    const defaultExpireTime = Math.round(Date.now() + 30000);
    return new CannedPolicy(url, expireTime || defaultExpireTime, ipRange);
}

function createPolicySignature(policy: CannedPolicy, privateKey: string) {
    const sign = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
    sign.init(privateKey)
    const hash = sign.signString(policy.toJSON())
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hash));
}

function normalizeBase64(str: string) {
    return str
        .replace(/\+/g, '-')
        .replace(/=/g, '_')
        .replace(/\//g, '~');
}

function getPrivateKey(privateKey: string) {
    var newLinePattern = /\r|\n/;
    var lineBreakExists = newLinePattern.test(privateKey);
    if (!lineBreakExists) {
        throw new Error('Invalid private key string, must include line breaks');
    }
    return privateKey;
}
