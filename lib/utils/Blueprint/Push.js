const remove = require('lodash.remove');
const utils = require('../utils');
const contextMap = require('../contextMap');
const Column = require('../help/Column');
const display = require('../displayStyles');
const { styles, width } = display.init();

module.exports = class Push {
    constructor(bldr, localFile, contextMap, store) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
    }

    async push(stateInit, stash) {
        // get state obj
        const stateObj = stateInit.get();
        const instance = stateObj.instance;

        // get stash for instance for state instance
        const stashRaw = stash.get(instance);
        const stashJSON = utils.assignObject(stashRaw);
        const bldrIds = stashJSON.stash.map(({ bldr }) => bldr.bldrId);

        // get local manifest file
        const rootPath = this.localFile._getRootPath(contextMap);
        const manifestPath = `${rootPath}.local.manifest.json`;
        const manifestJSON = this.localFile._parseJSON(manifestPath);
        const contextArr = this.contextMap.map((ctx) => ctx.context);

        for (const ctx in manifestJSON) {
            if (contextArr.includes(ctx)) {
                const manifestAssets = manifestJSON[ctx]['assets'];
                const postAssets = await this._isolateManifestAssetsForUpdate(manifestAssets, bldrIds);

                const updatedManifestAssets = await this._updateManifestAssets(postAssets, stashJSON);

                const newAssets = await this._isolateNewAssets(manifestAssets, stashJSON);

                await this.updateSFMCAssets(updatedManifestAssets, stashJSON, rootPath, ctx, instance);

                await this.updateSFMCAssets(newAssets, stashJSON, rootPath, ctx, instance);
            }
        }
    }

    async updateSFMCAssets(apiAssets, stashJSON, rootPath, ctx, instance) {
        const updatedStash = await this._postToSFMC(ctx, apiAssets, stashJSON.stash, rootPath);

        await this.localFile.manifestJSON(ctx, { assets: updatedStash.success }, rootPath);

        stashJSON.stash = updatedStash.stashArr;
        this.store.stash.set(instance, stashJSON);

        if (updatedStash && updatedStash.success && updatedStash.success.length !== 0) {
            const msg = updatedStash.method === 'POST' ? `${ctx}: Created Assets` : `${ctx}: Updated Assets`;

            const successHeaders = [new Column(`${styles.command(msg)}`, width.c3)];

            const successDisplayContent = updatedStash.success.map((result) => {
                const name = result.name || result.Name;
                return [new Column(`${name}`, width.c3)];
            });

            display.render(successHeaders, successDisplayContent);
        }

        if (updatedStash && updatedStash.errors && updatedStash.errors.length !== 0) {
            const errorsHeaders = [
                new Column(`${styles.error('Errored Asset')}`, width.c2),
                new Column(`${styles.error('Errored Message')}`, width.c2),
            ];

            const errorsDisplayContent = updatedStash.errors.map((result) => {
                return [new Column(`${result.name}`, width.c2), new Column(`${result.error}`, width.c2)];
            });

            display.render(errorsHeaders, errorsDisplayContent);
        }
    }

    async _postToSFMC(ctx, apiAssets, stashArr, rootPath) {
        const success = [];
        const errors = [];
        let method;
        let content;

        for (const a in apiAssets) {
            let asset = apiAssets[a];
            const bldrId = asset.bldrId;
            const folderPath = (asset.category && asset.category.folderPath) || asset.folderPath;

            let resp;

            if (ctx === 'automationStudio') {
                if (Object.prototype.hasOwnProperty.call(asset, 'create') && asset.create) {
                    // method = 'POST';
                    // delete asset.create;
                    // resp = await this.bldr.automation.postAsset(asset);

                    const errorsDisplayContent = [
                        [
                            new Column(
                                `Creation of Automation Studio assets are not supported yet. Coming Soon!`,
                                width.c4
                            ),
                        ],
                    ];

                    display.render([], errorsDisplayContent);
                } else {
                    method = 'PATCH';
                    resp = await this.bldr.automation.patchAsset(asset);
                }
            } else if (ctx === 'contentBuilder') {
                //Update asset content with configurations before posting
                content = await utils.getAssetContent(asset);
                let buildContent = await utils.replaceConfig(content);
                asset = await utils.updateAssetContent(asset, buildContent);

                if (Object.prototype.hasOwnProperty.call(asset, 'create') && asset.create) {
                    method = 'POST';
                    delete asset.create;
                    resp = await this.bldr.asset.postAsset(asset);
                } else {
                    method = 'PUT';
                    resp = await this.bldr.asset.putAsset(asset);
                }
            } else if (ctx === 'dataExtension') {
                if (Object.prototype.hasOwnProperty.call(asset, 'create') && asset.create) {
                    let assetContent = JSON.parse(asset.content);
                    delete assetContent.bldrId;
                    delete asset.create;

                    const payload = await utils.capitalizeKeys(assetContent);
                    payload.Fields = payload.Fields.map((field) => {
                        return {
                            Field: field,
                        };
                    });

                    method = 'POST';
                    resp = await this.bldr.dataExtension.postAsset(payload);
                } else {
                    method = 'PUT';
                    resp = await this.bldr.asset.putAsset(asset);
                }
            }

            //Update asset content with configurations before posting
            content = await utils.getAssetContent(asset);
            let manifestContent = await utils.scrubConfig(content);
            asset = await utils.updateAssetContent(asset, manifestContent);

            if (!resp && resp.status && resp.status !== 200) {
                errors.push({
                    name: asset.name || asset.Name,
                    error: (resp && resp.statusText) || 'Unable to provide error response',
                });
            } else {
                let objectIdKey = asset && asset.assetType && asset.assetType.objectIdKey;

                if (!Object.prototype.hasOwnProperty.call(asset, 'id')) asset.id = resp.id || asset[objectIdKey];

                if (!Object.prototype.hasOwnProperty.call(asset, 'customerKey'))
                    asset.customerKey = resp.customerKey || resp.key || asset.CustomerKey;

                success.push(asset);

                this.localFile.appendBLDR(
                    {
                        folderPath: `${folderPath}/${asset.name}.html`,
                        bldrId,
                        id: asset.id,
                        context: ctx,
                    },
                    rootPath
                );

                remove(stashArr, (item) => item.bldr.bldrId === bldrId);
            }
        }

        return {
            method,
            stashArr,
            success,
            errors,
        };
    }

    async _updateManifestAssets(postAssets, stashJSON) {
        const updates = postAssets.map((asset) => {
            const assetBldrId = asset.bldrId;
            const stashFile = stashJSON.stash.find((stashItem) => {
                return stashItem.bldr.bldrId === assetBldrId;
            });

            let updatedFile = stashFile.fileContent;
            const assetType = asset.assetType.name;

            switch (assetType) {
                case 'webpage':
                case 'htmlemail':
                    asset.views.html.content = updatedFile;
                    break;
                case 'codesnippetblock':
                case 'htmlblock':
                case 'jscoderesource':
                    asset.content = updatedFile;
                    break;
                case 'textonlyemail':
                    asset.views.text.content = updatedFile;
                    break;
                case 'queryactivity':
                    asset.queryText = updatedFile;
                    break;
                case 'ssjsactivity':
                    asset.script = updatedFile;
                    break;
                default:
                    asset = JSON.parse(updatedFile);
            }

            if (Object.prototype.hasOwnProperty.call(asset, 'create')) {
                delete asset.create;
            }

            return asset;
        });

        return updates;
    }

    _isolateManifestAssetsForUpdate(manifestAssets, bldrIds) {
        // isolate post assets
        const postAssets = manifestAssets.map((asset) => {
            const bldrId = asset.bldrId;
            if (bldrIds.includes(bldrId)) return asset;
        });

        return postAssets.filter(Boolean);
    }

    _isolateNewAssets(manifestAssets, stashJSON) {
        const postAssets = stashJSON.stash.map((stashItem) => {
            return Object.prototype.hasOwnProperty.call(stashItem, 'create') && stashItem.create && stashItem.post;
        });

        return postAssets.filter(Boolean);
    }
};
