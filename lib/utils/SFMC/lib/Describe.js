module.exports = class Describe {
    constructor(soap) {
        this.soap = soap;
    }

    async describeSoap(object) {
        const describeResp = await this.soap.describe(object);
        let retrieve;

        if (
            Object.prototype.hasOwnProperty.call(describeResp, 'ObjectDefinition') &&
            Object.prototype.hasOwnProperty.call(describeResp.ObjectDefinition, 'Properties')
        ) {
            retrieve = describeResp.ObjectDefinition.Properties.map((prop) => {
                if (prop.IsRetrievable) {
                    return prop.Name;
                }

                return;
            });
        } else {
            retrieve = [];
        }

        return {
            resp: describeResp,
            retrieve: retrieve,
        };
    }
};
