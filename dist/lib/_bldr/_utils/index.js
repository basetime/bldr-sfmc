"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirEmpty = exports.getFilePathDetails = exports.sfmc_context = exports.uniqueArrayByKey = exports.assignObject = exports.guid = void 0;
const { sfmc_context_mapping } = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const { v4: uuidv4 } = require('uuid');
const fs_1 = __importDefault(require("fs"));
/**
 *
 * @returns GUID
 */
const guid = () => uuidv4();
exports.guid = guid;
/**
 *
 * @param obj
 * @returns
 */
const assignObject = (obj) => Object.assign({}, obj);
exports.assignObject = assignObject;
/**
 *
 * @param array
 * @param key
 * @returns
 */
const uniqueArrayByKey = (array, key) => [...new Map(array.map((item) => [item[key], item])).values()];
exports.uniqueArrayByKey = uniqueArrayByKey;
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
const sfmc_context = (systemFilePath) => sfmc_context_mapping.find((context) => systemFilePath.includes(context.name));
exports.sfmc_context = sfmc_context;
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
const getFilePathDetails = (systemFilePath) => {
    const contextDetails = sfmc_context(systemFilePath);
    const systemFilePathArray = systemFilePath.split('/');
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
exports.getFilePathDetails = getFilePathDetails;
function isDirEmpty(dirname) {
    return fs_1.default.promises.readdir(dirname).then((files) => {
        return files.length === 0;
    });
}
exports.isDirEmpty = isDirEmpty;
