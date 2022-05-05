const Add = require('./Add');

const CBClone = require('./context/contentBuilder/Clone');
const CBSearch = require('./context/contentBuilder/Search');
const ASClone = require('./context/automationStudio/Clone');
const ASSearch = require('./context/automationStudio/Search');
const Push = require('./Push');

const LocalFile = require('./LocalFile');
const Status = require('./Status');
const Stash = require('./Stash');

/**
 * All Class Objects for Blueprint SDK
 */
module.exports = class Blueprint {
    constructor(bldr, contextMap, store) {
        this.bldr = bldr;
        this.local = new LocalFile(this.bldr, contextMap, store);
        this.stash = new Stash(this.bldr, this.local, store);
        this.status = new Status(this.bldr, this.stash, store);
        this.push = new Push(this.bldr, this.local, contextMap, store);
        this.cb_clone = new CBClone(this.bldr, this.local, contextMap, store);
        this.cb_search = new CBSearch(this.bldr, contextMap, store);
        this.as_clone = new ASClone(this.bldr, this.cb_clone, this.local, contextMap, store);
        this.as_search = new ASSearch(this.bldr, contextMap, store);

        this.add = new Add(
            this.bldr,
            this.local,
            this.stash,
            contextMap,
            store
        );
    }
};
