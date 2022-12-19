export declare class CannedPolicy {
    url: string;
    expireTime: number;
    ipRange?: string;
    constructor(url: string, expireTime: number, ipRange?: string);
    toJSON(): string;
    _validate(): boolean;
}
