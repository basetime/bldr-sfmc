module.exports.switch = async (req, argv, blueprint) => {
    /**
     * Display current State and Staged Files
     */
    return blueprint.status.status();
};
