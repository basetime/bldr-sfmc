const yargsInteractive = require('yargs-interactive');
const assetDefinitions = require('../sfmc_api_definitions');
const fs = require('fs');
const process = require('process');
const getFiles = require('node-recursive-directory');
const utils = require('../utils');

module.exports = class Add {
    constructor(bldr, localFile, stash, contextMap, store) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.stash = stash;
        this.contextMap = contextMap;
        this.store = store;
    }

    async addAll() {
        const instance = await this._stateInstance();

        const dirPath = await this.localFile._getRootPath(this.contextMap);
        const contextsArr = this.contextMap.map(
            (ctx) => this.localFile._fileExists(`./${ctx.root}`) && ctx.root
        );
        const contexts = contextsArr.filter(Boolean);
        const cwdPath = process.cwd();
        let ctxFiles = new Array();

        // if dir is root folder
        if (dirPath === './') {
            // iterate all contexts and add files
            for (const c in contexts) {
                ctxFiles.push(...(await getFiles(`./${contexts[c]}`)));
            }
        } else {
            // get files from current working directory
            ctxFiles.push(...(await getFiles(`${cwdPath}`)));
        }

        const newFiles = await this._gatherAllFiles(ctxFiles, dirPath);
        await this._setNewAssets(
            newFiles.postFileOptions,
            newFiles.postFiles,
            instance,
            dirPath
        );

        await this.stash.status()
    }

    async addFiles(argv) {
        const instance = await this._stateInstance();
        const dirPath = await this.localFile._getRootPath(this.contextMap);

        const cwd = process.cwd();
        const projectFiles = await getFiles('./');
        const argvArr = argv._;
        argvArr.shift();

        let ctxFiles = new Array();

        for (const a in argvArr) {
            ctxFiles.push(`${cwd}/${argvArr[a]}`);
        }

        const newFiles = await this._gatherAllFiles(ctxFiles, dirPath);
        await this._setNewAssets(
            newFiles.postFileOptions,
            newFiles.postFiles,
            instance,
            dirPath
        );

        await this.stash.status()
    }

    async _gatherAllFiles(ctxFiles, dirPath) {
        const bldrJSON = this.localFile._getBldrJSON(dirPath);
        let bldrObj;

        const postFiles = new Array();

        let postFileOptions = {
            interactive: { default: true },
        };

        for (const c in ctxFiles) {
            const ctxFile = ctxFiles[c];
            const bldrFilter = bldrJSON.filter((bldr) => {
                return ctxFile.includes(bldr.folderPath) ? true : false;
            });

            const checkBldr = bldrFilter.length === 0 ? false : true;

            if (checkBldr) {
                bldrObj = {
                    path: ctxFile,
                    bldr: bldrFilter[0],
                };

                await this.stash._setStashObj(ctxFile, bldrObj, false);
            } else {
                const bldrId = utils.guid();
                const ctx = utils.ctx(ctxFile);
                const folderPath = ctxFile.substring(ctxFile.indexOf(ctx.root));

                bldrObj = {
                    path: ctxFile,
                    create: true,
                    bldr: {
                        context: ctx.context,
                        bldrId,
                        folderPath,
                    },
                };

                postFiles.push(bldrObj);
                postFileOptions[bldrId] = {
                    type: 'list',
                    describe: `What type of asset is ${folderPath}`,
                    choices: ['htmlemail', 'codesnippetblock', 'htmlblock'],
                    prompt: 'always',
                };
            }
        }

        return {
            postFileOptions,
            postFiles,
        };
    }

    async checkStashArr(file) {
        try {
            const stashArr = await this.stash._getStashArr();

            if (stashArr.length !== 0) {
                return stashArr.filter((stashItem) => {
                    return file === stashItem.path;
                });
            } else {
                return [];
            }
        } catch (err) {
            console.log(err);
        }
    }


    _stateInstance() {
        const state = this.store.state.get();
        const stateJSON = utils.assignObject(state);
        return stateJSON.instance;
    }


    _prepNewFile(dirPath, filePath) {
        const bldrId = utils.guid();
        const bldrObj = [
            {
                bldrId,
                folderPath: filePath,
            },
        ];

        return this.stash._setStashObj(dirPath, bldrObj);
    }

    _setNewAssets(postFileOptions, postFiles, instance, dirPath) {
        return yargsInteractive()
            .usage('$0 <command> [args]')
            .interactive(postFileOptions)
            .then(async (optionsResult) => {
                // console.log(optionsResult)

                for (const o in optionsResult) {
                    const postFile = postFiles.find(
                        (post) => post.bldr.bldrId === o
                    );

                    if (typeof postFile !== 'undefined') {
                        let postObj;
                        let content;
                        let bldrObj = postFile.bldr;

                        const assetType = optionsResult[o];
                        const bldrId = bldrObj.bldrId;
                        const folderPath = bldrObj.folderPath;
                        const categoryDetails = await utils.filePathDetails(
                            postFile.path
                        );
                        const fileName = categoryDetails.fileName;
                        const folderName = categoryDetails.folderName;

                        const assetName = fileName.substring(
                            0,
                            fileName.indexOf('.')
                        );

                        const file = fs.readFileSync(postFile.path);

                        if (
                            postFile.path.includes('.html') ||
                            postFile.path.includes('.js')
                        ) {
                            content = `${file.toString()}`;
                        } else {
                            content = JSON.parse(file);
                        }

                        let manifestFolder =
                            await this.stash._getManifestFolderData(postFile);

                        if (!manifestFolder) {
                            await this.addNewFolder(categoryDetails, dirPath);
                            manifestFolder =
                                await this.stash._getManifestFolderData(
                                    postFile
                                );
                        } else {
                            console.log(manifestFolder.id);
                        }

                        const asset = {
                            bldrId,
                            assetName,
                            content,
                            category: {
                                id: manifestFolder.id,
                                parentId: manifestFolder.parentId,
                                folderName,
                                folderPath,
                            },
                        };

                        switch (assetType) {
                            case 'htmlemail':
                                postObj = await assetDefinitions.htmlemail(
                                    asset
                                );
                                break;

                            case 'codesnippetblock':
                            case 'htmlblock':
                                postObj =
                                    await assetDefinitions.contentBlock(
                                        asset,
                                        assetType
                                    );
                                break;
                        }
                        postObj.create = true;

                        postFile['post'] = postObj;
                        await this.stash._saveStash(instance, postFile);
                    }
                }
            });
    }

    async addNewFolder(categoryDetails, dirPath) {
        const projectPath = categoryDetails.projectPath;
        const pathArr = projectPath.split('/');
        const rootFolder = pathArr.shift();

        const ctx = utils.ctx(projectPath);
        const context = ctx.context;

        const manifestJSON = await this.localFile._getManifest(dirPath);
        const manifestFolders = manifestJSON[context]['folders'];

        let checkPath = rootFolder;
        let parentId;
        let createFolder;

        for (const p in pathArr) {
            const folder = pathArr[p];
            let updatedFolder = 0;

            checkPath = `${checkPath}/${folder}`;
            const manifestFolderObj = manifestFolders.find(
                (manifestFolder) => manifestFolder.folderPath === checkPath
            );

            if (typeof manifestFolderObj === 'undefined') {
                createFolder = await this.bldr.folder.create({
                    name: folder,
                    parentId,
                    contentType: 'asset',
                });

                do {
                    const folderObj = {
                        id: createFolder.Results[0].NewID,
                        name: folder,
                        parentId: parentId,
                        categoryType: 'asset',
                        rootFolder: false,
                        folderPath: checkPath,
                    };

                    manifestFolders.push(folderObj);
                    parentId = createFolder.Results[0].NewID;

                    updatedFolder++;
                } while (
                    typeof createFolder !== 'undefined' &&
                    updatedFolder === 0
                );
            } else {
                parentId = manifestFolderObj.id;
            }
        }

        // Update ManifestJSON file with new folder
        await this.localFile.manifestJSON(
            context,
            { folders: manifestFolders },
            dirPath
        );
    }
};
