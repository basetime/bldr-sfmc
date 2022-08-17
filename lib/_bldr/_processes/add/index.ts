const sfmcContext: {
    sfmc_context_mapping: { name: string }[];
} = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const { MappingByAssetType } = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/contentBuilderAssetTypes');
const getFiles = require('node-recursive-directory');

import { readFile } from 'fs/promises';
import { StashItem } from '../../../_types/StashItem';
import yargsInteractive from 'yargs-interactive';
import { State } from '../state';
import { displayLine, displayObject, displayArrayOfStrings } from '../../../_utils/display';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { InstanceConfiguration } from '../../../_types/InstanceConfiguration';
import { Argv } from '../../../_types/Argv';
import { guid, getFilePathDetails } from '../../_utils';
import { getRootPath, fileExists } from '../../../_utils/fileSystem';
import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';
import { Stash } from '../stash';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import remove from 'lodash.remove';

const { getState } = new State();

const { saveStash, displayStashStatus } = new Stash();

/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
export class Add {
    constructor() { }
    /**
     * Handles all file functionality
     * Works with Stash backend file
     *
     * @param {object} argv user input including command and array of file paths to add to Stash
     */
    addFiles = async (argv: Argv) => {
        try {
            const stateObject = getState();
            const instance = stateObject && stateObject.instance;
            // Get the root directory for the project being worked on
            const rootPath = (await getRootPath()) || './';
            // Get the current working directory that the [add] command was triggered
            const cwdPath = process.cwd();
            // Get Arguments Array
            const argvArr: any[] = argv._ || [];
            // Remove command from input array leaving only file names
            argvArr.shift();
            // Store all complete file paths for files in CWD and subdirectories
            let contextFiles: string[] = [];

            // Compile full folder paths based on CWD path and user provided paths
            for (const a in argvArr) {
                contextFiles.push(`${cwdPath}/${argvArr[a]}`);
            }

            // Gather all file content/details for each file path
            // Separate out existing files and newly created files
            // Add existing files to the Stash with the updated file content
            const organizedFiles = await this.gatherAllFiles(contextFiles, rootPath);

            const { putFiles, postFiles, postFileOptions } = organizedFiles;

            putFiles && putFiles.length && await saveStash(putFiles);
            await this.buildNewAssetObjects({
                postFileOptions,
                postFiles,
                instance,
                rootPath,
            });
            await displayStashStatus();
        } catch (err) {
            console.log(err);
        }
    };
    /**
     * Method to gather all files in CWD and add to the temp Stash
     * Prepares JSON for POST/PUT to SFMC APIs
     * Will add all files starting at the CWD request was made, including all files in subfolders
     */
    addAllFiles = async (packageJSON = null) => {
        try {
            const stateObject = getState();
            const instance = stateObject && stateObject.instance;

            // Get the root directory for the project being worked on
            const rootPath = (await getRootPath()) || './';
            // Get the current working directory that the [add] command was triggered
            const cwdPath = process.cwd();

            // Identify the context for request
            const contextsArray = sfmcContext.sfmc_context_mapping.map(
                (context) => fileExists(`./${context.name}`) && context.name
            );

            // Isolate context from Array
            const contexts = contextsArray.filter((ctx) => ctx !== 'Data Extensions').filter(Boolean);

            // Store all complete file paths for files in CWD and subdirectories
            let contextFiles: string[] = [];

            // if dir is root folder
            if (rootPath === './') {
                // iterate all contexts and add files
                for (const c in contexts) {
                    contextFiles.push(...(await getFiles(`./${contexts[c]}`)));
                }
            } else {
                // get files from current working directory and subdirectories
                contextFiles.push(...(await getFiles(`${cwdPath}`)));
            }

            // Gather all file content/details for each file path
            // Separate out existing files and newly created files
            // Add existing files to the Stash with the updated file content
            if (!packageJSON) {
                const organizedFiles = await this.gatherAllFiles(contextFiles, rootPath);
                const { putFiles, postFiles, postFileOptions } = organizedFiles;
                putFiles && putFiles.length && await saveStash(putFiles);
                await this.buildNewAssetObjects({
                    postFileOptions,
                    postFiles,
                    instance,
                    rootPath,
                });
            } else {
                const organizedFiles = await this.gatherAllFilesFromPackage(contextFiles);
                const { postFiles } = organizedFiles;
                postFiles && postFiles.length && await saveStash(postFiles);
            }

                await displayStashStatus();
            } catch (err) {
                console.log(err);
            }
        };
        /**
         *
         * @param contextFiles
         * @param rootPath
         */
        gatherAllFiles = async (contextFiles: string[], rootPath: string) => {
            const putFiles: any[] = [];
            // Store all complete objects for Stash
            const postFiles = [];

            // Get manifest JSON file
            const manifestPath = rootPath ? `${rootPath}.local.manifest.json` : `./.local.manifest.json`;
            // Read ManifestJSON file from root dir
            const manifestFile: any = await readFile(manifestPath);
            const manifestJSON = JSON.parse(manifestFile);

            // Initiate configuration for new file prompts
            let postFileOptions: {
                [key: string]: {
                    default?: Boolean;
                    type?: string;
                    describe?: string;
                    choices?: string[];
                    prompt?: string;
                };
            } = {};

            // Get all available contexts to check for files
            const availableContexts = contextFiles.map(filePath => {
                const { context } = getFilePathDetails(filePath);
                return filePath.includes(context.name) && context
            });

            for (const context in availableContexts) {
                const contextPaths = contextFiles.filter(file => file.includes(availableContexts[context].name))
                const bldrContext = availableContexts[context].context;

                // Retrieve Manifest JSON file and get the assets for the specific context
                type ManifestContext = any

                const manifestContextAssets: ManifestContext[] = manifestJSON[bldrContext] && manifestJSON[bldrContext]['assets'];

                // If the Manifest JSON file has an assets Array process files
                if (manifestContextAssets) {
                    // Iterate through files array to check if existing files
                    for (const path in contextPaths) {
                        const systemFilePath: any = contextPaths[path];

                        // Check Manifest assets if the file path exists
                        // Gets folder path from the manifest asset
                        // Splits system file path into an array
                        // Gets the asset name from the system file path
                        // Tests if the system file path includes the folder path of the current asset
                        // Tests if the system file name is the same as the assets name
                        const existingAsset = manifestContextAssets.find((asset) => {
                            const { fileName, folderPath } = getFilePathDetails(systemFilePath);
                            return asset.category.folderPath === folderPath && fileName === asset.name && asset;
                        });

                        if (existingAsset) {
                            const fileContentRaw = await readFile(systemFilePath);
                            const fileContent = fileContentRaw.toString();
                            const objectIdKey = existingAsset.assetType?.objectIdKey

                            const existingSchema: {
                                [key: string]: any
                            } = {
                                path: systemFilePath,
                                bldr: {
                                    context: availableContexts[context],
                                    bldrId: existingAsset.bldrId,
                                    folderPath: existingAsset.category && existingAsset.category.folderPath,
                                },
                                fileContent,
                            }

                            if (existingAsset.id) {
                                existingSchema.bldr.id = existingAsset.id
                            } else if (objectIdKey) {
                                existingSchema.bldr.id = existingAsset[objectIdKey]
                            }

                            // If the file exists build the stash object for a put request
                            putFiles.push(existingSchema);

                            // Once stash file is processed remove the filepath from items waiting for processing
                            remove(contextFiles, (contextFilePath) => contextFilePath === systemFilePath)
                        } else {
                            // If the file does not exist build the stash object for a post request
                            // Also Build the options for CLI prompt
                            const bldrId = await guid();

                            const { fileName, folderPath } = getFilePathDetails(systemFilePath);

                            const fileContentRaw = await readFile(systemFilePath);
                            const fileContent = fileContentRaw.toString();

                            postFiles.push({
                                name: fileName,
                                path: systemFilePath,
                                bldr: {
                                    context: availableContexts[context],
                                    folderPath,
                                    bldrId,
                                },
                                fileContent
                            });

                            postFileOptions[bldrId] = {
                                type: 'list',
                                describe: `What type of asset is ${folderPath}/${fileName}`,
                                choices: ['htmlemail', 'codesnippetblock', 'htmlblock', 'dataextension'],
                                prompt: 'always',
                            };

                            // Once stash file is processed remove the filepath from items waiting for processing
                            remove(contextFiles, (contextFilePath) => contextFilePath === systemFilePath)
                        }
                    }
                }
            }

            // Add interactive key to yargs-interactive object
            postFileOptions['interactive'] = {
                default: true,
            };

            return {
                postFileOptions,
                postFiles,
                putFiles,
            };
        };
        /**
             *
             * @param contextFiles
             * @param rootPath
             */
        gatherAllFilesFromPackage = async (contextFiles: string[]) => {
            // Store all complete objects for Stash
            const postFiles = [];
            const rootPath = getRootPath()
            // Get manifest JSON file
            const packagePath = rootPath ? `${rootPath}.package.manifest.json` : `./.package.manifest.json`;
            // Read ManifestJSON file from root dir
            const packageFile: any = await readFile(packagePath);
            const packageJSON = JSON.parse(packageFile);

            // Get all available contexts to check for files
            const availableContexts = contextFiles.map(filePath => {
                const { context } = getFilePathDetails(filePath);
                return filePath.includes(context.name) && context
            });

            for (const context in availableContexts) {
                const contextPaths = contextFiles.filter(file => file.includes(availableContexts[context].name))
                const bldrContext = availableContexts[context].context;

                // Retrieve Manifest JSON file and get the assets for the specific context
                type ManifestContext = any

                const manifestContextAssets: ManifestContext[] = packageJSON[bldrContext] && packageJSON[bldrContext]['assets'];

                // If the Manifest JSON file has an assets Array process files
                if (manifestContextAssets) {
                    // Iterate through files array to check if existing files
                    for (const path in contextPaths) {
                        const systemFilePath: any = contextPaths[path];
                        const { fileName, folderPath } = getFilePathDetails(systemFilePath);

                        // Check Manifest assets if the file path exists
                        // Gets folder path from the manifest asset
                        // Splits system file path into an array
                        // Gets the asset name from the system file path
                        // Tests if the system file path includes the folder path of the current asset
                        // Tests if the system file name is the same as the assets name
                        const packageAsset = manifestContextAssets.find((asset) => {
                            const { fileName, folderPath } = getFilePathDetails(systemFilePath);
                            return asset.category.folderPath === folderPath && fileName === asset.name && asset;
                        });

                        const fileContentRaw = await readFile(systemFilePath);
                        const fileContent = fileContentRaw.toString();

                        const existingSchema: StashItem = {
                            name: fileName,
                            path: systemFilePath,
                            bldr: {
                                context: availableContexts[context],
                                bldrId: packageAsset.bldrId,
                                folderPath: packageAsset.category && packageAsset.category.folderPath,
                            },
                            fileContent,
                            assetType: packageAsset.assetType
                        }

                        // If the file exists build the stash object for a put request
                        postFiles.push(existingSchema);

                        // Once stash file is processed remove the filepath from items waiting for processing
                        remove(contextFiles, (contextFilePath) => contextFilePath === systemFilePath)
                    }
                }
            }

            return {
                postFiles
            };
        };
        /**
         * Method to configure all new folders for SFMC API POST
         *
         * @param {object} postFileOptions configuration options for all file prompts
         * @param {object} postFiles array of new files objects to post
         * @param {string} instance current instance to stave to stash
         * @param {string} dirPath project directory path
         * @returns user prompts for configuration
         */
        buildNewAssetObjects = async (request: {
            postFileOptions: any;
            postFiles: StashItem[];
            instance: string;
            rootPath: string;
        }) => {
            const options = request && request.postFileOptions;
            return yargsInteractive()
                .usage('$0 <command> [args]')
                .interactive(options)
                .then(async (optionsResult) => {
                    try {
                        // Iterate through all configured file objects for post
                        for (const resultBldrId in optionsResult) {
                            // Get post file based on key matching bldrId
                            const postFile = request.postFiles.find(
                                (fileObject) => fileObject.bldr.bldrId === resultBldrId
                            );

                            if (postFile) {
                                // Get Asset Type from user input
                                postFile.assetType = MappingByAssetType(optionsResult[resultBldrId]);
                                await saveStash(postFile);
                            }
                        }
                    } catch (err: any) {
                        displayLine(`Create Asset Error: ${err.message}`);
                    }
                });
        };

    }
