module.exports.assignObject = (obj) => Object.assign({}, obj)
module.exports.getParentFolderFromArray = (folders, parentId) => folders.filter(folder => folder.id === parentId)
module.exports.splitDateFromISO = (dateStr) => dateStr.substring(0, dateStr.indexOf('T'))
