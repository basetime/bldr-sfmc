import { readBldrSfmcConfig, readPackageManifest, replaceBldrSfmcConfig } from "../../../_utils/bldrFileSystem";
import { fileExists, getRootPath } from "../../../_utils/fileSystem";
import { createEditableFilesBasedOnContext } from "../../../_utils/bldrFileSystem/_context/CreateFilesBasedOnContext";
import { updateManifest } from "../../../_utils/bldrFileSystem/manifestJSON";
import { readManifest } from "../../../_utils/bldrFileSystem";
import { addNewFolders } from "../../_utils/CreateSFMCFolders"
import { initiateBldrSDK } from "../../../_bldr_sdk";
import { Add } from "../add";
import { Push } from "../push";
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { displayLine } from "../../../_utils/display";
import { ManifestFolder } from "../../../_types/ManifestAsset";
import { setContentBuilderDefinition } from "../_contexts/contentBuilder/definitions";

const add = new Add()
const push = new Push()

const sfmcContext: {
    sfmc_context_mapping: { name: string, context: string }[];
} = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');

const find = require('lodash.find');

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
export class Deploy {

    constructor() { }

    deployPackage = async () => {
        try {
            const packageJSON = await readPackageManifest();
            const availableContexts: string[] = sfmcContext.sfmc_context_mapping.map((ctx) => ctx.context);
            const packageContexts = Object.keys(packageJSON).map(key => {
                return availableContexts.includes(key) && typeof key === 'string' && key
            })

            if (await this.deployCheckConfig()) {
                return;
            }

            for (const c in packageContexts) {
                const context = packageContexts[c];

                if (context && packageJSON[context]) {
                    await updateManifest(
                        context,
                        { assets: [], folders: [] }
                    );

                    const pkgAssets = packageJSON[context]['assets'];
                    const pkgFolderPaths = pkgAssets.map((asset: {
                        category: {
                            folderPath: string;
                        }
                    }) => asset.category.folderPath)

                    await createEditableFilesBasedOnContext(context, pkgAssets)

                    for (const fp in pkgFolderPaths) {
                        await addNewFolders(pkgFolderPaths[fp])
                    }
                }
            }

            const package_dataExtension = packageContexts.includes('dataExtension') && packageJSON['dataExtension']['assets']
            const package_contentBuilder = packageContexts.includes('contentBuilder') && packageJSON['contentBuilder']['assets']
            const package_automationStudio = packageContexts.includes('automationStudio') && packageJSON['automationStudio']['assets']

            const sdk = await initiateBldrSDK()
            const createDataExtensions = sdk && package_dataExtension && await this.deployDataExtension(sdk, package_dataExtension)
            const createContentBuilder = sdk && package_contentBuilder && await this.deployContentBuilderAssets(sdk, package_contentBuilder)
            createDataExtensions && await updateManifest('dataExtension', {
                assets: createDataExtensions
            })



            // for (const c in packageContexts) {
            //     const context = packageContexts[c];

            //     if (context && packageJSON[context]) {
            //         await updateManifest(
            //             context,
            //             { assets: [], folders: [] }
            //         );

            //         // const contextDetails = this.contextMap.find(
            //         //     (ctx) => ctx.context === context
            //         // );
            //         // const pkgFolders = packageJSON[context]['folders']

            //         const pkgAssets = packageJSON[context]['assets'];
            //         const pkgFolderPaths = pkgAssets.map((asset: {
            //             category: {
            //                 folderPath: string;
            //             }
            //         }) => asset.category.folderPath)

            //         await createEditableFilesBasedOnContext(context, pkgAssets)

            //         for (const fp in pkgFolderPaths) {
            //             await addNewFolders(pkgFolderPaths[fp])
            //         }

            //         if (
            //             context === 'dataExtension' &&
            //             Object.prototype.hasOwnProperty.call(
            //                 packageJSON,
            //                 'dataExtension'
            //             )
            //         ) {
            //             await this.deployDataExtensions(
            //                 pkgAssets,
            //                 contextDetails
            //             );
            //         }

            // if (
            //     context === 'contentBuilder' &&
            //     Object.prototype.hasOwnProperty.call(
            //         packageJSON,
            //         'contentBuilder'
            //     )
            // ) {
            //     await this.deployContentBuilderAssets(
            //         pkgAssets,
            //         contextDetails
            //     );
            // }
            //     }
            // }

        } catch (err) {
            console.log(err);
        }
    }


