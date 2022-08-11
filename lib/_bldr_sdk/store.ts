import Conf from 'conf/dist/source';

interface ConfTypes {
    has: Function;
    get: Function;
    set: Function;
    path: string;
}

const stash_conf: ConfTypes = new Conf({
    configName: 'stash',
});

const state_conf: ConfTypes = new Conf({
    configName: `sfmc__stateManagement`,
});

export { stash_conf, state_conf };
