const getContentBuilderAssetContent = (asset: {
    content?: string;
    views?: any;
    assetType: {
        name: string;
    };
}) => {
    const assetType = asset.assetType.name;
    let content;

    switch (assetType) {
        case 'webpage':
        case 'htmlemail':
            content = asset && asset.views && asset.views.html && asset.views.html.content;
            break;
        case 'textonlyemail':
            content = asset && asset.views && asset.views.text && asset.views.text.content;
            break;
        case 'htmlblock':
        case 'codesnippetblock':
        case 'jscoderesource':
        case 'jsoncoderesource':
        case 'csscoderesource':
        case 'textcoderesource':
        case 'rsscoderesource':
        case 'xmlcoderesource':
            content = asset.content;
            break;
        default:
            content = JSON.stringify(asset, null, 2);
    }

    return content;
};

export { getContentBuilderAssetContent };
