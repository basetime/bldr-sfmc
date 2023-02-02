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

        const headers = [new Column(`${styles.command('Staged Files')}`, width.c4)];

        if (stashArr && stashArr.length) {
            const displayContent = stashArr.map(({ bldr }) => {
                return [new Column(`${bldr.folderPath}`, width.c4)];
            });
            display.render(headers, displayContent);
        } else {
            const headers = [new Column(`${styles.command('Staged Files')}`, width.c4)];

            display.render(headers, [[new Column(`${styles.callout('No Files Staged')}`, width.c4)]]);
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

        const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldr.bldrId === bldrId);

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
        let stashContent;

        const instance = await this._stateInstance();
        let file = fs.readFileSync(obj.path);

        if (Object.prototype.hasOwnProperty.call(obj, 'assetType')) {
            assetType = obj.assetType.name;
        } else {
            if (obj.path.includes('.html') || obj.path.includes('.js') || obj.path.includes('.sql')) {
                assetType = 'string';
            } else {
                assetType = 'json';
            }
        }

        const categoryDetails = await this._getManifestFolderData(obj);

        if (newAsset) {
            switch (assetType) {
                case 'webpage':
                case 'htmlemail':
                    stashContent = `${await utils.scrubConfig(file.toString())}`;
                    obj.views.html.content = stashContent;
                    break;
                case 'codesnippetblock':
                    stashContent = `${await utils.scrubConfig(file.toString())}`;
                    obj.content = stashContent;
                    break;
                case 'textonlyemail':
                    stashContent = `${await utils.scrubConfig(file.toString())}`;
                    obj.views.text.content = stashContent;
                    break;
                default:
                    stashContent = `${await utils.scrubConfig(JSON.stringify(file))}`;
                    obj = JSON.parse(stashContent);
            }

            if (categoryDetails) {
                obj.category.id = categoryDetails.id;
                obj.category.parentId = categoryDetails.parentId;
            }

            await this.localFile.createFile(obj.path, stashContent);
            return obj;
        } else {
            switch (assetType) {
                case 'string':
                    stashContent = `${await utils.scrubConfig(file.toString())}`;
                    obj.fileContent = stashContent;
                    break;
                default:
                    stashContent = `${await utils.scrubConfig(JSON.stringify(file))}`;
                    obj = JSON.parse(stashContent);
            }

            let updatedFileContent = obj.fileContent || obj;
            await this.localFile.createFile(obj.path, updatedFileContent);
            await this._saveStash(instance, obj);
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
        const folderResp = folders.find(({ folderPath }) => folderDetails.projectPath === folderPath);
        return folderResp;
    }

    async _getManifestAssetData() {
        const dirPath = await this.localFile._getRootPath(contextMap);
        const manifestJSON = await this.localFile._getManifest(dirPath);
        return manifestJSON;
    }
};
