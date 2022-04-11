const { v4: uuidv4 } = require('uuid');
const contextMap = require('./contextMap');

module.exports.assignObject = (obj) => Object.assign({}, obj);
module.exports.getParentFolderFromArray = (folders, parentId) =>
    folders.filter((folder) => folder.id === parentId);

module.exports.splitDateFromISO = (dateStr) =>
    dateStr.substring(0, dateStr.indexOf('T'));

module.exports.guid = () => uuidv4();

module.exports.filePathDetails = async (filePath) => {
    const ctx = await this.ctx(filePath);
    const folderArr = filePath.split('/');
    const fileName = folderArr.pop();
    const folderName = folderArr.slice(-1).pop();
    const folderPath = folderArr.join('/');

    let projectPath = filePath.substring(filePath.indexOf(ctx.root));
    projectPath = projectPath.split('/');
    projectPath.pop();
    projectPath = projectPath.join('/');

    // filename.html
    // rootFolder/Subdirectory/assetFolder
    // assetFolder
    // rootFolder/Subdirectory/assetFolder/filename.html
    return {
        fileName,
        folderPath,
        folderName,
        projectPath,
    };
};

module.exports.ctx = (filePath) => {
    const ctxFilter = contextMap.map(
        (ctx) => filePath.includes(ctx.root) && ctx
    );
    return ctxFilter.filter(Boolean)[0];
};
