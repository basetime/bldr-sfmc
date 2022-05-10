module.exports.switch = async (req, argv, blueprint) => {
    try {
        /**
         * Handles search filter for searching the DataFolder SOAP Object
         */
        if (argv.f) {
            return blueprint.as_search.dataFolder(
                'automations',
                'Name',
                argv.f
            );
        }

        /**
         * Handles search filter for searching by Asset Name REST API
         */
        if (argv.a) {
            return blueprint.as_search.asset('name', argv.a);
        }

        if(argv.sql){
            return blueprint.as_search.activity('queries', argv.sql)
        }

    } catch (err) {
        console.log(err);
    }
};
