const package_new = (manifestJSON: any) => {
    return {
        interactive: { default: true },
        name: {
            type: 'input',
            describe: 'Package Name?',
            default: (manifestJSON && manifestJSON.name) || null,
            prompt: 'always',
        },
        packageVersion: {
            type: 'input',
            describe: 'Package Version? (major.minor.patch)',
            default: (manifestJSON && manifestJSON.version) || '1.0.0',
            prompt: 'always',
        },
        repository: {
            type: 'input',
            describe: 'Repository URL?',
            default: (manifestJSON && manifestJSON.repository) || null,
            prompt: 'always',
        },
        tags: {
            type: 'input',
            describe: 'Package Tags (comma separated)',
            default: (manifestJSON && manifestJSON.tags && manifestJSON.tags.join(', ')) || null,
            prompt: 'always',
        },
        description: {
            type: 'input',
            describe: 'Description',
            default: (manifestJSON && manifestJSON.description) || null,
            prompt: 'always',
        },
    };
};

export { package_new };
