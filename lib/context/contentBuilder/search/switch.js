module.exports.switch = async (req, argv, blueprint) => {
    /**
     * Handles search filter for searching the DataFolder SOAP Object
     */
    if (argv.f) {
        return blueprint.cb_search.dataFolder('asset', 'Name', argv.f);
    }

    /**
     * Handles search filter for searching by Asset Name REST API
     */
    if (argv.a) {
        return blueprint.cb_search.asset('name', argv.a);
    }
};