    deployCheckConfig = async () => {
        let preventDeployment = false;

        const dirPath = await getRootPath();
        if (fileExists(`${dirPath}/.sfmc.config.json`)) {
            const config = await readBldrSfmcConfig();
            for (const c in config) {
                const key = c;
                const value = config[c];

                if (value === '') {
                    console.log(`Please configure ${key} in .sfmc.config.json`);
                    preventDeployment = true;
                }
            }
        }

        return preventDeployment;
    };



    async deployContentBuilderAssets(sdk: BLDR_Client, contentBuilderAssets: any[]) {
        try {
            const package_contentBuilder_noDependencies = contentBuilderAssets.map((asset: any) => {
                return !Object.prototype.hasOwnProperty.call(asset, 'dependencies') || asset.dependencies.length === 0 && asset
            }).filter(Boolean)

            console.log('package_contentBuilder_noDependencies',package_contentBuilder_noDependencies)
            const createContentBuilderNoDependencies = Promise.all(package_contentBuilder_noDependencies.map((noDepAsset) => this.deployContentBuilderAsset(sdk, noDepAsset)))


            // const package_contentBuilder_dependencies = contentBuilderAssets.map((asset: any) => {
            //     return Object.prototype.hasOwnProperty.call(asset, 'dependencies') && asset.dependencies.length > 0 && asset
            // }).filter(Boolean)


            // const createContentBuilderDependencies = await this.deployContentBuilderAsset(sdk, package_contentBuilder_dependencies, true)

        } catch (err) {
            console.log('ERR', err);
        }
    }

    async deployContentBuilderAsset(
        sdk: BLDR_Client,
        contentBuilderAsset: any,
        dependencies = false
    ) {

        const ignoreDeployment = ['webpage', 'jscoderesource'];
        const manifestJSON = await readManifest();
        const manifestJSONFolders = manifestJSON['contentBuilder']['folders'];
        const contentFolderPath = contentBuilderAsset.category.folderPath;
        const category = manifestJSONFolders.find(
            (folder: ManifestFolder) => folder.folderPath === contentFolderPath
        );
        console.log('category', category)

        //Update asset content with configurations before posting
        let content = contentBuilderAsset.content;
        let buildContent = await replaceBldrSfmcConfig(content);

        contentBuilderAsset.category = category;
        contentBuilderAsset.bldr = {
            bldrId: contentBuilderAsset.bldrId
        }

        contentBuilderAsset = await setContentBuilderDefinition(
            contentBuilderAsset,
            buildContent
        );

        if (category) {
            contentBuilderAsset.category = {
                id: category.id,
            };
        }

        if (
            Object.prototype.hasOwnProperty.call(
                contentBuilderAsset,
                'assetType'
            ) &&
            Object.prototype.hasOwnProperty.call(
                contentBuilderAsset.assetType,
                'name'
            ) &&
            ignoreDeployment.includes(contentBuilderAsset.assetType.name)
        ) {
            displayLine(
                `${contentBuilderAsset.assetType.name} asset type requires the user to create the asset manually. Create the asset, then run the [ bldr clone ] command to get the asset.`
            );
        } else {
            const createAsset = await sdk.sfmc.asset.postAsset(
                contentBuilderAsset
            );

            if (createAsset.status === 'ERROR') {
                console.log(createAsset.statusText);
            } else {
                contentBuilderAsset.id = createAsset.id;
                contentBuilderAsset.assetType = createAsset.assetType;
                contentBuilderAsset.category = createAsset.category;
                contentBuilderAsset.customerKey = createAsset.customerKey;
                contentBuilderAsset.category.folderPath = contentFolderPath;

                // Update ManifestJSON file with responses
                await updateManifest(
                    'contentBuilder',
                    { assets: [contentBuilderAsset] }
                );
            }
        }
        // } else {
        //     //Get assets dependencies
        //     const assetDependencies = contentBuilderAsset.dependencies;

        //     await this.updateContentBuilderReferences(
        //         contentBuilderAsset,
        //         manifestJSON,
        //         assetDependencies
        //     );

        //     if (
        //         Object.prototype.hasOwnProperty.call(
        //             contentBuilderAsset,
        //             'assetType'
        //         ) &&
        //         Object.prototype.hasOwnProperty.call(
        //             contentBuilderAsset.assetType,
        //             'name'
        //         ) &&
        //         ignoreDeployment.includes(contentBuilderAsset.assetType.name)
        //     ) {
        //         console.log(
        //             `${contentBuilderAsset.assetType.name} asset type requires the user to create the asset manually. Create the asset, then run the [ bldr clone ] command to get the asset.`
        //         );
        //         await this.localFile.createEditableFiles(
        //             [contentBuilderAsset],
        //             contextDetails.context,
        //             false
        //         );
        //     } else {
        //         const createAsset = await this.bldr.asset.postAsset(
        //             contentBuilderAsset
        //         );

        //         if (createAsset.status === 'ERROR') {
        //             console.log(createAsset.statusText);
        //         } else {
        //             contentBuilderAsset.id = createAsset.id;
        //             contentBuilderAsset.assetType = createAsset.assetType;
        //             contentBuilderAsset.category = createAsset.category;
        //             contentBuilderAsset.customerKey = createAsset.customerKey;
        //             contentBuilderAsset.category.folderPath = contentFolderPath;

        //             // Update ManifestJSON file with responses
        //             await this.localFile.manifestJSON(
        //                 contextDetails.context,
        //                 { assets: [contentBuilderAsset] },
        //                 null
        //             );

        //             await this.localFile.createEditableFiles(
        //                 [contentBuilderAsset],
        //                 contextDetails.context,
        //                 true
        //             );
        //         }
        // }
        // }
    }

