import { string } from 'yargs';

export interface Argv {
    de: any;
    'data-extension'?: Boolean;
    verbose: Boolean;
    _?: string[];
    // Config
    n?: string;
    new?: string;
    l?: string | null;
    list?: string;
    r?: string;
    remove?: string;
    s?: string;
    set?: string;
    m?: string;
    mid?: string;
    // Stash
    c?: Boolean;
    clear?: Boolean;
    // Context
    cb?: Boolean;
    'f:sql'?: string;
    'content-builder'?: Boolean;
    as?: Boolean;
    'automation-studio'?: Boolean;
    // Context Types
    f?: Boolean | string;
    a?: Boolean | string;
    sql?: Boolean;
    ssjs?: Boolean;
    'sfmc-only'?: Boolean;
    'local-only'?: Boolean;
    'update-env-keys'?: Boolean;
    'env-only'?: Boolean;
}
