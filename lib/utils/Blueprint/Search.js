// const cliFormat = require('cli-format')
const Column = require('../help/Column');
const display = require('../displayStyles');
const { width } = display.init();

// const fs = require('fs');

const utils = require('../utils');

module.exports = class Search {
    constructor(bldr) {
        this.bldr = bldr;
    }

    async dataFolder(contentType, searchKey, searchTerm) {
        const resp = await this.bldr.folder.search(
            contentType,
            searchKey,
            searchTerm
        );

        if (!resp.Results || !resp.Results.length)
            throw new Error('No Search Items Returned');

        const headers = [
            new Column(`Name`, width.c1),
            new Column(`ID`, width.c1),
            new Column(`Parent Name`, width.c1),
            new Column(`Content Type`, width.c1),
        ];

        const displayContent = resp.Results.map((result) => {
            return [
                new Column(`${result.Name}`, width.c1),
                new Column(`${result.ID}`, width.c1),
                new Column(`${result.ParentFolder.Name}`, width.c1),
                new Column(`${result.ContentType}`, width.c1),
            ];
        });

        display.render(headers, displayContent);
    }

    async asset(searchKey, searchTerm) {
        const resp = await this.bldr.asset.search(searchKey, searchTerm);

        const headers = [
            new Column(`Name`, width.c2),
            new Column(`ID`, width.c0),
            new Column(`Type`, width.c2),
            new Column(`Folder Name`, width.c1),
            new Column(`Folder ID`, width.c0),
            new Column(`Last Modified`, width.c1),
        ];

        const displayContent = resp.items.map((result) => {
            return [
                new Column(`${result.name}`, width.c2),
                new Column(`${result.id}`, width.c0),
                new Column(`${result.assetType.name}`, width.c2),
                new Column(`${result.category.name}`, width.c1),
                new Column(`${result.category.id}`, width.c0),
                new Column(
                    `${utils.splitDateFromISO(result.modifiedDate)}`,
                    width.c1
                ),
            ];
        });

        display.render(headers, displayContent);
    }
};
