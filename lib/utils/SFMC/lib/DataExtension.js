const { getProperties } = require('sfmc-soap-object-reference');

module.exports = class DataExtension {
    constructor(soap) {
        this.soap = soap;
    }

    async getAll() {
        try {
            const properties = await getProperties('DataExtension');
            const resp = await this.soap.retrieveBulk(
                'DataExtension',
                properties,
                {
                    filter: {
                        leftOperand: 'Name',
                        operator: 'isNotNull',
                        rightOperand: '',
                    },
                }
            );

            if (resp.OverallStatus !== 'OK')
                throw new Error('Unable to Retrieve Folders');

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async get(name) {
        try {
            const properties = await getProperties('DataExtension');
            const resp = await this.soap.retrieve('DataExtension', properties, {
                filter: {
                    leftOperand: 'Name',
                    operator: 'equals',
                    rightOperand: name,
                },
            });

            if (resp.OverallStatus !== 'OK')
                throw new Error('Unable to Retrieve Data Extension');

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async getFields(customerKey) {
        try {
            const properties = await getProperties('DataExtensionField');
            const resp = await this.soap.retrieve(
                'DataExtensionField',
                properties,
                {
                    filter: {
                        leftOperand: 'DataExtension.CustomerKey',
                        operator: 'equals',
                        rightOperand: customerKey,
                    },
                }
            );

            if (resp.OverallStatus !== 'OK')
                throw new Error('Unable to Retrieve Folders');

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

};
