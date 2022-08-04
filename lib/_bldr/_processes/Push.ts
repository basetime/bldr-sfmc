import remove from 'lodash.remove';
import { Stash } from './Stash';
import { State } from './State';
import { readManifest } from '../../_utils/bldrFileSystem'
import { StashItemPost, StashItemPut } from '../../_types/StashItem';
import { initiateBldrSDK } from '../../_bldr_sdk';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { displayLine } from '../../_utils/display';
import { getFilePathDetails } from '../_utils';

const {
  getState,
  getCurrentInstance
} = new State();

const {
  getStashArray
} = new Stash()


export class Push {
  constructor() { }

  pushStash = async () => {
    const instance = await getCurrentInstance();
    // get stash for instance for state instance
    const instanceStash: {
      bldr: {
        bldrId: string;
      }
    }[] = await getStashArray();

    const bldrIds = instanceStash.map(({ bldr }) => bldr.bldrId);
    const manifestJSON = await readManifest()

    const postStashFiles = instanceStash.map((stashItem => Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)).filter(Boolean)
    const putStashFiles = instanceStash.map((stashItem => !Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)).filter(Boolean)


    const availableContexts = Object.keys(manifestJSON)

    console.log('postStashFiles', postStashFiles)
    console.log('putStashFiles', putStashFiles)

    for (const context in availableContexts) {
      // Retrieve Manifest JSON file and get the assets for the specific context
      const manifestContextAssets: {
        id: number;
        name: string;
        bldrId: string;
        category: {
          folderPath: string;
        }
      }[] = manifestJSON[availableContexts[context]] && manifestJSON[availableContexts[context]]['assets']


    }
    // // get local manifest file
    // const rootPath = this.localFile._getRootPath(contextMap);
    // const manifestPath = `${rootPath}.local.manifest.json`;
    // const manifestJSON = this.localFile._parseJSON(manifestPath);
    // const contextArr = this.contextMap.map((ctx) => ctx.context);

    // for (const ctx in manifestJSON) {
    //     if (contextArr.includes(ctx)) {
    //         const manifestAssets = manifestJSON[ctx]['assets'];
    //         const postAssets = await this._isolateManifestAssetsForUpdate(
    //             manifestAssets,
    //             bldrIds
    //         );

    //         const updatedManifestAssets = await this._updateManifestAssets(
    //             postAssets,
    //             stashJSON
    //         );

    //         const newAssets = await this._isolateNewAssets(
    //             manifestAssets,
    //             stashJSON
    //         );

    //         await this.updateSFMCAssets(
    //             updatedManifestAssets,
    //             stashJSON,
    //             rootPath,
    //             ctx,
    //             instance
    //         );

    //         await this.updateSFMCAssets(
    //             newAssets,
    //             stashJSON,
    //             rootPath,
    //             ctx,
    //             instance
    //         );
    //     }
    // }
  }

  // async updateSFMCAssets(apiAssets, stashJSON, rootPath, ctx, instance) {
  //     const updatedStash = await this._postToSFMC(
  //         ctx,
  //         apiAssets,
  //         stashJSON.stash,
  //         rootPath
  //     );

  //     await this.localFile.manifestJSON(
  //         ctx,
  //         { assets: updatedStash.success },
  //         rootPath
  //     );

  //     stashJSON.stash = updatedStash.stashArr;
  //     this.store.stash.set(instance, stashJSON);

  //     if (
  //         updatedStash &&
  //         updatedStash.success &&
  //         updatedStash.success.length !== 0
  //     ) {
  //         const msg =
  //             updatedStash.method === 'POST'
  //                 ? `${ctx}: Created Assets`
  //                 : `${ctx}: Updated Assets`;

  //         const successHeaders = [
  //             new Column(`${styles.command(msg)}`, width.c3),
  //         ];

  //         const successDisplayContent = updatedStash.success.map((result) => {
  //             const name = result.name || result.Name;
  //             return [new Column(`${name}`, width.c3)];
  //         });

  //         display.render(successHeaders, successDisplayContent);
  //     }

  //     if (
  //         updatedStash &&
  //         updatedStash.errors &&
  //         updatedStash.errors.length !== 0
  //     ) {
  //         const errorsHeaders = [
  //             new Column(`${styles.error('Errored Asset')}`, width.c2),
  //             new Column(`${styles.error('Errored Message')}`, width.c2),
  //         ];

  //         const errorsDisplayContent = updatedStash.errors.map((result) => {
  //             return [
  //                 new Column(`${result.name}`, width.c2),
  //                 new Column(`${result.error}`, width.c2),
  //             ];
  //         });

  //         display.render(errorsHeaders, errorsDisplayContent);
  //     }
  // }

  // pushToSFMC = async (stashFiles: StashItemPost[] | StashItemPut[]) => {
  //   const success = [];
  //   const errors = [];
  //   const sdk: BLDR_Client = await initiateBldrSDK()

