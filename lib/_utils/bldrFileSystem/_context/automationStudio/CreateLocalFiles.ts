import { User_BLDR_Config } from '../../../../_bldr/_processes/_userProcesses/bldr_config';
import { createFile } from '../../../fileSystem';
import { displayLine } from '../../../display';
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

            //@ts-ignore
            const id = asset.id;
            const fileName = asset.name || asset.Name;
            let folderPath = assetType.folder;

            folderPath === 'my automations' ? 'Automation Studio/my automations' : folderPath;

            let content;
            let ext;
            let dirPath;

            switch (assetTypeName) {
                case 'queryactivity':
                    content = asset.queryText;
                    ext = '.sql';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                case 'ssjsactivity':
                    content = asset.script;
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

            displayLine(`created [local]: ${asset.name || asset.Name}`, 'success');
        }
    } catch (err: any) {
        displayLine(`ERROR: ${err.message}`);
    }
};

export { createAutomationStudioEditableFiles };
