const { getProperties } = require('sfmc-soap-object-reference');

module.exports = class DataExtension {
    constructor(soap) {
        this.soap = soap;
    }

    async getAll() {
        try {
            const properties = await getProperties('DataExtension');
            const resp = await this.soap.retrieveBulk('DataExtension', properties, {
                filter: {
                    leftOperand: 'Name',
                    operator: 'isNotNull',
                    rightOperand: '',
                },
            });

            if (resp.OverallStatus !== 'OK') throw new Error('Unable to Retrieve Folders');

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

            if (resp.OverallStatus !== 'OK') throw new Error('Unable to Retrieve Data Extension');

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async getFields(customerKey) {
        try {
            const properties = await getProperties('DataExtensionField');
            const resp = await this.soap.retrieve('DataExtensionField', properties, {
                filter: {
                    leftOperand: 'DataExtension.CustomerKey',
                    operator: 'equals',
                    rightOperand: customerKey,
                },
            });

            if (resp.OverallStatus !== 'OK') throw new Error('Unable to Retrieve Folders');

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async postAsset(dataExtension) {
        try {
            const resp = await this.soap.create('DataExtension', dataExtension, {});
            return resp;
        } catch (err) {
            if (
                Object.prototype.hasOwnProperty.call(err, 'JSON') &&
                Object.prototype.hasOwnProperty.call(err.JSON, 'Results') &&
                err.JSON.Results.length > 0 &&
                Object.prototype.hasOwnProperty.call(err.JSON.Results[0], 'StatusMessage')
            ) {
                return err.JSON.Results[0];
            }

            return {
                status: err.response.status,
                statusText: err.response.statusText,
            };
        }
    }
};
