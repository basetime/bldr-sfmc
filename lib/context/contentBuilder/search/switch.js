module.exports.switch = async (req, argv, blueprint) => {
    try {
        if (argv.f) return blueprint.cb_search.dataFolder('asset', 'Name', argv.f);
        if (argv.a) return blueprint.cb_search.asset('name', argv.a);
    } catch (err) {
        console.log(err);
    }
};