  //   // Throw Error if SDK Fails to Load
  //   if (!sdk) {
  //     displayLine('Unable to test configuration. Please review and retry.', 'error')
  //     return
  //   }

  //   for (const stashFile in stashFiles) {
  //     let stashFileObject = stashFiles[stashFile];
  //     const bldrId = stashFileObject.bldr.bldrId;
  //     const folderPath = stashFileObject.bldr && stashFileObject.bldr.folderPath;
  //     const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context;
  //     const method = Object.prototype.hasOwnProperty.call(stashFileObject, 'post') ? 'post' : 'put';

  //     switch (stashFileContext) {
  //       case 'automationStudio':

  //         break;
  //       case 'contentBuilder':

  //         method === 'post' ?
  //           //post function
  //           await sdk.sfmc.asset.postAsset() :
  //           //put function
  //           await sdk.sfmc.asset.putAsset();
  //         break;
  //     }

  //     if (ctx === 'automationStudio') {
  //       if (
  //         Object.prototype.hasOwnProperty.call(asset, 'create') &&
  //         asset.create
  //       ) {
  //         // method = 'POST';
  //         // delete asset.create;
  //         // resp = await this.bldr.automation.postAsset(asset);

  //         const errorsDisplayContent = [
  //           [
  //             new Column(
  //               `Creation of Automation Studio assets are not supported yet. Coming Soon!`,
  //               width.c4
  //             ),
  //           ],
  //         ];

  //         display.render([], errorsDisplayContent);
  //       } else {
  //         method = 'PATCH';
  //         resp = await this.bldr.automation.patchAsset(asset);
  //       }
  //     } else if (ctx === 'contentBuilder') {
  //       //Update asset content with configurations before posting
  //       content = await utils.getAssetContent(asset);
  //       let buildContent = await utils.replaceConfig(content);
  //       asset = await utils.updateAssetContent(asset, buildContent);

  //       if (
  //         Object.prototype.hasOwnProperty.call(asset, 'create') &&
  //         asset.create
  //       ) {
  //         method = 'POST';
  //         delete asset.create;
  //         resp = await this.bldr.asset.postAsset(asset);
  //       } else {
  //         method = 'PUT';
  //         resp = await this.bldr.asset.putAsset(asset);
  //       }
  //     } else if (ctx === 'dataExtension') {
  //       if (
  //         Object.prototype.hasOwnProperty.call(asset, 'create') &&
  //         asset.create
  //       ) {
  //         let assetContent = JSON.parse(asset.content);
  //         delete assetContent.bldrId;
  //         delete asset.create;

  //         const payload = await utils.capitalizeKeys(assetContent);
  //         payload.Fields = payload.Fields.map((field) => {
  //           return {
  //             Field: field,
  //           };
  //         });

  //         method = 'POST';
  //         resp = await this.bldr.dataExtension.postAsset(payload);
  //       } else {
  //         method = 'PUT';
  //         resp = await this.bldr.asset.putAsset(asset);
  //       }
  //     }

  //     //Update asset content with configurations before posting
  //     content = await utils.getAssetContent(asset);
  //     let manifestContent = await utils.scrubConfig(content);
  //     asset = await utils.updateAssetContent(asset, manifestContent);

  //     if (!resp && resp.status && resp.status !== 200) {
  //       errors.push({
  //         name: asset.name || asset.Name,
  //         error:
  //           (resp && resp.statusText) ||
  //           'Unable to provide error response',
  //       });
  //     } else {
  //       let objectIdKey =
  //         asset && asset.assetType && asset.assetType.objectIdKey;

  //       if (!Object.prototype.hasOwnProperty.call(asset, 'id'))
  //         asset.id = resp.id || asset[objectIdKey];

  //       if (!Object.prototype.hasOwnProperty.call(asset, 'customerKey'))
  //         asset.customerKey =
  //           resp.customerKey || resp.key || asset.CustomerKey;

  //       success.push(asset);

  //       this.localFile.appendBLDR(
  //         {
  //           folderPath: `${folderPath}/${asset.name}.html`,
  //           bldrId,
  //           id: asset.id,
  //           context: ctx,
  //         },
  //         rootPath
  //       );

  //       remove(stashArr, (item) => item.bldr.bldrId === bldrId);
  //     }
  //   }

  //   return {
  //     method,
  //     stashArr,
  //     success,
  //     errors,
  //   };
  // }

