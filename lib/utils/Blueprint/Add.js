const yargsInteractive = require('yargs-interactive');
const assetDefinitions = require('../sfmc_api_definitions');
const fs = require('fs');
const process = require('process');
const getFiles = require('node-recursive-directory');
const utils = require('../utils');
const Column = require('../help/Column');
const display = require('../displayStyles');
const { styles, width } = display.init();

/**
 * Handles all add functionality
 * Works with Stash backend file
 */
module.exports = class Add {
    constructor(bldr, localFile, stash, contextMap, store) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.stash = stash;
        this.contextMap = contextMap;
        this.store = store;
    }

    /**
     * Method to gather all files in CWD and add to the temp Stash
     * Prepares JSON for POST/PUT to SFMC APIs
     * Will add all files starting at the CWD request was made, including all files in subfolders
     */
    async addAll() {
        try {
            const instance = await this.stash._stateInstance();

            // Get the root directory for the project being worked on
            const dirPath = await this.localFile._getRootPath(this.contextMap);

            // Get the current working directory that the [add] command was triggered
            const cwdPath = process.cwd();

            // Identify the context for request
            const contextsArr = this.contextMap.map((ctx) => this.localFile._fileExists(`./${ctx.root}`) && ctx.root);

            // Isolate context from Array
            const contexts = contextsArr.filter((ctx) => ctx !== 'Data Extensions').filter(Boolean);
            // Store all complete file paths for files in CWD and subdirectories
            let ctxFiles = new Array();

            // if dir is root folder
            if (dirPath === './') {
                // iterate all contexts and add files
                for (const c in contexts) {
                    ctxFiles.push(...(await getFiles(`./${contexts[c]}`)));
                }
            } else {
                // get files from current working directory and subdirectories
                ctxFiles.push(...(await getFiles(`${cwdPath}`)));
            }

            // Gather all file content/details for each file path
            // Separate out existing files and newly created files
            // Add existing files to the Stash with the updated file content
            const newFiles = await this._gatherAllFiles(ctxFiles, dirPath);

            // Pass isolated new files into a flow to configure asset types prior to being added to the Stash
            await this._setNewAssets(newFiles.postFileOptions, newFiles.postFiles, instance, dirPath);

            const stashArr = await this.stash._getStashArr();

            if (stashArr.length > 0) {
                // After all processing, prompt status
                await this.stash.status();
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Handles all file functionality
     * Works with Stash backend file
     *
     * @param {object} argv user input including command and array of file paths to add to Stash
     */
    async addFiles(argv) {
        try {
            // Get current set state
            const instance = await this.stash._stateInstance();

            // Get the root directory for the project being worked on
            const dirPath = await this.localFile._getRootPath(this.contextMap);

            // Get the current working directory that the [add] command was triggered
            const cwd = process.cwd();
            const argvArr = argv._;

            // Remove command from input array leaving only file names
            argvArr.shift();

            // Store all complete file paths for files in CWD and subdirectories
            let ctxFiles = new Array();

            // Compile full folder paths based on CWD path and user provided paths
            for (const a in argvArr) {
                ctxFiles.push(`${cwd}/${argvArr[a]}`);
            }

            // Pass isolated new files into a flow to configure asset types prior to being added to the Stash
            const newFiles = await this._gatherAllFiles(ctxFiles, dirPath);

            await this._setNewAssets(newFiles.postFileOptions, newFiles.postFiles, instance, dirPath);

            const stashArr = await this.stash._getStashArr();

            if (stashArr.length > 0) {
                // After all processing, prompt status
                await this.stash.status();
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Compiles all
     *
     * @param {object} ctxFiles array of file paths to gather
     * @param {string} dirPath project root folder
     * @returns {object} of new file configuration options
     */
    async _gatherAllFiles(ctxFiles, dirPath) {
        let bldrObj;

        // Get .bldrJSON file to check for existing files
        const bldrJSON = this.localFile._getBldrJSON(dirPath);

        // Store all complete objects for Stash
        const postFiles = new Array();

        // Initiate configuration for new file prompts
        let postFileOptions = {
            interactive: { default: true },
        };

        // Iterate through files array to check if existing files
        for (const c in ctxFiles) {
            const ctxFile = ctxFiles[c];

            // Check bldrJSON file if there is a match based on compiled folder paths
            const bldrFilter = bldrJSON.filter((bldr) => {
                return ctxFile.includes(bldr.folderPath) ? true : false;
            });

            // Set Boolean for logic based on filter
            const checkBldr = bldrFilter.length === 0 ? false : true;

            if (checkBldr) {
                // If the file exists add bldrJSON data and path to the stash to prep push command
                bldrObj = {
                    path: ctxFile,
                    bldr: bldrFilter[0],
                };

                // Set compiled object as a Stash Object
                await this.stash._setStashObj(ctxFile, bldrObj, false);
            } else {
                if (ctxFile.includes('Automation Studio')) {
                    console.log('Creating new assets in Automation Studio is in progress!');
                } else {
                    const bldrId = utils.guid();

                    // Get context based on folder path
                    const ctx = utils.ctx(ctxFile);

                    // Set folder path (from context root) based on context
                    const folderPath = ctxFile.substring(ctxFile.indexOf(ctx.root));

                    // Initaite bldr object for new file POST
                    bldrObj = {
                        path: ctxFile,
                        create: true,
                        bldr: {
                            context: ctx.context,
                            bldrId,
                            folderPath,
                        },
                    };

                    // Add bldrObj to files tobe posted and set new file options
                    postFiles.push(bldrObj);

                    // Set key for new file to the provided bldrId
                    postFileOptions[bldrId] = {
                        type: 'list',
                        describe: `What type of asset is ${folderPath}`,
                        choices: ['htmlemail', 'codesnippetblock', 'htmlblock', 'dataextension'],
                        prompt: 'always',
                    };
                }
            }
        }

        return {
            postFileOptions,
            postFiles,
        };
    }

    /**
     * Method to check if file exists in the current Stash Array based on file path
     *
     * @param {string} file
     * @returns
     */
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

    /**
     * Method to configure all new folders for SFMC API POST
     *
     * @param {object} postFileOptions configuration options for all file prompts
     * @param {object} postFiles array of new files objects to post
     * @param {string} instance current instance to stave to staash
     * @param {string} dirPath project directory path
     * @returns user prompts for configuration
     */
    _setNewAssets(postFileOptions, postFiles, instance, dirPath) {
        return yargsInteractive()
            .usage('$0 <command> [args]')
            .interactive(postFileOptions)
            .then(async (optionsResult) => {
                try {
                    const ignoreFolderCreate = ['ssjsactivity', 'queryactivity'];

                    for (const o in optionsResult) {
                        // Get post file based on key matching bldrId
                        const postFile = postFiles.find((post) => post.bldr.bldrId === o);

                        if (typeof postFile !== 'undefined') {
                            let postObj;
                            let content;
                            let manifestFolder;

                            let bldrObj = postFile.bldr;

                            const assetType = optionsResult[o];
                            const bldrId = bldrObj.bldrId;
                            const folderPath = bldrObj.folderPath;
                            // Get various folder/asset values from the full file path
                            const categoryDetails = await utils.filePathDetails(postFile.path);

                            const folderName = categoryDetails.folderName;
                            const fileName = categoryDetails.fileName;
                            const assetName = fileName.substring(0, fileName.indexOf('.'));

                            // Read contents of file
                            const file = fs.readFileSync(postFile.path);

                            // format file based on file extension in path
                            if (
                                postFile.path.includes('.html') ||
                                postFile.path.includes('.js') ||
                                postFile.path.includes('.sql')
                            ) {
                                content = `${file.toString()}`;
                            } else {
                                content = JSON.parse(file);
                            }
                            // Get folder data for new asset from existing manifest folder data
                            manifestFolder = await this.stash._getManifestFolderData(postFile);

                            // If folder data does not exist create new folders in SFMC for Asset POST
                            // Nested folders can be created recursively
                            if (ignoreFolderCreate.includes(assetType)) {
                                const parentName = folderPath.split('/')[1];
                                const categoryResp = await this.bldr.folder.search(assetType, 'Name', parentName);

                                if (categoryResp.OverallStatus !== 'OK') {
                                    throw new Error(categoryResp.OverallStatus);
                                }

                                const parentFolder = categoryResp.Results.find(
                                    (folder) => folder.ParentFolder.ID === 0
                                );
                                manifestFolder = {
                                    id: parentFolder.ID,
                                    parentId: parentFolder.ParentFolder.ID,
                                };
                            } else if (!manifestFolder) {
                                // Create new folders in SFMC and add response to manifest.json file
                                const createFolder = await this.addNewFolder(categoryDetails, dirPath);

                                if (
                                    Object.prototype.hasOwnProperty.call(createFolder, 'OverallStatus') &&
                                    createFolder.OverallStatus !== 'OK'
                                ) {
                                    throw new Error(createFolder.StatusText);
                                }

                                manifestFolder = await this.stash._getManifestFolderData(postFile);
                            }

                            // Compile asset information to pass into SFMC API Definition
                            const asset = {
                                bldrId,
                                assetName,
                                content,
                                category: {
                                    id: manifestFolder.id,
                                    parentId: manifestFolder.parentId,
                                    folderName,
                                    folderPath: categoryDetails.projectPath,
                                },
                            };

                            // Create API POST Definition based on Asset Types
                            switch (assetType) {
                                case 'htmlemail':
                                    postObj = await assetDefinitions.htmlemail(asset);
                                    break;

                                case 'codesnippetblock':
                                case 'htmlblock':
                                    postObj = await assetDefinitions.contentBlock(asset, assetType);
                                    break;

                                // case 'ssjsactivity':
                                //     postObj = await assetDefinitions.ssjsactivity(
                                //         asset,
                                //         'Scripts'
                                //     );
                                // break;
                                // case 'queryactivity':

                                // break;

                                case 'dataextension':
                                    asset.customerKey = postFile.assetName;
                                    postObj = asset;
                                    break;
                            }
                            postObj.create = true;

                            postFile['post'] = postObj;
                            await this.stash._saveStash(instance, postFile);
                        }
                    }
                } catch (err) {
                    const errorHeaders = [new Column(`${styles.error('New Asset Error')}`, width.c3)];

                    const displayContent = [[new Column(`${err.message}`, width.c3)]];

                    display.render(errorHeaders, displayContent);
                }
            });
    }

    /**
     * Method to create new folders in SFMC when the do not exist
     *
     * @param {object} categoryDetails various folder/asset values from the full file path
     * @param {string} dirPath project root folder
     */
    async addNewFolder(categoryDetails, dirPath) {
        try {
            // Get project path to check existing folders
            const projectPath = categoryDetails.projectPath;

            // Split path into array to check each individually
            const pathArr = projectPath.split('/');

            // Grab root folder from path
            const rootFolder = pathArr.shift();

            // Get context based on folder path
            const ctx = utils.ctx(projectPath);
            const context = ctx.context;
            const categoryType = ctx.categoryType;

            // Get .local.manifest.json file
            const manifestJSON = await this.localFile._getManifest(dirPath);
            const manifestFolders = manifestJSON[context]['folders'];

            let checkPath = rootFolder;
            let parentId;
            let createFolder;

            // Iterate through all folder names to see where folders need to be created
            for (const p in pathArr) {
                const folder = pathArr[p];
                let updatedFolder = 0;

                // Compile path to check against
                checkPath = `${checkPath}/${folder}`;

                // Check if folder path exists in .local.manifest.json
                const manifestFolderObj = manifestFolders.find(
                    (manifestFolder) => manifestFolder.folderPath === checkPath
                );

                // If no object is returned the folder does not exist
                if (typeof manifestFolderObj === 'undefined') {
                    if (typeof parentId === 'undefined') {
                        const parentObj = await this.bldr.folder.search(categoryType, 'Name', rootFolder);

                        if (parentObj.OverallStatus !== 'OK') {
                            throw new Error(parentObj.OverallStatus);
                        }

                        if (
                            !Object.prototype.hasOwnProperty.call(parentObj, 'Results') &&
                            parentObj.Results.length > 0
                        ) {
                            throw new Error('No Results Found for Root Folder');
                        }

                        parentId = parentObj.Results[0].ID;
                    }

                    // Create folder via SFMC API
                    createFolder = await this.bldr.folder.create({
                        name: folder,
                        parentId,
                        contentType: categoryType,
                    });

                    if (createFolder.StatusCode === 'Error') {
                        throw new Error(createFolder.StatusMessage);
                    } else {
                        // Wait for response from folder creation and add object to manifestFolder array
                        // Folder permissions my not allow child folders, so when exception is thrown create will retry
                        // do/while will check until retry is done and folder is created
                        do {
                            const folderObj = {
                                id: createFolder.Results[0].NewID,
                                name: folder,
                                parentId: parentId,
                                categoryType: categoryType,
                                rootFolder: false,
                                folderPath: checkPath,
                            };

                            manifestFolders.push(folderObj);
                            parentId = createFolder.Results[0].NewID;

                            updatedFolder++;
                        } while (typeof createFolder !== 'undefined' && updatedFolder === 0);
                    }
                } else {
                    parentId = manifestFolderObj.id;
                }
            }

            // Update ManifestJSON file with new folder
            await this.localFile.manifestJSON(context, { folders: manifestFolders }, dirPath);

            return {
                OverallStatus: 'OK',
                Results: manifestFolders,
            };
        } catch (err) {
            return {
                OverallStatus: 'ERROR',
                StatusText: err.message,
            };
        }
    }
};
