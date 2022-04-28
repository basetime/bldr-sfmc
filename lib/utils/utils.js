const { v4: uuidv4 } = require('uuid');
const contextMap = require('./contextMap');

module.exports.assignObject = (obj) => Object.assign({}, obj);
module.exports.uniqueArray = (arr, key) =>
    arr.filter((v, i, a) => a.findIndex((v2) => v2[key] === v[key]) === i);

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

module.exports.automationStatus = (status) => {
    let statusText;

    switch (status) {
        case -1:
            statusText = 'Error';
            break;
        case 0:
            statusText = 'BuildingError';
            break;
        case 1:
            statusText = 'Building';
            break;
        case 2:
            statusText = 'Ready';
            break;
        case 3:
            statusText = 'Running';
            break;
        case 4:
            statusText = 'Paused';
            break;
        case 5:
            statusText = 'Stopped';
            break;
        case 6:
            statusText = 'Scheduled';
            break;
        case 7:
            statusText = 'Awaiting';
            break;
        case 8:
            statusText = 'InactiveTrigger';
            break;
    }

    return statusText;
};


module.exports.identifyAutomationStudioActivityType = (objectTypeId) => {
    let out;

    switch (objectTypeId) {
        case 300:
            out = {
                api: 'queries',
                name: 'queryactivity',
                objectIdKey: 'queryDefinitionId',
                folder: 'Automation Studio/Query',
            };
            break;
        case 423:
            out = {
                api: 'scripts',
                name: 'ssjsactivity',
                objectIdKey: 'ssjsActivityId',
                folder: 'Automation Studio/Scripts',
            };
            break;
        case 43:
            out = {
                api: 'imports',
                name: 'importactivity',
                objectIdKey: 'importDefinitionId',
                folder: 'Automation Studio/File Imports',
            };
            break;
        case 53:
            out = {
                api: 'filetransfers',
                name: 'transferactivity',
                objectIdKey: 'id',
                folder: 'Automation Studio/File Transfers',
            };
            break;
        case 303:
            out = {
                api: 'filters',
                name: 'filteractivity',
                objectIdKey: 'filterActivityId',
                folder: 'Automation Studio/Filters',
            };
            break;

        case 303:
            out = {
                api: 'filters',
                name: 'filteractivity',
                objectIdKey: 'filterActivityId',
                folder: 'Automation Studio/Filters',
            };
            break;
        default:
    }

    return out;
};


/**
 * Automation Studio Object Reference
 *

    Salesforce Send
    "objectTypeId": 771

    Data Extract
    "objectTypeId": 73

    Fire Event
    "objectTypeId": 749

    Guided Send
    "objectTypeId": 42

    Wait Activity
    "objectTypeId": 467

    Verification Activity
    "objectTypeId": 1000

    Refresh Group
    "objectTypeId": 45

    Data Factory Utility
    "objectTypeId": 425

    Send SMS
    "objectTypeId": 725

    Import Mobile Contacts
    "objectTypeId": 726

    Refresh Mobile Filtered List
    "objectTypeId": 724

    Send GroupConnect
    "objectTypeId": 783

    Report Definition
    "objectTypeId": 84

    Send Push
    "objectTypeId": 736



    //DONE//
    ---Query Activity---
    "objectTypeId": 300

    ---Script Activity---
    "objectTypeId": 423

    Import File
    "objectTypeId": 43

    File Transfer
    "objectTypeId": 53

    Filter Activity
    "objectTypeId": 303
 */
