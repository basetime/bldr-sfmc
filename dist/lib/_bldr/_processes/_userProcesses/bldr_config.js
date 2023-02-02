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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_BLDR_Config = void 0;
const fileSystem_1 = require("../../../_utils/fileSystem");
const bldrFileSystem_1 = require("../../../_utils/bldrFileSystem");
class User_BLDR_Config {
    constructor() {
        // createAPIConfig = async (config, template = true) => {
        //   const configTemplate = config || {
        //     client_id: '',
        //     client_secret: '',
        //     authentication_uri: '',
        //     parentMID: '',
        //   };
        //   const dirPath = await localFiles._getRootPath(contextMap);
        //   localFiles.createFile(
        //     `${dirPath}.sfmc.config.json`,
        //     JSON.stringify(configTemplate, null, 2)
        //   );
        //   if (template) {
        //     localFiles.createFile(
        //       `${dirPath}template.sfmc.config.json`,
        //       JSON.stringify(configTemplate, null, 2)
        //     );
        //   }
        //   localFiles.append(
        //     `${dirPath}.gitignore`,
        //     `\n#sfmc config \n.sfmc.config.json`
        //   );
        // };
        this.updateFilesFromConfiguration = (content) => __awaiter(this, void 0, void 0, function* () {
            const rootPath = yield (0, fileSystem_1.getRootPath)();
            if ((0, fileSystem_1.fileExists)(`${rootPath}.sfmc.config.json`)) {
                const config = yield (0, bldrFileSystem_1.readBldrSfmcEnv)();
                for (const c in config) {
                    const key = c;
                    const value = config[c];
                    if (content.match(value)) {
                        content = content.replace(value, `{{${key}}}`);
                    }
                }
            }
            return content;
        });
    }
}
exports.User_BLDR_Config = User_BLDR_Config;
