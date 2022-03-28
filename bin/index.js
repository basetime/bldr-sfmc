#!/usr/bin/env node
const Config = require("../lib/utils/Blueprint/Config");
const State = require("../lib/utils/Blueprint/State");
const yargs = require("yargs");
const yargsInteractive = require("yargs-interactive");
const blueprintInit = require("../lib/utils/Blueprint");
const store = require("../lib/utils/Store")

const contextSwitch = require("../lib/context/contextSwitch");
const configSwitch = require("../lib/config/switch");
const addSwitch = require("../lib/add/switch");
const pushSwitch = require("../lib/push/switch");

const req = yargs.argv._[0] ? yargs.argv._[0].toLowerCase() : null;
const argv = yargs.argv;

console.log('input', { req: req, argv: argv })

const init = async (req, argv, store) => {
  if (!req) {

    store.help.init();

  } else {
    const blueprint = await blueprintInit.set(null, store)

    switch (req) {
      case "config":
        configSwitch.switch(req, argv, blueprint, store);
        break;
      case "add":
        addSwitch.switch(req, argv, blueprint, store);
        break;
      case "push":
        pushSwitch.switch(req, argv, blueprint, store);
        break;
      default:
        contextSwitch.switch(req, argv, blueprint, store);
    }

  }
}

init(req, argv, store)