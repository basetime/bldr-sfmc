import { User_BLDR_Config } from '../../../../_bldr/_processes/_userProcesses/bldr_config';
import { createFile } from '../../../fileSystem';
import { displayLine } from '../../../display';
import { uniqueArrayByKey } from '../../../../_bldr/_utils';
const { updateFilesFromConfiguration } = new User_BLDR_Config();

/**
 *
 * @param assets
 */
const createAutomationStudioEditableFiles = async (assets: any[]) => {
    try {
        for (const a in assets) {
            const asset = assets[a];
            const assetType = asset.assetType || null;
            const assetTypeName = assetType && assetType.name;
            const fileName = asset.name || asset.Name;
            let folderPath = asset.category.folderPath || (assetType && assetType.folder);

            if (asset && asset.hasBeenDeleted && asset.hasBeenDeleted === true) {
                displayLine(`Error Creating File [local | ${assetTypeName}]: Automation Definition Deleted`, 'error');
                return;
            }

            folderPath === 'my automations' ? 'Automation Studio/my automations' : folderPath;
            folderPath = folderPath.includes('Automation Studio') ? folderPath : `Automation Studio/${folderPath}`;

            let content;
            let ext;
            let dirPath;

            let assetIdKey: string;
            switch (assetTypeName) {
                case 'queryactivity':
                    content = asset.queryText;
                    ext = '.sql';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                case 'ssjsactivity':
                    content = asset.script;
                    ext = '.js';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                default:
                    content = JSON.stringify(asset, null, 2);
                    ext = '.json';
                    dirPath = `${folderPath}/${fileName}${ext}`;
            }

            content = await updateFilesFromConfiguration(content);
            const createFileResult = await createFile(dirPath, content);
            createFileResult &&
                displayLine(`Successfully Created [local | ${assetTypeName}]: ${asset.name || asset.Name}`, 'success');
            !createFileResult &&
                displayLine(`Error Creating File [local | ${assetTypeName}]: ${asset.name || asset.Name}`, 'error');
        }
    } catch (err: any) {
        displayLine(`ERROR: ${err.message}`);
    }
};

export { createAutomationStudioEditableFiles };
