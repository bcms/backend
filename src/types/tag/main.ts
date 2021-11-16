import { FSDBEntity } from "@becomes/purple-cheetah-mod-fsdb/types";

export interface Tag extends FSDBEntity {
  /** Unique */
  value: string;
}

