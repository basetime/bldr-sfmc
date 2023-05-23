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
exports.Install = void 0;
const fileSystem_1 = require("../../../_utils/fileSystem");
const bldrFileSystem_1 = require("../../../_utils/bldrFileSystem");
const axios_1 = __importDefault(require("axios"));
/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
class Install {
    constructor() {
        this.installPackage = (argv) => __awaiter(this, void 0, void 0, function* () {
            try {
                let pkgData;
                let deployURL = argv && argv._ && argv._[1];
                deployURL = deployURL === null || deployURL === void 0 ? void 0 : deployURL.replace(/^\/\/|^.*?:(\/\/)?/, '');
                if (deployURL && deployURL.includes('github')) {
                    pkgData = yield this.githubJSON(deployURL);
                }
                if (pkgData && pkgData.status === 'Error') {
                    throw new Error(pkgData.statusText);
                }
                if (Object.prototype.hasOwnProperty.call(pkgData.package, 'sfmcEnv')) {
                    yield (0, bldrFileSystem_1.createEnv)(pkgData.package.sfmcEnv, true);
                }
                if (Object.prototype.hasOwnProperty.call(pkgData, 'readme')) {
                    yield (0, fileSystem_1.createFile)('./README.md', pkgData.readme);
                }
                yield (0, fileSystem_1.createFile)(`./package.manifest.json`, JSON.stringify(pkgData.package, null, 2));
            }
            catch (err) {
                console.log(err.message);
            }
        });
        this.githubJSON = (deployURL) => __awaiter(this, void 0, void 0, function* () {
            try {
                //process github
                let readmeData;
                const deployArray = deployURL.split('/');
                const owner = deployArray[1];
                const repo = deployArray[2].indexOf('.') === -1
                    ? deployArray[2]
                    : deployArray[2].substring(0, deployArray[2].indexOf('.'));
                const getRepository = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/contents/`);
                if (!getRepository) {
                    throw new Error('Repository not found.');
                }
                const packageJSON = getRepository.data.find((file) => file.name === 'package.manifest.json');
                const readme = getRepository.data.find((file) => file.name === 'README.md');
                if (readme) {
                    const readmeRequest = yield axios_1.default.get(readme.download_url);
                    readmeData = readmeRequest.data;
                }
                if (!packageJSON) {
                    throw new Error('package.manifest.json not found');
                }
                else {
                    const getPackageJSON = yield axios_1.default.get(packageJSON.download_url);
                    return {
                        package: getPackageJSON.data,
                        readme: readmeData,
                    };
                }
            }
            catch (err) {
                console.log(err.message);
            }
        });
    }
}
exports.Install = Install;
