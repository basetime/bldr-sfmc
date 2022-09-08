const { sfmc_context_mapping } = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const { v4: uuidv4 } = require('uuid');
import fs from 'fs'
/**
 *
 * @returns GUID
 */
const guid = () => uuidv4();
/**
 *
 * @param obj
 * @returns
 */
const assignObject = (obj: any) => Object.assign({}, obj);
/**
 *
 * @param array
 * @param key
 * @returns
 */
const uniqueArrayByKey = (array: any[], key: string) => [...new Map(array.map((item) => [item[key], item])).values()];
/**
 *
 * @param systemFilePath
 * @returns
 *
 * ```
 *  {
 *    name: string;
 *    context: string;
 *    contentType: string;
 *  }
 * ```
 *
 */
const sfmc_context = (systemFilePath: string) =>
    sfmc_context_mapping.find((context: { name: string }) => systemFilePath.includes(context.name));
/**
 *
 * @param systemFilePath
 * @returns
 *
 * ```
 *  {
 *    fileName: string;
 *    fileExtension: string;
 *    folderPath: string;
 *    folderName: string;
 *    context: {
 *      name: string;
 *      context: string;
 *      contentType: string;
 *    }
 *  }
 * ```
 */
const getFilePathDetails = (systemFilePath: string) => {
    const contextDetails = sfmc_context(systemFilePath);
    const systemFilePathArray: string[] = systemFilePath.split('/');
    let fileName = systemFilePathArray && systemFilePathArray.pop();
    const fileExtension = fileName && fileName.substring(fileName.indexOf('.') + 1);
    fileName = fileName && fileName.substring(0, fileName.indexOf('.'));
    const folderName = systemFilePathArray && systemFilePathArray.slice(-1).pop();
    const projectPath = systemFilePath.substring(systemFilePath.indexOf(contextDetails.name));
    const projectPathArray = projectPath.split('/');
    projectPathArray.pop();
    const folderPath = projectPathArray.join('/');

    return {
        fileName,
        fileExtension,
        folderPath,
        folderName,
        context: contextDetails,
    };
};

function isDirEmpty(dirname: string) {
    return fs.promises.readdir(dirname).then(files => {
        return files.length === 0;
    });
}

export { guid, assignObject, uniqueArrayByKey, sfmc_context, getFilePathDetails, isDirEmpty };
