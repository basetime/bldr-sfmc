"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProjectRoot = exports.getAllFiles = exports.getBldrVersion = exports.createDirectory = exports.appendFile = exports.createFile = exports.fileExists = exports.getRootPath = void 0;
const sfmcContext = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const getFiles = require('node-recursive-directory');
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const state_1 = require("../../_bldr/_processes/state");
const bldrFileSystem_1 = require("../bldrFileSystem");
const _utils_1 = require("../../_bldr/_utils");
const { getState, debug } = new state_1.State();
const isProjectRoot = () => {
    // Get the current working directory that the [add] command was triggered
    const cwdPath = path_1.default.resolve('./');
    return sfmcContext.sfmc_context_mapping.some((context) => context.name && typeof context.name === 'string' && cwdPath.endsWith(context.name));
};
exports.isProjectRoot = isProjectRoot;
/**
 *
 * @param filePath
 * @returns
 */
const fileExists = (filePath) => fs_1.default.existsSync(path_1.default.normalize(filePath));
exports.fileExists = fileExists;
/**
 *
 * @returns
 */
const getRootPath = () => {
    let root = path_1.default.resolve('./');
    let rootFolder = root.split(path_1.default.normalize('/')).pop();
    const rootArr = sfmcContext.sfmc_context_mapping.map(({ name }) => {
        if (rootFolder === name) {
            return root.split(name)[0];
        }
        const slash = path_1.default.normalize('/');
        if (root.includes(`${slash}${name}${slash}`)) {
            return root.split(name)[0];
        }
        return null;
    });
    if (rootArr.filter(Boolean)[0]) {
        return rootArr.filter(Boolean)[0];
    }
    return path_1.default.normalize('./');
};
exports.getRootPath = getRootPath;
/**
 *
 * @param directoryPath
 */
const createDirectory = (directoryPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield promises_1.default.access(directoryPath, fs_1.default.constants.F_OK);
    }
    catch (e) {
        yield promises_1.default.mkdir(directoryPath, { recursive: true });
    }
});
exports.createDirectory = createDirectory;
/**
 *
 * @param filePath
 * @param content
 */
const createFile = (filePath, content) => __awaiter(void 0, void 0, void 0, function* () {
    const filePathDetails = yield (0, _utils_1.getFilePathDetails)(filePath);
    const directoryPath = filePathDetails.dir;
    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }
    directoryPath && (yield createDirectory(directoryPath));
    yield promises_1.default.writeFile(filePath, content);
    return yield fileExists(path_1.default.join(bldrFileSystem_1.resolvedRoot, filePath));
});
exports.createFile = createFile;
/**
 *
 * @param filePath
 * @param content
 */
const appendFile = (filePath, content) => __awaiter(void 0, void 0, void 0, function* () {
    fs_1.default.readFile(filePath, function (err, fileData) {
        if (err)
            throw err;
        if (!fileData.includes(content)) {
            fs_1.default.appendFile(filePath, content, function (err) {
                if (err)
                    throw err;
            });
        }
    });
});
exports.appendFile = appendFile;
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const getBldrVersion = () => __awaiter(void 0, void 0, void 0, function* () {
    const { version } = require('../package.json');
    return version;
});
exports.getBldrVersion = getBldrVersion;
const getAllFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    // // Get the root directory for the project being worked on
    // const dirPath = await getRootPath();
    // // Get the current working directory that the [add] command was triggered
    // const cwdPath = process.cwd();
    // // Identify the context for request
    // const contexts = sfmcContext.sfmc_context_mapping
    //     .map((ctx) => fileExists(path.join(resolvedRoot, ctx.rootName)) && ctx.rootName)
    //     .filter(Boolean);
    // // Store all complete file paths for files in CWD and subdirectories
    // let ctxFiles = new Array();
    // // // if dir is root folder
    // // if (isProjectRoot()) {
    // //     // iterate all contexts and add files
    // //     for (const c in contexts) {
    // //         ctxFiles.push(...(await getFiles(`./${contexts[c]}`)));
    // //     }
    // // } else {
    //       // get files from current working directory and subdirectories
    //       ctxFiles.push(...(await getFiles(path.resolve('./'))));
    // // }
    const stateObject = getState();
    const instance = stateObject && stateObject.instance;
    // Get the root directory for the project being worked on
    const rootPath = bldrFileSystem_1.normalizedRoot;
    // Get the current working directory that the [add] command was triggered
    const cwdPath = process.cwd();
    debug('Folder Path', 'info', { cwdPath, rootPath });
    // Identify the context for request
    const contextsArray = sfmcContext.sfmc_context_mapping.map((context) => context.name);
    // Store all complete file paths for files in CWD and subdirectories
    let contextFiles = [];
    // get files from current working directory and subdirectories
    contextFiles.push(...(yield getFiles(path_1.default.resolve('./'))));
    const filteredContextFiles = contextFiles
        .map((filePath) => {
        const isContextFilePath = contextsArray.some((context) => {
            return filePath.includes(context);
        });
        return (isContextFilePath && filePath) || '';
    })
        .filter(Boolean);
    return filteredContextFiles;
});
exports.getAllFiles = getAllFiles;
