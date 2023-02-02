const help = require('../help/init');

module.exports.switch = async (req, argv, blueprint) => {
    try {
        /**
         * Check to ensure request has a supported context flag
         */
        if (!argv.contentBuilder && !argv.cb && !argv.automationStudio && !argv.as && !argv.pkg && !argv.package) {
            throw new Error('Please include a context flag');
        }

        /**
         * Handles all Context Requests
         * Dynamically handle requests and route to correct controller path
         */
        if (argv.contentBuilder || argv.cb) {
            let controller = require(`./contentBuilder/${req}/switch`);
            return controller.switch(req, argv, blueprint, 'contentBuilder');
        }

        if (argv.automationStudio || argv.as) {
            let controller = require(`./automationStudio/${req}/switch`);
            return controller.switch(req, argv, blueprint, 'automationStudio');
        }

        /**
         * Clone pkg route handles cloning from public repositories
         */
        if (argv.package || argv.pkg) {
            let controller = require('../deploy/switch');
            return controller.switch(req, argv, blueprint);
        }
    } catch (err) {
        help.init();
        help.invalidCommand(err.message);
        help.invalidCommand(req);
    }
};
