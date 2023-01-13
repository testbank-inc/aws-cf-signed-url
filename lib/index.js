"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignedURLService = void 0;
const url_1 = __importDefault(require("url"));
const jsrsasign_1 = require("jsrsasign");
// @ts-ignore
const crypto_js_1 = __importDefault(require("crypto-js"));
const lodash_1 = __importDefault(require("lodash"));
const buffer_1 = __importDefault(require("buffer"));
const cannyPolicy_1 = require("./cannyPolicy");
const util_1 = require("./util");
(0, util_1.disableWarning)();
global.Buffer = global.Buffer || buffer_1.default.Buffer;
class SignedURLService {
    keyPairId;
    privateKey;
    defaultExpireTime;
    constructor(keyPairId, privateKey, defaultExpireTime = Math.round(Date.now() + 30000)) {
        this.keyPairId = keyPairId;
        this.privateKey = getPrivateKey(privateKey);
        this.defaultExpireTime = defaultExpireTime;
    }
    getSignedURL({ cfURL, expireTime, ipRange }) {
        const privateKey = this.privateKey;
        const expireTimeVale = expireTime || this.defaultExpireTime;
        const policy = createPolicy({ url: cfURL, expireTime: expireTimeVale, ipRange });
        const signature = createPolicySignature(policy, privateKey);
        const policyStr = new Buffer(policy.toJSON()).toString('base64');
        const parsedUrl = url_1.default.parse(cfURL, true);
        parsedUrl.search = '';
        lodash_1.default.extend(parsedUrl.query, {
            'Expires': policy.expireTime,
            'Policy': normalizeBase64(policyStr),
            'Signature': normalizeBase64(signature),
            'Key-Pair-Id': this.keyPairId
        });
        return url_1.default.format(parsedUrl);
    }
}
exports.SignedURLService = SignedURLService;
function createPolicy({ url, expireTime, ipRange }) {
    const defaultExpireTime = Math.round(Date.now() + 30000);
    return new cannyPolicy_1.CannedPolicy(url, expireTime || defaultExpireTime, ipRange);
}
function createPolicySignature(policy, privateKey) {
    const sign = new jsrsasign_1.KJUR.crypto.Signature({ "alg": "SHA1withRSA" });
    sign.init(privateKey);
    const hash = sign.signString(policy.toJSON());
    return crypto_js_1.default.enc.Base64.stringify(crypto_js_1.default.enc.Hex.parse(hash));
}
function normalizeBase64(str) {
    return str
        .replace(/\+/g, '-')
        .replace(/=/g, '_')
        .replace(/\//g, '~');
}
function getPrivateKey(privateKey) {
    var newLinePattern = /\r|\n/;
    var lineBreakExists = newLinePattern.test(privateKey);
    if (!lineBreakExists) {
        throw new Error('Invalid private key string, must include line breaks');
    }
    return privateKey;
}
