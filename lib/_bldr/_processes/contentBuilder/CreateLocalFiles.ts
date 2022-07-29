
import { User_BLDR_Config } from "../_user_processes/bldr_config";
import { createFile } from "../../../_utils/fileSystem"
import { displayLine } from "../../../_utils/display";
import {SFMC_Content_Builder_Asset} from "@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets"

const { updateFilesFromConfiguration } = new User_BLDR_Config()



const createEditableFiles = async (assets: SFMC_Content_Builder_Asset[]) => {
  try {
    for (const a in assets) {
      const asset = assets[a];

      const assetType = (asset.assetType && asset.assetType.name) || null;
      //@ts-ignore
      const folderPath = (Object.prototype.hasOwnProperty.call(asset.category, 'folderPath') && asset.category.folderPath) || '';
      const id = asset.id;
      const fileName = asset.name;

      let content;
      let ext;
      let dirPath;
  
      switch (assetType) {
        case 'webpage':
        case 'htmlemail':
          //@ts-ignore
          content = asset && asset.views.html.content;
          ext = '.html';
          dirPath = `${folderPath}/${fileName}${ext}`;
          break;
        case 'codesnippetblock':
        case 'htmlblock':
        case 'jscoderesource':
          content = asset.content;
          ext = '.html';
          dirPath = `${folderPath}/${fileName}${ext}`;
          break;
        case 'textonlyemail':
          //@ts-ignore
          content = asset.views.text.content;
          ext = '.html';
          dirPath = `${folderPath}/${fileName}${ext}`;
          break;
        default:
          content = JSON.stringify(asset, null, 2);
          ext = '.json';
          dirPath = `${folderPath}/${fileName}${ext}`;
      }

      content = await updateFilesFromConfiguration(content);
      await createFile(dirPath, content);

      displayLine(`created: ${asset.name}`, 'success');
    }
  } catch (err: any) {
    displayLine(`ERROR: ${err.message}`);
  }
}

export {
  createEditableFiles
}