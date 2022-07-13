const help = require('../help/init');

module.exports.switch = async (req, argv, blueprint) => {
    /**
     * Handles all API interactions to POST/PUT Assets into SFMC via API
     * Will update .local.manifiest.json file and .bldr file
     */
    if (argv) {
        return blueprint.deploy.init(argv);
    }
    /**
     * Handle unknown requests
     */
    return help.init();
};
