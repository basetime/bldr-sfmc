const Column = require('../../../help/Column');
const display = require('../../../displayStyles');
const { styles, width } = display.init();
const utils = require('../../../utils');

/**
 * Handle all search functions for Content Builder
 * Interacts with SFMC API via sfmc-api-wrapper lib
 */
module.exports = class ASSearch {
    constructor(bldr) {
        this.bldr = bldr;
    }

    /**
     * Method to search the DataFolder SOAP object
     *
     * @param {string} contentType of folder being searched
     * @param {string} searchKey API property to search for
     * @param {string} searchTerm of folder to search for
     */
    async dataFolder(contentType, searchKey, searchTerm) {
        try {
            const resp = await this.bldr.folder.search(contentType, searchKey, searchTerm);

            if (!resp.Results || !resp.Results.length)
                throw new Error(`No Search Items Returned for ${styles.detail(searchTerm)}`);

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
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**
     * Method to search Automation Studio Assets Endpoint
     *
     * @param {string} searchKey API property to search
     * @param {string} searchTerm of asset to search for
     */
    async asset(searchKey, searchTerm) {
        try {
            const resp = await this.bldr.automation.search(searchKey, searchTerm);

            if (!resp.OverallStatus === 'OK') throw new Error(resp.OverallStatus);

            if (Object.prototype.hasOwnProperty.call(resp, 'Results') && resp.Results.length === 0) {
                throw new Error(`No Search Items Returned for ${styles.detail(searchTerm)}`);
            }

            const headers = [
                new Column(`Name`, 55),
                new Column(`Object ID`, 40),
                new Column(`Active`, width.c1),
                new Column(`Status`, width.c1),
                new Column(`Last Modified`, width.c1),
            ];

            const displayContent = resp.Results.map((result) => {
                return [
                    new Column(`${result.Name}`, 55),
                    new Column(`${result.ObjectID}`, 40),
                    new Column(`${result.IsActive}`, width.c1),
                    new Column(`${utils.automationStatus(result.Status)}`, width.c1),
                    new Column(`${utils.splitDateFromISO(result.ModifiedDate)}`, width.c1),
                ];
            });

            display.render(headers, displayContent);
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**
     * Method to search Automation Studio Activity Endpoint
     *
     * @param {string} searchActivity Endpoint property to search
     * @param {string} searchTerm of asset to search for
     */
    async activity(searchActivity, searchTerm) {
        try {
            const resp = await this.bldr.automation.searchActivity(searchActivity, searchTerm);

            if (Object.prototype.hasOwnProperty.call(resp, 'items') && resp.items.length === 0) {
                throw new Error(`No Search Items Returned for ${styles.detail(searchTerm)}`);
            }

            const headers = [
                new Column(`Name`, 55),
                new Column(`ID`, 40),
                new Column(`Folder ID`, width.c0),
                new Column(`Last Modified`, width.c1),
            ];

            const displayContent = resp.items.map((result) => {
                let objectKey;
                switch (searchActivity) {
                    case 'scripts':
                        objectKey = 'ssjsActivityId';
                        break;
                    case 'queries':
                        objectKey = 'queryDefinitionId';
                        break;
                }

                return [
                    new Column(`${result.name}`, 55),
                    new Column(`${result[objectKey]}`, 40),
                    new Column(`${result.categoryId}`, width.c0),
                    new Column(`${utils.splitDateFromISO(result.modifiedDate)}`, width.c1),
                ];
            });

            display.render(headers, displayContent);
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }
};
