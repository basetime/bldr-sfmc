const help = require('../help/init');

module.exports.switch = async (req, argv, blueprint) => {
    /**
     * Update package file names and folder names prior to deployment
     */
    // if(argv.updatePkg){
    //     return blueprint.package.updatePkgFolders()
    // }

    /**
     * Handles all API interactions to POST/PUT Assets into SFMC via API
     * Will update .local.manifiest.json file and .bldr file
     */
    if (argv) {
        return blueprint.package.package();
    }
    /**
     * Handle unknown requests
     */
    return help.init();
};
