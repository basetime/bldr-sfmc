#!/usr/bin/env node
const yargs = require("yargs");
const yargsInteractive = require("yargs-interactive");


const help = require('../lib/help/init')
const blueprintInit = require("../lib/utils/Blueprint");

const contextSwitch = require("../lib/context/contextSwitch");
const configSwitch = require("../lib/config/switch");
const addSwitch = require("../lib/add/switch");

const req = yargs.argv._[0] ? yargs.argv._[0].toLowerCase() : null;
const argv = yargs.argv;

console.log('input', { req: req, argv: argv })

const init = async (req, argv) => {
  if (!req) {

    help.init();

  } else {

    const blueprint = await blueprintInit.set();

    switch (req) {
      case "config":
        configSwitch.switch(req, argv, blueprint);
        break;
      case "add":
        addSwitch.switch(req, argv, blueprint);
        break;
      default:
        contextSwitch.switch(req, argv, blueprint);
    }

  }
}

init(req, argv)