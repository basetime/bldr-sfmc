const DataExtensionDefinition = require("./definitions/DataExtension");
const DataExtensionFieldDefinition = require("./definitions/DataExtensionField");

module.exports = class DataExtension {
    constructor(soap) {
        this.soap = soap;
    }

    async getAll() {
        try {
            const resp = await this.soap.retrieveBulk(
                "DataExtension",
                DataExtensionDefinition,
                {
                    filter: {
                        leftOperand: "Name",
                        operator: "isNotNull",
                        rightOperand: "",
                    },
                }
            );

            if (resp.OverallStatus !== "OK")
                throw new Error("Unable to Retrieve Folders");

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async get(name) {
        try {
            const resp = await this.soap.retrieve(
                "DataExtension",
                DataExtensionDefinition,
                {
                    filter: {
                        leftOperand: "Name",
                        operator: "equals",
                        rightOperand: name,
                    },
                }
            );

            if (resp.OverallStatus !== "OK")
                throw new Error("Unable to Retrieve Folders");

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async getFields(customerKey) {
        try {
            const resp = await this.soap.retrieve(
                "DataExtensionField",
                DataExtensionFieldDefinition,
                {
                    filter: {
                        leftOperand: "DataExtension.CustomerKey",
                        operator: "equals",
                        rightOperand: customerKey,
                    },
                }
            );

            if (resp.OverallStatus !== "OK")
                throw new Error("Unable to Retrieve Folders");

            return resp;
        } catch (err) {
            console.log(err);
        }
    }
};
