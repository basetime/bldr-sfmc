import { User_BLDR_Config } from '../../../../_bldr/_processes/_userProcesses/bldr_config';
import { createFile } from '../../../fileSystem';
import { displayLine } from '../../../display';

const { updateFilesFromConfiguration } = new User_BLDR_Config();

/**
 *
 * @param assets
 */
const createEmailStudioEditableFiles = async (assets: any[]) => {
    try {
        for (const a in assets) {
            const asset = assets[a];
            const assetType = (asset.assetType && asset.assetType.name) || null;
            const folderPath =
                (Object.prototype.hasOwnProperty.call(asset.category, 'folderPath') && asset.category.folderPath) || '';
            const fileName = asset.name;

            let content;
            let ext;
            let dirPath;

            switch (assetType) {
                case 'dataextension':
                    content = JSON.stringify(asset, null, 2);
                    ext = '.json';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                default:
                    content = JSON.stringify(asset, null, 2);
                    ext = '.json';
                    dirPath = `${folderPath}/${fileName}${ext}`;
            }

            content = await updateFilesFromConfiguration(content);
            await createFile(dirPath, content);

            displayLine(`created [local]: ${asset.name}`, 'success');
        }
    } catch (err: any) {
        displayLine(`ERROR: ${err.message}`);
    }
};

export { createEmailStudioEditableFiles };
