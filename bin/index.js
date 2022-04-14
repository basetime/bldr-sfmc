#!/usr/bin/env node
const yargsInteractive = require('yargs-interactive');
const yargs = require('yargs');

const blueprintInit = require('../lib/utils/Blueprint');
const store = require('../lib/utils/Store');

const State = require('../lib/utils/Blueprint/State');
const Config = require('../lib/utils/Blueprint/Config');

// Initate all route switches
const contextSwitch = require('../lib/context/contextSwitch');
const configSwitch = require('../lib/config/switch');
const addSwitch = require('../lib/add/switch');
const pushSwitch = require('../lib/push/switch');
const stashSwitch = require('../lib/stash/switch');
const statusSwitch = require('../lib/status/switch');

// Parse requests and input arguments
const req = yargs.argv._[0] ? yargs.argv._[0].toLowerCase() : null;
const argv = yargs.argv;

/**
 * Initiate CLI application and route requests
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
const init = async (req, argv, store) => {
    if (!req) {
        // If no request is provided show help
        store.help.init();
    } else {
        let blueprint;

        switch (req) {
            /**
             * Config route handles all CLI configuration of SFMC Instance\
             * See README for config details
             */

            case 'config':
                configSwitch.switch(req, argv, store);
                break;

            /**
             * Add files in bulk or by filepath to the stash.json file
             */
            case 'add':
                blueprint = await blueprintInit.set(null, store);
                addSwitch.switch(req, argv, blueprint, store);
                break;

            /**
             * Works with Stash operations
             */
            case 'stash':
                blueprint = await blueprintInit.set(null, store);
                stashSwitch.switch(req, argv, blueprint, store);
                break;

            /**
             * Displays current State and Staged Files
             */
            case 'status':
                blueprint = await blueprintInit.set(null, store);
                statusSwitch.switch(req, argv, blueprint, store);
                break;

            /**
             * Format and push Staged files into current State SFMC Instance
             */
            case 'push':
                blueprint = await blueprintInit.set(null, store);
                pushSwitch.switch(req, argv, blueprint, store);
                break;

            /**
             * Default handles all context specific routes
             * Context specific routes are located in utils/Blueprint/context/:context
             */
            default:
                blueprint = await blueprintInit.set(null, store);
                contextSwitch.switch(req, argv, blueprint, store);
        }
    }
};

init(req, argv, store);
