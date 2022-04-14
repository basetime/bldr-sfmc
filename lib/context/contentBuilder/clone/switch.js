module.exports.switch = async (req, argv, blueprint, context) => {
    /**
     * Handles clone from a Content Builder SFMC CategoryID
     * Will capture all folders above and all subfolders recursively
     * Clones all assets in all found folders
     */
    if (argv.f) return blueprint.cb_clone.cloneFromFolder(argv, context);

    /**
     * Handles clone from a Content Builder SFMC AssetId
     * Will capture all folders above and folder asset is in
     * Clones the single asset being targeted
     */
    if (argv.a) return blueprint.cb_clone.cloneFromID(argv.a);
};
