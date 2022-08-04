import { string } from "yargs";

export interface Argv {
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
  'content-builder'?: Boolean;
  as?: Boolean;
  'automation-studio'?: Boolean;
  // Context Types
  f?: Boolean;
  a?: Boolean;
  sql?: Boolean;
  ssjs?: Boolean
}
