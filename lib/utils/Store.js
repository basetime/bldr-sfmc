const Conf = require('conf');
const helpInit = require('../help/init');

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
