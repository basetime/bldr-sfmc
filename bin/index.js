#!/usr/bin/env node
const yargsInteractive = require("yargs-interactive");
const yargs = require("yargs");

const blueprintInit = require("../lib/utils/Blueprint");
const store = require("../lib/utils/Store")

const State = require("../lib/utils/Blueprint/State");
const Config = require("../lib/utils/Blueprint/Config");


// Initate all route switches
const contextSwitch = require("../lib/context/contextSwitch");
const configSwitch = require("../lib/config/switch");
const addSwitch = require("../lib/add/switch");
const pushSwitch = require("../lib/push/switch");
const stashSwitch = require("../lib/stash/switch");

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

    // Route all requests
    switch (req) {
      case "config":
        configSwitch.switch(req, argv, store);
        break;
      case "add":
        blueprint = await blueprintInit.set(null, store)
        addSwitch.switch(req, argv, blueprint, store);
        break;
      case "stash":
        blueprint = await blueprintInit.set(null, store)
        stashSwitch.switch(req, argv, blueprint, store);
        break;
      case "push":
        blueprint = await blueprintInit.set(null, store)
        pushSwitch.switch(req, argv, blueprint, store);
        break;
      default:
        blueprint = await blueprintInit.set(null, store)
        contextSwitch.switch(req, argv, blueprint, store);
    }

  }
}

init(req, argv, store)