  /**
     * Method to create new folders in SFMC when the do not exist
     *
     * @param {object} categoryDetails various folder/asset values from the full file path
     * @param {string} dirPath project root folder
     */
  addNewFolders = async (stashItemFolderPath: string) => {
    try {
      const sdk = await initiateBldrSDK();
      const { context } = await getFilePathDetails(stashItemFolderPath)
      // Split path into array to check each individually
      const stashItemFolderArray = stashItemFolderPath.split('/');
      // Grab root folder from path
      const rootContextFolder = stashItemFolderArray.shift();

      // Get .local.manifest.json file
      const manifestJSON = await readManifest();
      const manifestFolders = manifestJSON[context.context]['assets'].map((manifestAsset: { category: { folderPath: string; }; }) => manifestAsset && manifestAsset.category);

      const createdFoldersOutput: any[] = []

      let checkPath = rootContextFolder;
      let parentId;
      let createFolder;
      // Iterate through all folder names to see where folders need to be created
      for (const stashItemFolder in stashItemFolderArray) {
        const folder = stashItemFolderArray[stashItemFolder];
        let updatedFolder = 0;

        // Compile path to check against
        checkPath = `${checkPath}/${folder}`;

        // Check if folder path exists in .local.manifest.json
        const folderIndex = manifestFolders.findIndex(
          (manifestFolder: {
            folderPath: string;
          }) => checkPath && manifestFolder.folderPath.includes(checkPath)
        );

        // If folder does not exist
        if (folderIndex === -1) {
          if (typeof parentId === 'undefined') {

            console.log('get parent')

            const parentFolderResponse = await sdk.sfmc.folder.search({
              contentType: context.contentType,
              searchKey: 'Name',
              searchTerm: context.name
            })

            if (parentFolderResponse.OverallStatus !== 'OK') {
              throw new Error(parentFolderResponse.OverallStatus);
            }

            if (
              !Object.prototype.hasOwnProperty.call(
                parentFolderResponse,
                'Results'
              ) &&
              parentFolderResponse.Results.length > 0
            ) {
              throw new Error('No Results Found for Root Folder');
            }

            parentId = parentFolderResponse.Results[0].ID;
          }

          // Create folder via SFMC API
          createFolder = await sdk.sfmc.folder.createFolder({
            contentType: context.contentType,
            name: folder,
            parentId
          });

          if (createFolder.StatusCode === 'Error') {
            throw new Error(createFolder.StatusMessage);
          } else {
            // Wait for response from folder creation and add object to manifestFolder array
            // Folder permissions my not allow child folders, so when exception is thrown create will retry
            // do/while will check until retry is done and folder is created
            do {
              parentId = createFolder && createFolder.Results && createFolder.Results[0].NewID;
              createdFoldersOutput.push(createFolder)
              updatedFolder++;
            } while (
              typeof createFolder !== 'undefined' &&
              updatedFolder === 0
            );
          }
        } else {
          parentId = manifestFolders[folderIndex].id;
        }
      }

      return createdFoldersOutput
    } catch (err: any) {
      console.log(err)
      console.log(err.message)
    }
  }

  // async _updateManifestAssets(postAssets, stashJSON) {
  //     const updates = postAssets.map((asset) => {
  //         const assetBldrId = asset.bldrId;
  //         const stashFile = stashJSON.stash.find((stashItem) => {
  //             return stashItem.bldr.bldrId === assetBldrId;
  //         });

  //         let updatedFile = stashFile.fileContent;
  //         const assetType = asset.assetType.name;

  //         switch (assetType) {
  //             case 'webpage':
  //             case 'htmlemail':
  //                 asset.views.html.content = updatedFile;
  //                 break;
  //             case 'codesnippetblock':
  //             case 'htmlblock':
  //             case 'jscoderesource':
  //                 asset.content = updatedFile;
  //                 break;
  //             case 'textonlyemail':
  //                 asset.views.text.content = updatedFile;
  //                 break;
  //             case 'queryactivity':
  //                 asset.queryText = updatedFile;
  //                 break;
  //             case 'ssjsactivity':
  //                 asset.script = updatedFile;
  //                 break;
  //             default:
  //                 asset = JSON.parse(updatedFile);
  //         }

  //         if (Object.prototype.hasOwnProperty.call(asset, 'create')) {
  //             delete asset.create;
  //         }

  //         return asset;
  //     });

  //     return updates;
  // }

  // _isolateManifestAssetsForUpdate(manifestAssets, bldrIds) {
  //     // isolate post assets
  //     const postAssets = manifestAssets.map((asset) => {
  //         const bldrId = asset.bldrId;
  //         if (bldrIds.includes(bldrId)) return asset;
  //     });

  //     return postAssets.filter(Boolean);
  // }

  // _isolateNewAssets(manifestAssets, stashJSON) {
  //     const postAssets = stashJSON.stash.map((stashItem) => {
  //         return (
  //             Object.prototype.hasOwnProperty.call(stashItem, 'create') &&
  //             stashItem.create &&
  //             stashItem.post
  //         );
  //     });

  //     return postAssets.filter(Boolean);
  // }
};


