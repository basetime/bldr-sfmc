const help = require('../help/init');

module.exports.switch = async (req, argv, blueprint) => {
    try {
        /**
         * Check to ensure request has a supported context flag
         */
        if (
            !argv.contentBuilder &&
            !argv.cb &&
            !argv.automationStudio &&
            !argv.as
        )
            throw new Error('Please include a context flag');

        /**
         * Handles all Content Builder Context Requests
         * Dynamically handle requests and route to correct controller path
         */
        if (argv.contentBuilder || argv.cb) {
            let controller = require(`./contentBuilder/${req}/switch`);
            return controller.switch(req, argv, blueprint, 'contentBuilder');
        }
    } catch (err) {
        help.init();
        help.invalidCommand(err.message);
        help.invalidCommand(req);
    }
};
