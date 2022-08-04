import { StashItemPut, StashItemPost } from "../../_types/StashItem";
import { State } from "./State";
import fs from "fs";

import { stash_conf } from "../../_bldr_sdk/store";

import { displayLine } from "../../_utils/display";

import { getFilePathDetails } from "../_utils/index";

const { getCurrentInstance } = new State();

export class Stash {
  constructor() {}
  /**
   *
   */
  displayStashStatus = async () => {
    const stashArr = await this.getStashArray();
    displayLine("Staged Files", "info");

    if (stashArr && stashArr.length) {
      stashArr.forEach((stashObject: StashItemPost | StashItemPut) => {
        const { folderPath, fileName } = getFilePathDetails(stashObject.path);

        displayLine(`${folderPath}/${fileName}`);
      });
    } else {
      displayLine("No Files Staged");
    }
  };

  clearStash = async () => {
    const instance = await getCurrentInstance();
    await stash_conf.set({ [instance]: { stash: [] } });
    await this.displayStashStatus();
  };

  /**
   *
   * @param stashUpdate
   * @returns
   */
  saveStash = async (
    stashUpdate: StashItemPut[] | StashItemPost[] | StashItemPut | StashItemPost
  ) => {
    const instance = await getCurrentInstance();
    const instanceStash = stash_conf.get(instance);
    const stashArr = (instanceStash && instanceStash.stash) || [];

    if (Array.isArray(stashUpdate)) {
      stashUpdate.forEach((update) => {
        const bldrId: string = update.bldr.bldrId;

        const stashIndex = stashArr.findIndex(
          (stashItem: StashItemPut | StashItemPost) =>
            stashItem.bldr.bldrId === bldrId
        );

        if (stashIndex === -1) {
          stashArr.push(update);
        } else {
          stashArr[stashIndex] = update;
        }
      });
    } else {
      const bldrId: string = stashUpdate.bldr.bldrId;

      const stashIndex = stashArr.findIndex(
        (stashItem: StashItemPut | StashItemPost) =>
          stashItem.bldr.bldrId === bldrId
      );

      if (stashIndex === -1) {
        stashArr.push(stashUpdate);
      } else {
        stashArr[stashIndex] = stashUpdate;
      }
    }

    await stash_conf.set({ [instance]: { stash: stashArr } });
  };

  getStashArray = async () => {
    const instance = await getCurrentInstance();
    const stash = stash_conf.get(instance);
    return stash && stash.stash;
  };

  // async _setStashObj(dirPath, obj, newAsset) {
  //   let assetType;
  //   let stashContent;

  //   const instance = await this._stateInstance();
  //   let file = fs.readFileSync(obj.path);

  //   if (Object.prototype.hasOwnProperty.call(obj, 'assetType')) {
  //     assetType = obj.assetType.name;
  //   } else {
  //     if (
  //       obj.path.includes('.html') ||
  //       obj.path.includes('.js') ||
  //       obj.path.includes('.sql')
  //     ) {
  //       assetType = 'string';
  //     } else {
  //       assetType = 'json';
  //     }
  //   }

  //   const categoryDetails = await this._getManifestFolderData(obj);

  //   if (newAsset) {
  //     switch (assetType) {
  //       case 'webpage':
  //       case 'htmlemail':
  //         stashContent = `${await utils.scrubConfig(
  //           file.toString()
  //         )}`;
  //         obj.views.html.content = stashContent;
  //         break;
  //       case 'codesnippetblock':
  //         stashContent = `${await utils.scrubConfig(
  //           file.toString()
  //         )}`;
  //         obj.content = stashContent;
  //         break;
  //       case 'textonlyemail':
  //         stashContent = `${await utils.scrubConfig(
  //           file.toString()
  //         )}`;
  //         obj.views.text.content = stashContent;
  //         break;
  //       default:
  //         stashContent = `${await utils.scrubConfig(
  //           JSON.stringify(file)
  //         )}`;
  //         obj = JSON.parse(stashContent);
  //     }

  //     if (categoryDetails) {
  //       obj.category.id = categoryDetails.id;
  //       obj.category.parentId = categoryDetails.parentId;
  //     }

  //     await this.localFile.createFile(obj.path, stashContent);
  //     return obj;
  //   } else {
  //     switch (assetType) {
  //       case 'string':
  //         stashContent = `${await utils.scrubConfig(
  //           file.toString()
  //         )}`;
  //         obj.fileContent = stashContent;
  //         break;
  //       default:
  //         stashContent = `${await utils.scrubConfig(
  //           JSON.stringify(file)
  //         )}`;
  //         obj = JSON.parse(stashContent);
  //     }

  //     let updatedFileContent = obj.fileContent || obj;
  //     await this.localFile.createFile(obj.path, updatedFileContent);
  //     await this._saveStash(instance, obj);
  //   }
  // }

  // _stateInstance() {
  //   const state = this.store.state.get();
  //   const stateJSON = utils.assignObject(state);
  //   return stateJSON.instance;
  // }

  // async _getManifestFolderData(obj) {
  //   const dirPath = await this.localFile._getRootPath(contextMap);
  //   const manifestJSON = await this.localFile._getManifest(dirPath);
  //   const context = obj.bldr.context;
  //   const folders = manifestJSON[context]['folders'];
  //   const folderDetails = await utils.filePathDetails(obj.path);
  //   const folderResp = folders.find(
  //     ({ folderPath }) => folderDetails.projectPath === folderPath
  //   );
  //   return folderResp;
  // }

  // async _getManifestAssetData() {
  //   const dirPath = await this.localFile._getRootPath(contextMap);
  //   const manifestJSON = await this.localFile._getManifest(dirPath);
  //   return manifestJSON;
  // }
}