    // async updateContentBuilderReferences(
    //     contentBuilderAsset: any,
    //     assetDependencies
    // ) {
    //     let content = await utils.getAssetContent(contentBuilderAsset);
    //     let createdId;

    //     for (const a in assetDependencies) {
    //         const assetDependency = assetDependencies[a];
    //         const findObj = await find(
    //             manifestJSON[assetDependency.context]['assets'],
    //             (o) => {
    //                 return o.bldrId === assetDependency.bldrId;
    //             }
    //         );

    //         switch (assetDependency.ref) {
    //             case 'Lookup':
    //             case 'LookupRows':
    //             case 'ClaimRow':
    //             case 'DataExtensionRowCount':
    //             case 'DeleteData':
    //             case 'DeleteDE':
    //             case 'InsertDE':
    //             case 'UpdateData':
    //             case 'UpdateDE':
    //             case 'UpsertData':
    //             case 'UpsertDE':
    //             case 'LookupOrderedRows':
    //             case 'LookupOrderedRowsCS':
    //             case 'LookupRowsCS':
    //                 createdId = findObj.name;
    //                 break;
    //             case 'ContentBlockById':
    //                 createdId = findObj.id;
    //                 break;
    //             case 'ContentBlockByName':
    //                 if (
    //                     content.match(
    //                         new RegExp(
    //                             `(?<=Platform.Function.ContentBlockByName\\(')${assetDependency.bldrId}`,
    //                             'g'
    //                         )
    //                     )
    //                 ) {
    //                     createdId =
    //                         `${findObj.category.folderPath}/${findObj.name}`.replaceAll(
    //                             '/',
    //                             '\\\\'
    //                         );
    //                 } else {
    //                     createdId =
    //                         `${findObj.category.folderPath}/${findObj.name}`.replaceAll(
    //                             '/',
    //                             '\\'
    //                         );
    //                 }
    //                 break;
    //         }

    //         content = content.replaceAll(assetDependency.bldrId, createdId);
    //     }

    //     return utils.updateAssetContent(contentBuilderAsset, content);
    // }

    deployDataExtension = async (sdk: BLDR_Client, dataExtensions: any[]) => {
        try {
            const output: any[] = [];

            for (const d in dataExtensions) {
                let dataExtension = dataExtensions[d];
                const dataExtensionFields = dataExtension.fields;

                const manifestJSON = await readManifest();
                const manifestJSONFolder = manifestJSON['dataExtension'][
                    'folders'
                ].find((folder: ManifestFolder) =>
                    folder.folderPath ===
                    dataExtension.category.folderPath && folder
                );

                if (manifestJSONFolder) {
                    dataExtension.categoryId = manifestJSONFolder.id;
                } else {
                    delete dataExtension.category;
                }

                dataExtension.fields = dataExtension.fields.map((field: any) => {
                    return {
                        field: field,
                    };
                });

                const createDataExtension =
                    await sdk.sfmc.emailStudio.postAsset(
                        dataExtension
                    );

                if (createDataExtension.OverallStatus === "OK") {
                    dataExtension.fields = dataExtensionFields
                    output.push(dataExtension)
                } else {
                    displayLine(createDataExtension.OverallStatus, 'error')
                }
            }

            return output
        } catch (err: any) {
            console.log(err.message);
        }
    }

