export type TGetSignedUrl = {
    cfURL: string;
    expireTime?: number;
    ipRange?: string;
};
export declare class SignedURLService {
    keyPairId: string;
    privateKey: string;
    constructor(keyPairId: string, privateKey: string);
    getSignedURL({ cfURL, expireTime, ipRange }: TGetSignedUrl): string;
}
