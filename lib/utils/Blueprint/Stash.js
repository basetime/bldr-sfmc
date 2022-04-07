const fs = require('fs');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const contextMap = require('../contextMap');
const { styles, width } = display.init();

module.exports = class Stash {
    constructor(bldr, localFile, store) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.store = store;
    }

    async status() {
        const stashArr = await this._getStashArr();

        const headers = [new Column(`Staged Files`, width.c4)];

        if (stashArr && stashArr.length) {
            const displayContent = stashArr.map(({ bldr }) => {
                return [new Column(`${bldr.folderPath}`, width.c4)];
            });
            display.render(headers, displayContent);
        } else {
            display.render(
                [],
                [
                    [
                        new Column(
                            `${styles.callout('No files stashed')}`,
                            width.c4
                        ),
                    ],
                ]
            );
        }
    }

    async clear() {
        const instance = await this._stateInstance();
        await this.store.stash.set({ [instance]: { stash: [] } });
        await this.status();
    }

    _saveStash(instance, obj) {
        const instanceStash = this.store.stash.get(instance);
        const stashArr = (instanceStash && instanceStash.stash) || [];
        let bldrId;

        if (
            Object.prototype.hasOwnProperty.call(obj, 'bldr') &&
            Object.prototype.hasOwnProperty.call(obj.bldr, 'bldrId')
        ) {
            bldrId = obj.bldr.bldrId;
        } else if (Object.prototype.hasOwnProperty.call(obj, 'bldrId')) {
            bldrId = obj.bldrId;
        }

        const stashIndex = stashArr.findIndex(
            (stashItem) => stashItem.bldr.bldrId === bldrId
        );
        if (stashIndex === -1) {
            stashArr.push(obj);
        } else {
            stashArr[stashIndex] = obj;
        }

        return this.store.stash.set({ [instance]: { stash: stashArr } });
    }

    async _getStashArr() {
        const instance = await this._stateInstance();
        const stash = this.store.stash.get(instance);
        return stash ? stash.stash : null;
    }

    async _setStashObj(dirPath, obj, newAsset) {
        let assetType;

        const instance = await this._stateInstance();
        const file = fs.readFileSync(obj.path);

        if (Object.prototype.hasOwnProperty.call(obj, 'assetType')) {
            assetType = obj.assetType.name;
        } else {
            assetType = obj.path.includes('.html') ? 'html' : 'json';
        }

        const categoryDetails = await this._getManifestFolderData(obj);

        if (newAsset) {
            switch (assetType) {
                case 'webpage':
                case 'htmlemail':
                    obj.views.html.content = `${file.toString()}`;
                    break;
                case 'codesnippetblock':
                    obj.content = `${file.toString()}`;
                    break;
                case 'textonlyemail':
                    obj.views.text.content = `${file.toString()}`;
                    break;
                default:
                    obj = JSON.parse(file);
            }

            if (categoryDetails) {
                obj.category.id = categoryDetails.id;
                obj.category.parentId = categoryDetails.parentId;
            }

            return obj;
        } else {
            switch (assetType) {
                case 'html':
                    obj.fileContent = `${file.toString()}`;
                    break;
                default:
                    obj = JSON.parse(file);
            }

            return this._saveStash(instance, obj);
        }
    }

    _stateInstance() {
        const state = this.store.state.get();
        const stateJSON = utils.assignObject(state);
        return stateJSON.instance;
    }

    async _getManifestFolderData(obj) {
        const dirPath = await this.localFile._getRootPath(contextMap);
        const manifestJSON = await this.localFile._getManifest(dirPath);
        const context = obj.bldr.context;
        const folders = manifestJSON[context]['folders'];
        const folderDetails = await utils.filePathDetails(obj.path);
        const folderResp = folders.find(
            ({ folderPath }) => folderDetails.projectPath === folderPath
        );
        return folderResp;
    }
};
