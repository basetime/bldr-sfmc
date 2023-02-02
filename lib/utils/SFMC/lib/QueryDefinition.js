const QueryDefinitionDefinition = require('./definitions/QueryDefinition');

module.exports = class QueryDefinition {
    constructor(rest, soap) {
        this.rest = rest;
        this.soap = soap;
    }

    async getAllDefinitions() {
        try {
            const resp = await this.soap.retrieve('QueryDefinition', QueryDefinitionDefinition, {});

            if (resp.OverallStatus !== 'OK') throw new Error(resp.OverallStatus);

            return resp;
        } catch (err) {
            return err;
        }
    }

    async getNewUpdatedDefinitions(date) {
        try {
            const resp = await this.soap.retrieve('QueryDefinition', QueryDefinitionDefinition, {
                filter: {
                    leftOperand: {
                        leftOperand: 'ModifiedDate',
                        operator: 'greaterThan',
                        rightOperand: `${date}T00:00:00`,
                    },
                    operator: 'OR',
                    rightOperand: {
                        leftOperand: 'CreatedDate',
                        operator: 'greaterThan',
                        rightOperand: `${date}T00:00:00`,
                    },
                },
            });

            if (resp.OverallStatus !== 'OK') throw new Error(resp.OverallStatus);

            return resp;
        } catch (err) {
            return err;
        }
    }
};
