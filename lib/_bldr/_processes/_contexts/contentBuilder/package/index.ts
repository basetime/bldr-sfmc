import { getContentBuilderAssetContent } from '../../../../../_utils/bldrFileSystem/_context/contentBuilder/GetContentBuilderAssetContent';

const setContentBuilderPackageAssets = async (packageOut: any, contextAssets: any[]) => {
    packageOut['contentBuilder'] = {};
    return (packageOut['contentBuilder']['assets'] = contextAssets.map((asset: any) => {
        return {
            bldrId: asset.bldrId,
            name: asset.name,
            assetType: asset.assetType,
            category: {
                folderPath: (asset.category && asset.category.folderPath) || asset.folderPath,
            },
            content: getContentBuilderAssetContent(asset),
        };
    }));
};

export { setContentBuilderPackageAssets };
