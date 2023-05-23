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
exports.Stash = void 0;
const state_1 = require("../state");
const store_1 = require("../../../_bldr_sdk/store");
const display_1 = require("../../../_utils/display");
const index_1 = require("../../_utils/index");
const { getCurrentInstance } = new state_1.State();
class Stash {
    constructor() {
        /**
         *
         */
        this.displayStashStatus = () => __awaiter(this, void 0, void 0, function* () {
            const stashArr = yield this.getStashArray();
            (0, display_1.displayLine)('Staged Files', 'info');
            if (stashArr && stashArr.length) {
                stashArr.forEach((stashObject) => {
                    const { ext, name } = (0, index_1.getFilePathDetails)(stashObject.path);
                    (0, display_1.displayLine)(`${stashObject.bldr.folderPath}/${name}${ext}`);
                });
            }
            else {
                (0, display_1.displayLine)('No Files Staged');
            }
        });
        this.clearStash = () => __awaiter(this, void 0, void 0, function* () {
            const instance = yield getCurrentInstance();
            yield store_1.stash_conf.set({ [instance]: { stash: [] } });
            yield this.displayStashStatus();
        });
        /**
         *
         * @param stashUpdate
         * @returns
         *
         */
        this.saveStash = (stashUpdate) => __awaiter(this, void 0, void 0, function* () {
            const instance = yield getCurrentInstance();
            const instanceStash = store_1.stash_conf.get(instance);
            let stashArr = (instanceStash && instanceStash.stash) || [];
            if (Array.isArray(stashUpdate)) {
                if (!stashUpdate.length) {
                    stashArr = [];
                }
                stashUpdate.forEach((update) => {
                    const bldrId = update.bldr.bldrId;
                    const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldr.bldrId === bldrId);
                    if (stashIndex === -1) {
                        stashArr.push(update);
                    }
                    else {
                        stashArr[stashIndex] = update;
                    }
                });
            }
            else {
                const bldrId = stashUpdate.bldr.bldrId;
                const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldr.bldrId === bldrId);
                if (stashIndex === -1) {
                    stashArr.push(stashUpdate);
                }
                else {
                    stashArr[stashIndex] = stashUpdate;
                }
            }
            yield store_1.stash_conf.set({ [instance]: { stash: stashArr } });
        });
        this.removeFromStashByBldrId = (bldrId) => __awaiter(this, void 0, void 0, function* () {
            const instance = yield getCurrentInstance();
            const instanceStash = store_1.stash_conf.get(instance);
            let stashArr = (instanceStash && instanceStash.stash) || [];
            const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldr.bldrId === bldrId);
            if (stashIndex === -1) {
            }
            else {
                stashArr.splice(stashArr[stashIndex], 1);
                yield store_1.stash_conf.set({ [instance]: { stash: stashArr } });
            }
        });
        this.getStashArray = () => __awaiter(this, void 0, void 0, function* () {
            const instance = yield getCurrentInstance();
            const stash = store_1.stash_conf.get(instance);
            return stash && stash.stash;
        });
    }
}
exports.Stash = Stash;
