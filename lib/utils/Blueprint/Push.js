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
                const postAssets = await this._isolateManifestAssetsForUpdate(
                    manifestAssets,
                    bldrIds
                );

                const updatedManifestAssets = await this._updateManifestAssets(
                    postAssets,
                    stashJSON
                );

                const newAssets = await this._isolateNewAssets(
                    manifestAssets,
                    stashJSON
                );

                await this.updateSFMCAssets(
                    updatedManifestAssets,
                    stashJSON,
                    rootPath,
                    ctx,
                    instance
                );

                await this.updateSFMCAssets(
                    newAssets,
                    stashJSON,
                    rootPath,
                    ctx,
                    instance
                );
            }
        }
    }

    async updateSFMCAssets(apiAssets, stashJSON, rootPath, ctx, instance) {
        console.log('ctx', ctx);

        const updatedStash = await this._postToSFMC(
            ctx,
            apiAssets,
            stashJSON.stash,
            rootPath
        );

        await this.localFile.manifestJSON(
            ctx,
            { assets: updatedStash.success },
            rootPath
        );

        stashJSON.stash = updatedStash.stashArr;
        this.store.stash.set(instance, stashJSON);

        if (
            updatedStash &&
            updatedStash.success &&
            updatedStash.success.length !== 0
        ) {
            const msg =
                updatedStash.method === 'POST'
                    ? 'Created Assets'
                    : 'Updated Assets';

            const successHeaders = [
                new Column(`${styles.command(msg)}`, width.c2),
            ];

            const successDisplayContent = updatedStash.success.map((result) => {
                return [new Column(`${result.name}`, width.c2)];
            });

            display.render(successHeaders, successDisplayContent);
        }

        if (
            updatedStash &&
            updatedStash.errors &&
            updatedStash.errors.length !== 0
        ) {
            const errorsHeaders = [
                new Column(`${styles.error('Errored Asset')}`, width.c2),
                new Column(`${styles.error('Errored Message')}`, width.c2),
            ];

            const errorsDisplayContent = updatedStash.errors.map((result) => {
                return [
                    new Column(`${result.name}`, width.c2),
                    new Column(`${result.error}`, width.c2),
                ];
            });

            display.render(errorsHeaders, errorsDisplayContent);
        }
    }

    async _postToSFMC(ctx, apiAssets, stashArr, rootPath) {
        const success = [];
        const errors = [];
        let method;

        for (const a in apiAssets) {
            const asset = apiAssets[a];
            const bldrId = asset.bldrId;
            const folderPath = asset.category.folderPath;

            let resp;

            if (
                Object.prototype.hasOwnProperty.call(asset, 'create') &&
                asset.create
            ) {
                method = 'POST';
                delete asset.create;
                resp = await this.bldr.asset.postAsset(asset);
            } else {
                method = 'PUT';
                resp = await this.bldr.asset.putAsset(asset);
            }

            if (resp.status !== 200 && !resp.id) {
                errors.push({
                    name: asset.name,
                    error: resp.statusText,
                });
            } else {
                if (!Object.prototype.hasOwnProperty.call(asset, 'id'))
                    asset.id = resp.id;

                if (!Object.prototype.hasOwnProperty.call(asset, 'customerKey'))
                    asset.customerKey = resp.customerKey;

                success.push(asset);
                this.localFile.appendBLDR(
                    {
                        folderPath,
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

            const updatedFile = stashFile.fileContent;
            const assetType = asset.assetType.name;

            switch (assetType) {
                case 'webpage':
                case 'htmlemail':
                    asset.views.html.content = updatedFile;
                    break;
                case 'codesnippetblock':
                case 'htmlblock':
                    asset.content = updatedFile;
                    break;
                case 'textonlyemail':
                    asset.views.text.content = updatedFile;
                    break;
                case 'queryactivity':
                    asset.queryText = updatedFile;
                    break;
                case 'scriptactivity':
                    asset.script = updatedFile;
                    break;
                default:
                    asset = updatedFile;
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
            return (
                Object.prototype.hasOwnProperty.call(stashItem, 'create') &&
                stashItem.create &&
                stashItem.post
            );
        });

        return postAssets.filter(Boolean);
    }
};
