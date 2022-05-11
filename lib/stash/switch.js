module.exports.switch = async (req, argv, blueprint) => {
    /**
     * Clear stash contents for current set Instance
     */
    if (argv.c || argv.clear) return blueprint.stash.clear();
};
