import { string } from "yargs";

export interface Argv {
  _?: string[];
  // config
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
}