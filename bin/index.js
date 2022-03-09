#!/usr/bin/env node
const yargs = require("yargs");
const yargsInteractive = require("yargs-interactive");

const configSwitch = require("../lib/config/switch");
const stateSwitch = require("../lib/state/switch");
const contextSwitch = require("../lib/context/contextSwitch");
//const cloneSwitch = require("../lib/clone/switch");
const help = require('../lib/help/init')

const req = yargs.argv._[0] ? yargs.argv._[0].toLowerCase() : null;
const argv = yargs.argv;

console.log('input', { req: req, argv: argv })

if (!req) {
  
  help.init();
  
} else {
  switch (req) {
    case "config":
      configSwitch.switch(req, argv);
      break;
    case "state":
      stateSwitch.switch(req, argv);
      break;
    default:
      contextSwitch.switch(req, argv);
  }

}
