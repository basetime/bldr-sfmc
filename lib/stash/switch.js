module.exports.switch = async (req, argv, blueprint) => {
    if (argv.c || argv.clear) return blueprint.stash.clear();
    if (argv.r || argv.remove) return blueprint.stash.remove(argv);
    if (argv.status) return blueprint.stash.status();

    return blueprint.stash.status();
};
