export class CannedPolicy {
    url: string;
    expireTime: number;
    ipRange?: string;

    constructor(url: string, expireTime: number, ipRange?: string) {
        this.url = url;
        this.expireTime = Math.round(expireTime/ 1000) || 0;
        this.ipRange = ipRange;
    }

    toJSON() {
        this._validate();

        if (this.ipRange) {
            const policy = {
                'Statement': [{
                    'Resource': this.url,
                    'Condition': {
                        'DateLessThan': {
                            'AWS:EpochTime': this.expireTime
                        },
                        'IpAddress': {
                            'AWS:SourceIp': this.ipRange
                        }
                    }
                }]
            };
            return JSON.stringify(policy);
        }
        const policy = {
            'Statement': [{
                'Resource': this.url,
                'Condition': {
                    'DateLessThan': {
                        'AWS:EpochTime': this.expireTime
                    }
                }
            }]
        };
        return JSON.stringify(policy);
    }

    _validate() {
        // Ensure required params are present
        assert(!!this.url, 'Missing param: url');
        assert(!!this.expireTime, 'Missing param: expireTime');

        // Ensure expireTime value is valid
        assert(this.expireTime < 2147483647,
            'expireTime must be less than January 19, 2038 03:14:08 GMT ' +
            'due to the limits of UNIX time');
        assert(this.expireTime > (new Date().getTime() / 1000),
            'expireTime must be after the current time');

        return true;
    }
}

function assert(assertion: boolean, msg: string) {
    if (!assertion) {
        throw new Error(msg);
    }
}
