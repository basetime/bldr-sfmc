module.exports.switch = async (req, argv, blueprint, context) => {
    /**
     * Handles clone from a Content Builder SFMC CategoryID
     * Will capture all folders above and all subfolders recursively
     * Clones all assets in all found folders
     */
    if (argv.f) return blueprint.as_clone.cloneAutomationsFromFolder(argv, context);

    /**
     * Handles clone from a Content Builder SFMC AssetId
     * Will capture all folders above and folder asset is in
     * Clones the single asset being targeted
     */
    if (argv.a) return blueprint.as_clone.cloneAutomationsFromID(argv.a);

    /**
     * Handles clone from a Content Builder SFMC AssetId
     * Will capture all folders above and folder asset is in
     * Clones the single asset being targeted
     */
    if (argv.sql || argv.query) {
        const query = argv.sql || argv.query;
        return blueprint.as_clone.cloneAutomationActivityFromID('queries', query);
    }

    if (argv.ssjs || argv.script) {
        const script = argv.ssjs || argv.script;
        return blueprint.as_clone.cloneAutomationActivityFromID('scripts', script);
    }
};
