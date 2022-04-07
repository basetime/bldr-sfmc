const help = require('../help/init');
const Conf = require('conf');
const State = require('../utils/Blueprint/State');

const coreConfiguration = new Conf();
const stateConfiguration = new Conf({
    configName: `sfmc__stateManagement`,
});

const stash = new Conf({
    configName: 'stash',
});

const stateInit = new State(coreConfiguration, stateConfiguration);

module.exports.switch = async (req, argv, blueprint) => {
    if (argv) return blueprint.push.push(stateInit, stash);

    help.init();
};
