'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createDirectory =
    exports.createAllDirectories =
    exports.readPackageManifest =
    exports.readManifest =
    exports.createEnv =
    exports.scrubBldrSfmcEnv =
    exports.replaceBldrSfmcEnv =
    exports.readBldrSfmcEnvTemplate =
    exports.readBldrSfmcEnv =
        void 0;
const fileSystem_1 = require('../fileSystem');
const fileSystem_2 = require('../fileSystem');
const fs_1 = __importDefault(require('fs'));
const fsPromises = require('fs').promises;
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readBldrSfmcEnv = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        const rootPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${rootPath}.sfmc.env.json`)) {
            const config = fs_1.default.readFileSync(`${rootPath}.sfmc.env.json`);
            return JSON.parse(config.toString());
        }
    });
exports.readBldrSfmcEnv = readBldrSfmcEnv;
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readBldrSfmcEnvTemplate = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        const rootPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${rootPath}template.sfmc.env.json`)) {
            const config = fs_1.default.readFileSync(`${rootPath}template.sfmc.env.json`);
            return JSON.parse(config.toString());
        }
    });
exports.readBldrSfmcEnvTemplate = readBldrSfmcEnvTemplate;
const createEnv = (config = null, template = true) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const configTemplate = config || {
            client_id: '',
            client_secret: '',
            authentication_uri: '',
            parentMID: '',
        };
        const dirPath = yield (0, fileSystem_1.getRootPath)();
        yield (0, fileSystem_2.createFile)(`${dirPath}.sfmc.env.json`, JSON.stringify(configTemplate, null, 2));
        if (template) {
            yield (0, fileSystem_2.createFile)(
                `${dirPath}template.sfmc.env.json`,
                JSON.stringify(configTemplate, null, 2)
            );
        }
        if ((0, fileSystem_1.fileExists)(`${dirPath}.gitignore`)) {
            yield (0, fileSystem_1.appendFile)(`${dirPath}.gitignore`, `\n#sfmc env \n.sfmc.env.json`);
        } else {
            yield (0, fileSystem_2.createFile)(`${dirPath}.gitignore`, `\n#sfmc env \n.sfmc.env.json`);
        }
    });
exports.createEnv = createEnv;
const scrubBldrSfmcEnv = (content) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const dirPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${dirPath}.sfmc.env.json`)) {
            const config = yield readBldrSfmcEnv();
            for (const c in config) {
                const key = c;
                const value = config[c];
                if (value !== '' && content.match(value)) {
                    content = content.replace(value, `{{${key}}}`);
                }
            }
        }
        return content;
    });
exports.scrubBldrSfmcEnv = scrubBldrSfmcEnv;
const replaceBldrSfmcEnv = (content) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const dirPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${dirPath}.sfmc.env.json`)) {
            const config = yield readBldrSfmcEnv();
            for (const c in config) {
                const key = c;
                const value = config[c];
                if (content.match(key)) {
                    content = (value && value !== '' && content.replace(`{{${key}}}`, value)) || content;
                }
            }
        }
        return content;
    });
exports.replaceBldrSfmcEnv = replaceBldrSfmcEnv;
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readManifest = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        const rootPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${rootPath}.local.manifest.json`)) {
            const config = fs_1.default.readFileSync(`${rootPath}.local.manifest.json`);
            return JSON.parse(config.toString());
        }
    });
exports.readManifest = readManifest;
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readPackageManifest = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        const rootPath = yield (0, fileSystem_1.getRootPath)();
        if ((0, fileSystem_1.fileExists)(`${rootPath}package.manifest.json`)) {
            const config = fs_1.default.readFileSync(`${rootPath}package.manifest.json`);
            return JSON.parse(config.toString());
        }
    });
exports.readPackageManifest = readPackageManifest;
const createAllDirectories = (folderPaths) => {
    const directories = folderPaths.map(({ folderPath }) => folderPath);
    for (const f in directories) {
        const dir = directories[f];
        createDirectory(dir);
    }
};
exports.createAllDirectories = createAllDirectories;
const createDirectory = (dir) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fsPromises.access(dir, fs_1.default.constants.F_OK);
        } catch (e) {
            yield fsPromises.mkdir(dir, { recursive: true });
        }
    });
exports.createDirectory = createDirectory;
