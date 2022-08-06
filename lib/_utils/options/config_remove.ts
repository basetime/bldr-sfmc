module.exports.config_remove = (instance: string) => {
    return {
        interactive: { default: true },
        confirmDelete: {
            type: 'confirm',
            describe: `Please confirm deletion of ${instance}`,
            prompt: 'always',
        },
    };
};
