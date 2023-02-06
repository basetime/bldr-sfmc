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
exports.getAllFiles = exports.getBldrVersion = exports.createDirectory = exports.appendFile = exports.createFile = exports.fileExists = exports.getRootPath = void 0;
const sfmcContext = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const getFiles = require('node-recursive-directory');
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const state_1 = require("../../_bldr/_processes/state");
const { debug } = new state_1.State();
/**
 *
 * @param filePath
 * @returns
 */
const fileExists = (filePath) => fs_1.default.existsSync(filePath);
exports.fileExists = fileExists;
/**
 *
 * @returns
 */
const getRootPath = () => {
    const rootArr = sfmcContext.sfmc_context_mapping.map(({ name }) => {
        const dirPath = path_1.default.resolve('./');
        if (dirPath.includes(name)) {
            return dirPath.split(name)[0];
        }
        return null;
    });
    if (rootArr.filter(Boolean)[0]) {
        return rootArr.filter(Boolean)[0];
    }
    return './';
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
    const dirPathArr = filePath.split('/');
    dirPathArr.pop();
    const directoryPath = dirPathArr.join('/');
    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }
    yield fs_1.default.writeFile(filePath, content, 'utf8', (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            yield createDirectory(directoryPath);
            yield createFile(filePath, content);
        }
    }));
    return fileExists(filePath) ? true : false;
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
    // Get the root directory for the project being worked on
    const dirPath = yield getRootPath();
    // Get the current working directory that the [add] command was triggered
    const cwdPath = process.cwd();
    // Identify the context for request
    const contexts = sfmcContext.sfmc_context_mapping
        .map((ctx) => fileExists(`./${ctx.rootName}`) && ctx.rootName)
        .filter(Boolean);
    // Store all complete file paths for files in CWD and subdirectories
    let ctxFiles = new Array();
    // if dir is root folder
    if (dirPath === './') {
        // iterate all contexts and add files
        for (const c in contexts) {
            ctxFiles.push(...(yield getFiles(`./${contexts[c]}`)));
        }
    }
    else {
        // get files from current working directory and subdirectories
        ctxFiles.push(...(yield getFiles(`${cwdPath}`)));
    }
    return ctxFiles;
});
exports.getAllFiles = getAllFiles;
