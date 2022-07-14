const KeychainMigration = require('../../lib/utils/Blueprint/patch/KeychainMigration');
/**
 * Flag routing for patch command
 *
 * @param {string} req
 */
module.exports.switch = async (argv) => {
    if (argv['migrate-configs']) {
        return KeychainMigration.migrate();
    }
};
