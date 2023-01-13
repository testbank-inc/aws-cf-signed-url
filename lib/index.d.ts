export type TGetSignedUrl = {
    cfURL: string;
    expireTime?: number;
    ipRange?: string;
};
export declare class SignedURLService {
    keyPairId: string;
    privateKey: string;
    defaultExpireTime: number;
    constructor(keyPairId: string, privateKey: string, defaultExpireTime?: number);
    getSignedURL({ cfURL, expireTime, ipRange }: TGetSignedUrl): string;
}
