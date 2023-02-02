module.exports = class Asset {
    constructor(rest) {
        this.rest = rest;
    }

    // TODO: add auto pagination
    async getByFolderArray(folderIds) {
        try {
            if (!Array.isArray(folderIds)) throw new Error('folderIds argument must be an array');

            return await this.rest.post('/asset/v1/content/assets/query', {
                page: {
                    page: 1,
                    pageSize: 200,
                },
                query: {
                    property: 'category.id',
                    simpleOperator: 'in',
                    value: folderIds,
                },
                sort: [
                    {
                        property: 'id',
                        direction: 'ASC',
                    },
                ],
            });
        } catch (err) {
            console.log(err);
        }
    }

    async getById(id) {
        try {
            if (!id) throw new Error('id argument is required');

            const assetResp = await this.rest.get(`/asset/v1/content/assets/${id}`);

            return new Array(assetResp);
        } catch (err) {
            return err;
        }
    }

    async getByLegacyId(id) {
        try {
            if (!id) throw new Error('id argument is required');

            const assetResp = await this.rest.post('/asset/v1/content/assets/query', {
                page: {
                    page: 1,
                    pageSize: 50,
                },
                query: {
                    property: 'data.email.legacy.legacyId',
                    simpleOperator: 'equal',
                    value: id,
                },
            });

            if (!Object.prototype.hasOwnProperty.call(assetResp, 'items') && assetResp.items.length === 0)
                throw new Error(`No Asset Found for ${id}`);

            return assetResp.items;
        } catch (err) {
            console.log(err);
        }
    }

    async getByNameAndFolder(assetName, assetFolder) {
        try {
            return await this.rest.post('/asset/v1/content/assets/query', {
                page: {
                    page: 1,
                    pageSize: 200,
                },
                query: {
                    leftOperand: {
                        property: 'name',
                        simpleOperator: 'equals',
                        value: assetName,
                    },
                    logicalOperator: 'AND',
                    rightOperand: {
                        property: 'category.name',
                        simpleOperator: 'equals',
                        value: assetFolder,
                    },
                },
                sort: [
                    {
                        property: 'name',
                        direction: 'DESC',
                    },
                ],
            });
        } catch (err) {
            console.log(err);
        }
    }

    async search(searchKey, searchTerm) {
        try {
            return await this.rest.post('/asset/v1/content/assets/query', {
                page: {
                    page: 1,
                    pageSize: 200,
                },
                query: {
                    property: searchKey,
                    simpleOperator: 'like',
                    value: searchTerm,
                },
                sort: [
                    {
                        property: 'name',
                        direction: 'DESC',
                    },
                ],
            });
        } catch (err) {
            console.log(err);
        }
    }

    async postAsset(asset) {
        try {
            const resp = await this.rest.post(`/asset/v1/content/assets/`, asset);

            return resp;
        } catch (err) {
            // console.log('asset err', JSON.stringify(err.response.data, null, 2));
            return {
                status: 'ERROR',
                statusText: err.response.data.validationErrors[0].message,
            };
        }
    }

    async putAsset(asset) {
        try {
            if (!asset.id) throw new Error('Asset Id is required');

            const assetId = asset.id;
            const resp = await this.rest.put(`/asset/v1/content/assets/${assetId}`, asset);
            return resp;
        } catch (err) {
            console.log(JSON.stringify(err.response.data, null, 2));
            return {
                status: 'ERROR',
                statusText: err.response.data.validationErrors[0].message,
            };
        }
    }

    async getImageFile(id) {
        if (!id) throw new Error('Asset Id is required');

        const resp = await this.rest.get(`/asset/v1/content/assets/${id}/file`);
        return resp;
    }
};
