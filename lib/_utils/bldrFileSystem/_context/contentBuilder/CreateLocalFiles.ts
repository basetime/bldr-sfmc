import { User_BLDR_Config } from '../../../../_bldr/_processes/_userProcesses/bldr_config';
import { createFile } from '../../../fileSystem';
import { displayLine } from '../../../display';
import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';

const { updateFilesFromConfiguration } = new User_BLDR_Config();

/**
 *
 * @param assets
 */
const createContentBuilderEditableFiles = async (assets: SFMC_Content_Builder_Asset[]) => {
    try {
        for (const a in assets) {
            const asset = assets[a];
            const assetType = (asset.assetType && asset.assetType.name) || null;
            const folderPath =
                (Object.prototype.hasOwnProperty.call(asset.category, 'folderPath') && asset.category.folderPath) || '';
            const id = asset.id;
            const fileName = asset.name;

            let content;
            let ext;
            let dirPath;

            switch (assetType) {
                case 'webpage':
                case 'htmlemail':
                    content = asset && asset.views && asset.views.html && asset.views.html.content || asset.content;
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
                    content = asset&& asset.views && asset.views.text && asset.views.text.content;
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

            displayLine(`created [local]: ${asset.name}`, 'success');
        }
    } catch (err: any) {
        displayLine(`ERROR: ${err.message}`);
    }
};

export { createContentBuilderEditableFiles };
