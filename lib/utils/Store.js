const Conf = require('conf');
const helpInit = require('../help/init');

const configInit = new Conf();
const stashInit = new Conf({
    configName: 'stash',
});
const stateInit = new Conf({
    configName: `sfmc__stateManagement`,
});

const envInit = new Conf({
    configName: `env`,
});

module.exports = {
    config: configInit,
    stash: stashInit,
    state: stateInit,
    env: envInit,
    help: helpInit,
    process: {},
};

/**
 * {
  config: Conf {
    _deserialize: [Function (anonymous)],
    _serialize: [Function (anonymous)],
    events: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    },
    path: '/Users/anthonyzupancic/Library/Preferences/builder-nodejs/config.json'
  },
  stash: Conf {
    _deserialize: [Function (anonymous)],
    _serialize: [Function (anonymous)],
    events: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    },
    path: '/Users/anthonyzupancic/Library/Preferences/builder-nodejs/stash.json'
  },
  state: Conf {
    _deserialize: [Function (anonymous)],
    _serialize: [Function (anonymous)],
    events: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    },
    path: '/Users/anthonyzupancic/Library/Preferences/builder-nodejs/sfmc__stateManagement.json'
  },
  process: {
    help: {
      init: [Function (anonymous)],
      invalidCommand: [Function (anonymous)]
    },
    state: State { coreConfiguration: [Conf], stateConfiguration: [Conf] },
    config: Config {
      coreConfiguration: [Conf],
      stateConfiguration: [Conf],
      blueprintInit: [Object]
    }
  }
}
 */
