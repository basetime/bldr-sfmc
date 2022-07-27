import Conf from "conf/dist/source";

interface ConfTypes {
    has: Function;
    get: Function;
    set: Function;
}

const stashInit: ConfTypes = new Conf({
    configName: 'stash',
});

const stateInit: ConfTypes = new Conf({
    configName: `sfmc__stateManagement`,
});

export {
    stashInit,
    stateInit
}
