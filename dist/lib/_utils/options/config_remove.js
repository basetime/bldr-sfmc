"use strict";
module.exports.config_remove = (instance) => {
    return {
        interactive: { default: true },
        confirmDelete: {
            type: 'confirm',
            describe: `Please confirm deletion of ${instance}`,
            prompt: 'always',
        },
    };
};
