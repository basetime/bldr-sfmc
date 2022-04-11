const fs = require('fs');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const contextMap = require('../contextMap');
const { styles, width } = display.init();


const Config = require('./Config');
const State = require('./State');


module.exports = class Status {
    constructor(bldr, stash, store) {
        this.bldr = bldr;
        this.stash = stash;
        this.store = store;
    }

    async status() {
        const configInit = new Config(this.store.config, this.store.state);
        const stateInit = new State(this.store.config, this.store.state);

        const state = await stateInit.get();
        const stateHeaders = [new Column(`${styles.command('Current State')}`, width.c4)];

        display.render(
            stateHeaders,
            [
                [
                    new Column(
                        `${JSON.stringify(state, null, 2)}`,
                        width.c4
                    ),
                ],
            ]
        );


        // Stash Status
        const stashArr = await this.stash._getStashArr();
        const headers = [new Column(`${styles.command('Staged Files')}`, width.c4)];

        if (stashArr && stashArr.length) {
            const displayContent = stashArr.map(({ bldr }) => {
                return [new Column(`${bldr.folderPath}`, width.c4)];
            });
            display.render(headers, displayContent);
        } else {
            const headers = [new Column(`${styles.command('Staged Files')}`, width.c4)];

            display.render(
                headers,
                [
                    [
                        new Column(
                            `${styles.callout('No Files Staged')}`,
                            width.c4
                        ),
                    ],
                ]
            );
        }
    }



};
