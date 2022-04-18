const DataFolder = require("./definitions/DataFolder");

module.exports = class Folder {
    constructor(soap) {
        this.soap = soap;
    }

    async search(contentType, searchKey, searchTerm) {
        try {
            const resp = await this.soap.retrieve("DataFolder", DataFolder, {
                filter: {
                    leftOperand: {
                        leftOperand: "ContentType",
                        operator: "equals",
                        rightOperand: contentType,
                    },
                    operator: "AND",
                    rightOperand: {
                        leftOperand: searchKey,
                        operator: "like",
                        rightOperand: searchTerm,
                    },
                },
            });

            if (resp.OverallStatus !== "OK")
                throw new Error("Unable to Retrieve Folders");

            return resp;
        } catch (err) {
            console.log(err);
        }
    }

    async get(contentType, id, subfolders) {
        try {
            const resp = await this.soap.retrieve("DataFolder", DataFolder, {
                filter: {
                    leftOperand: {
                        leftOperand: "ContentType",
                        operator: "equals",
                        rightOperand: contentType,
                    },
                    operator: "AND",
                    rightOperand: {
                        leftOperand: subfolders ? "ParentFolder.ID" : "ID",
                        operator: "equals",
                        rightOperand: id,
                    },
                },
            });

            if (resp.OverallStatus !== "OK")
                throw new Error("Unable to Retrieve Folders");

            return resp;
        } catch (err) {
            return err;
        }
    }

    async create(req) {
        try {
            const resp = await this.soap.create(
                "DataFolder",
                {
                    ContentType: req.contentType,
                    Name: req.name,
                    Description: req.name,
                    CustomerKey: req.name,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                    ParentFolder: {
                        ID: req.parentId,
                    },
                },
                {}
            );

            return resp;
        } catch (err) {
            if (err.response.data.includes("cannot contain child folders")) {
                await this._updateAllowChildren(req);
                const errCreate = await this.create(req);
                return errCreate;
            }

            console.log("ERROR", err.response.data);
        }
    }

    async _updateAllowChildren(req) {
        try {
            const resp = await this.soap.update(
                "DataFolder",
                {
                    ID: req.parentId,
                    ContentType: req.contentType,
                    IsActive: true,
                    IsEditable: true,
                    AllowChildren: true,
                },
                {}
            );

            return resp;
        } catch (err) {
            console.log(err);
        }
    }
};
