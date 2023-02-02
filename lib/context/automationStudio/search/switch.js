module.exports.switch = async (req, argv, blueprint) => {
    try {
        /**
         * Handles search filter for searching the DataFolder SOAP Object
         */
        if (argv.f) {
            return blueprint.as_search.dataFolder('automations', 'Name', argv.f);
        }

        /**
         * Handles search filter for searching by Asset Name REST API
         */
        if (argv.a) {
            return blueprint.as_search.asset('name', argv.a);
        }

        if (argv.sql || argv.query) {
            const query = argv.sql || argv.query;
            return blueprint.as_search.activity('queries', query);
        }

        if (argv.ssjs || argv.script) {
            const script = argv.ssjs || argv.script;
            return blueprint.as_search.activity('scripts', script);
        }
    } catch (err) {
        console.log(err);
    }
};
