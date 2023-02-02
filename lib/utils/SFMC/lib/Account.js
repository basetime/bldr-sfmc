const ListDefinition = require('./definitions/List');
const AccountDefinition = require('./definitions/Account');

module.exports = class Account {
    constructor(soap) {
        this.soap = soap;
    }

    async getAccountMids() {
        try {
            const results = [];
            const req = await this.soap.retrieve('List', ListDefinition, {
                QueryAllAccounts: true,
                filter: {
                    leftOperand: 'ListName',
                    operator: 'equals',
                    rightOperand: 'All Subscribers',
                },
            });

            if (req.OverallStatus.includes('Error:')) {
                throw new Error(req.OverallStatus);
            }

            await req.Results.forEach((a) => {
                results.push(a.Client.ID);
            });

            return {
                OverallStatus: req.OverallStatus,
                Results: results,
            };
        } catch (err) {
            return {
                OverallStatus: err,
                Error: err.message,
            };
        }
    }

    async getAccountDetail(mid) {
        try {
            const req = await this.soap.retrieve('Account', AccountDefinition, {
                QueryAllAccounts: true,
                filter: {
                    leftOperand: 'ID',
                    operator: 'equals',
                    rightOperand: mid,
                },
            });

            if (req.OverallStatus.includes('Error:')) throw new Error(req.OverallStatus);

            return req;
        } catch (err) {
            console.log(err);
        }
    }

    async getAllAccountDetails(mids) {
        try {
            let midsArray;
            const accountDetails = [];

            if (mids && Array.isArray(mids)) {
                midsArray = mids;
            }
            if (mids && !Array.isArray(mids)) {
                midsArray = new Array(mids);
            } else {
                const midsReq = await this.getAccountMids();

                if (midsReq.OverallStatus !== 'OK') throw new Error(midsReq.OverallStatus);

                midsArray = midsReq.Results;
            }

            for (let m in midsArray) {
                const mid = midsArray[m];
                const accountDetail = await this.getAccountDetail(mid);
                accountDetails.push(...accountDetail.Results);
            }

            return {
                OverallStatus: 'OK',
                Results: accountDetails,
            };
        } catch (err) {
            return {
                OverallStatus: err,
            };
        }
    }
};
