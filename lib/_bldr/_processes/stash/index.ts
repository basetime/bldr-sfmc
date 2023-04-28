import { StashItem } from '../../../_types/StashItem';
import { State } from '../state';
import { stash_conf } from '../../../_bldr_sdk/store';
import { displayLine } from '../../../_utils/display';
import { getFilePathDetails } from '../../_utils/index';
import remove from 'lodash.remove';
const { getCurrentInstance } = new State();

export class Stash {
    constructor() {}
    /**
     *
     */
    displayStashStatus = async () => {
        const stashArr = await this.getStashArray();
        displayLine('Staged Files', 'info');

        if (stashArr && stashArr.length) {
            stashArr.forEach((stashObject: StashItem) => {
                const { ext, name } = getFilePathDetails(stashObject.path);
                displayLine(`${stashObject.bldr.folderPath}/${name}${ext}`);
            });
        } else {
            displayLine('No Files Staged');
        }
    };

    clearStash = async () => {
        const instance = await getCurrentInstance();
        await stash_conf.set({ [instance]: { stash: [] } });
        await this.displayStashStatus();
    };

    /**
     *
     * @param stashUpdate
     * @returns
     *
     */
    saveStash = async (stashUpdate: StashItem[] | StashItem) => {
        const instance = await getCurrentInstance();
        const instanceStash = stash_conf.get(instance);
        let stashArr = (instanceStash && instanceStash.stash) || [];

        if (Array.isArray(stashUpdate)) {
            if (!stashUpdate.length) {
                stashArr = [];
            }

            stashUpdate.forEach((update) => {
                const bldrId: string = update.bldr.bldrId;
                const stashIndex = stashArr.findIndex((stashItem: StashItem) => stashItem.bldr.bldrId === bldrId);

                if (stashIndex === -1) {
                    stashArr.push(update);
                } else {
                    stashArr[stashIndex] = update;
                }
            });
        } else {
            const bldrId: string = stashUpdate.bldr.bldrId;
            const stashIndex = stashArr.findIndex((stashItem: StashItem) => stashItem.bldr.bldrId === bldrId);

            if (stashIndex === -1) {
                stashArr.push(stashUpdate);
            } else {
                stashArr[stashIndex] = stashUpdate;
            }
        }

        await stash_conf.set({ [instance]: { stash: stashArr } });
    };

    removeFromStashByBldrId = async (bldrId: string) => {
        const instance = await getCurrentInstance();
        const instanceStash = stash_conf.get(instance);
        let stashArr = (instanceStash && instanceStash.stash) || [];

        const stashIndex = stashArr.findIndex((stashItem: StashItem) => stashItem.bldr.bldrId === bldrId);

        if (stashIndex === -1) {
        } else {
            stashArr.splice(stashArr[stashIndex], 1);
            await stash_conf.set({ [instance]: { stash: stashArr } });
        }
    };

    getStashArray = async () => {
        const instance = await getCurrentInstance();
        const stash = stash_conf.get(instance);
        return stash && stash.stash;
    };
}
