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
exports.Initiate = void 0;
const fs_1 = __importDefault(require("fs"));
const yargs_interactive_1 = __importDefault(require("yargs-interactive"));
const bldrFileSystem_1 = require("../../../_utils/bldrFileSystem");
const manifestJSON_1 = require("../../../_utils/bldrFileSystem/manifestJSON");
const display_1 = require("../../../_utils/display");
const fileSystem_1 = require("../../../_utils/fileSystem");
const metrics_1 = require("../../../_utils/metrics");
const _utils_1 = require("../../_utils");
const state_1 = require("../state");
const path_1 = __importDefault(require("path"));
const contentBuilderInitiate = require('../../../_utils/options/projectInitiate_contentBuilder');
const dataExtensionInitiate = require('../../../_utils/options/projectInitiate_dataExtension');
const { isVerbose, allowTracking, debug } = new state_1.State();
/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
class Initiate {
    constructor() {
        this.updateKeys = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const rootPath = yield (0, fileSystem_1.getRootPath)();
                const ctxFiles = yield (0, fileSystem_1.getAllFiles)();
                for (const c in ctxFiles) {
                    const filePath = ctxFiles[c];
                    let content = fs_1.default.readFileSync(filePath).toString();
                    content = yield (0, bldrFileSystem_1.scrubBldrSfmcEnv)(content);
                    fs_1.default.writeFileSync(filePath, content);
                }
                const manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
                let manifestStr = JSON.stringify(manifestJSON);
                let updatedManifest = JSON.parse(yield (0, bldrFileSystem_1.scrubBldrSfmcEnv)(manifestStr));
                fs_1.default.writeFileSync(path_1.default.join(`${rootPath}.local.manifest.json`), JSON.stringify(updatedManifest, null, 2));
                if (yield (0, fileSystem_1.fileExists)(`${rootPath}package.manifest.json`)) {
                    const pkgJSON = (0, bldrFileSystem_1.readPackageManifest)();
                    let pkgStr = JSON.stringify(pkgJSON);
                    let updatedPkg = JSON.parse(yield (0, bldrFileSystem_1.scrubBldrSfmcEnv)(pkgStr));
                    fs_1.default.writeFileSync(`${rootPath}package.manifest.json`, JSON.stringify(updatedPkg, null, 2));
                }
            }
            catch (err) {
                debug('Update Keys Err', 'error', err);
            }
        });
        this.envOnly = () => {
            return (0, bldrFileSystem_1.createEnv)();
        };
        this.initiateContentBuilderProject = () => __awaiter(this, void 0, void 0, function* () {
            const isWin = yield (0, _utils_1.isWindows)();
            const slash = isWin ? '\\' : '/';
            const rootPath = yield (0, fileSystem_1.getRootPath)();
            const dirExists = yield (0, fileSystem_1.fileExists)(`${rootPath}Content Builder`);
            const dirEmpty = dirExists && (yield (0, _utils_1.isDirEmpty)(`${rootPath}Content Builder`));
            if (!dirExists || dirEmpty) {
                (0, yargs_interactive_1.default)()
                    .usage('$bldr init [args]')
                    .interactive(contentBuilderInitiate)
                    .then((initResults) => __awaiter(this, void 0, void 0, function* () {
                    const folderPaths = [
                        {
                            folderPath: `Content Builder/${initResults.projectName}`,
                        },
                    ];
                    // Create empty directories
                    yield (0, bldrFileSystem_1.createAllDirectories)(folderPaths);
                    // Update ManifestJSON file with responses
                    yield (0, manifestJSON_1.updateManifest)('contentBuilder', { folders: [], assets: [] });
                    if (initResults.createConfig) {
                        yield (0, bldrFileSystem_1.createEnv)();
                    }
                }));
                allowTracking() && (0, metrics_1.incrementMetric)('req_project_initiates_contentBuilder');
            }
            else {
                (0, display_1.displayLine)(`Root directory must be empty`, 'info');
            }
        });
        this.initiateDataExtension = () => __awaiter(this, void 0, void 0, function* () {
            (0, yargs_interactive_1.default)()
                .usage('$bldr init [args]')
                .interactive(dataExtensionInitiate)
                .then((initResults) => __awaiter(this, void 0, void 0, function* () {
                const context = initResults.sharedDataExtension ? 'sharedDataExtension' : 'dataExtension';
                const rootFolder = initResults.sharedDataExtension ? 'Shared Data Extensions' : 'Data Extensions';
                const initFolderPath = initResults.dataExtensionPath
                    ? `${rootFolder}/${initResults.dataExtensionPath}`
                    : rootFolder;
                const folderPaths = [
                    {
                        folderPath: initFolderPath,
                    },
                ];
                // Create empty directories
                yield (0, bldrFileSystem_1.createAllDirectories)(folderPaths);
                // Update ManifestJSON file with responses
                yield (0, manifestJSON_1.updateManifest)(context, { folders: [], assets: [] });
                const dataExtensionInit = {
                    name: initResults.dataExtensionName,
                    customerKey: initResults.dataExtensionName,
                    description: '',
                    fields: [
                        {
                            name: 'Your Field Name',
                            defaultValue: '',
                            isRequired: false,
                            isPrimaryKey: false,
                            fieldType: 'Text | Number | Date | Boolean | EmailAddress | Phone | Decimal | Locale',
                            maxLength: '4000 | {{ Required for Primary Key Field }}',
                        },
                    ],
                    category: {
                        folderPath: initFolderPath,
                    },
                };
                if (initResults.sendableDataExtension) {
                    dataExtensionInit.isSendable = true;
                    dataExtensionInit.sendableDataExtensionField = {
                        name: '{{ name of field to use in sendable relationship }}',
                        fieldType: '{{ field type of field to use in sendable relationship }}',
                    };
                    dataExtensionInit.sendableSubscriberField = {
                        name: 'Subscriber Key',
                    };
                }
                if (initResults.retentionPeriod !== 'None') {
                    switch (initResults.retentionPeriod) {
                        case 'Individual Records':
                            dataExtensionInit.dataRetentionPeriodLength = 6;
                            dataExtensionInit.dataRetentionPeriod = 'Days | Weeks | Months | Years';
                            dataExtensionInit.rowBasedRetention = true;
                            break;
                        case 'All Records and Data Extension':
                            dataExtensionInit.dataRetentionPeriodLength = 6;
                            dataExtensionInit.dataRetentionPeriod = 'Days | Weeks | Months | Years';
                            dataExtensionInit.rowBasedRetention = false;
                            dataExtensionInit.resetRetentionPeriodOnImport = true;
                            break;
                        case 'All Records':
                            dataExtensionInit.rowBasedRetention = false;
                            dataExtensionInit.deleteAtEndOfRetentionPeriod = true;
                            break;
                    }
                }
                yield (0, fileSystem_1.createFile)(`${initFolderPath}/${initResults.dataExtensionName}.json`, dataExtensionInit);
                allowTracking() && (0, metrics_1.incrementMetric)('req_project_initiates_dataExtension');
            }));
        });
    }
}
exports.Initiate = Initiate;