    // async deployFolders(packageFolders, contextDetails) {
    //     try {
    //         const results = new Array();
    //         for (const f in packageFolders) {
    //             const folderPath = packageFolders[f];

    //             const deployFolder = await this.deployFolder(
    //                 folderPath,
    //                 contextDetails
    //             );

    //             if (deployFolder.OverallStatus === 'ERROR') {
    //                 throw new Error(deployFolder.StatusText);
    //             }

    //             results.push(...deployFolder.Results);
    //         }

    //         return {
    //             OverallStatus: 'OK',
    //             Results: results,
    //         };
    //     } catch (err) {
    //         return {
    //             OverallStatus: 'ERROR',
    //             StatusText: err.message,
    //         };
    //     }
    // }

    // /**
    //  * Method to create new folders in SFMC when the do not exist
    //  *
    //  * @param {object} categoryDetails various folder/asset values from the full file path
    //  */
    // async deployFolder(folderPath, contextDetails) {
    //     try {
    //         let categoryType = contextDetails.categoryType;
    //         let checkPath = contextDetails.root;
    //         let parentId;
    //         let createFolder;
    //         let manifestFolders = new Array();

    //         let pathArr = folderPath.split('/');
    //         pathArr.shift();

    //         // Iterate through all folder names to see where folders need to be created
    //         for (const p in pathArr) {
    //             const folder = pathArr[p];
    //             let updatedFolder = 0;

    //             // Compile path to check against
    //             checkPath = `${checkPath}/${folder}`;

    //             const manifestJSON = await this.stash._getManifestAssetData();
    //             const manifestJSONFolder = manifestJSON[contextDetails.context][
    //                 'folders'
    //             ].find(
    //                 (manifestJSONFolderFolderObj) =>
    //                     manifestJSONFolderFolderObj.folderPath === checkPath
    //             );

    //             if (!manifestJSONFolder) {
    //                 if (typeof parentId === 'undefined') {
    //                     const parentObj = await this.bldr.folder.search(
    //                         categoryType,
    //                         'Name',
    //                         contextDetails.root
    //                     );

    //                     if (parentObj.OverallStatus !== 'OK') {
    //                         throw new Error(parentObj.OverallStatus);
    //                     }

    //                     if (
    //                         !Object.prototype.hasOwnProperty.call(
    //                             parentObj,
    //                             'Results'
    //                         ) &&
    //                         parentObj.Results.length > 0
    //                     ) {
    //                         throw new Error('No Results Found for Root Folder');
    //                     }

    //                     parentId = parentObj.Results[0].ID;
    //                 }

    //                 // Create folder via SFMC API
    //                 createFolder = await this.bldr.folder.create({
    //                     name: folder,
    //                     parentId,
    //                     contentType: categoryType,
    //                 });

    //                 if (createFolder.StatusCode === 'Error') {
    //                     throw new Error(createFolder.StatusMessage);
    //                 } else {
    //                     // Wait for response from folder creation and add object to manifestFolder array
    //                     // Folder permissions my not allow child folders, so when exception is thrown create will retry
    //                     // do/while will check until retry is done and folder is created
    //                     do {
    //                         const folderObj = {
    //                             id: createFolder.Results[0].NewID,
    //                             name: folder,
    //                             parentId: parentId,
    //                             categoryType: categoryType,
    //                             folderPath: checkPath,
    //                         };

    //                         // Update ManifestJSON file with responses
    //                         await this.localFile.manifestJSON(
    //                             contextDetails.context,
    //                             { folders: [folderObj] },
    //                             null
    //                         );

    //                         parentId = createFolder.Results[0].NewID;
    //                         updatedFolder++;
    //                     } while (
    //                         typeof createFolder !== 'undefined' &&
    //                         updatedFolder === 0
    //                     );
    //                 }
    //             } else {
    //                 //if folder exists set it's ID as parentID for next subfolder
    //                 parentId = manifestJSONFolder.id;
    //             }
    //         }

    //         return {
    //             OverallStatus: 'OK',
    //             Results: manifestFolders,
    //         };
    //     } catch (err) {
    //         return {
    //             OverallStatus: 'ERROR',
    //             StatusText: err.message,
    //         };
    //     }
    // }
};
