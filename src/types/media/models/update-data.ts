import type { ObjectSchema } from "@becomes/purple-cheetah/types";

export interface BCMSMediaUpdateData {
  _id: string;
  rename?: string;
  /** ID of the parent dir or `root`. */
  moveTo?: string;
}

export const BCMSMediaUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  rename: {
    __type: 'string',
    __required: false,
  },
  moveTo: {
    __type: 'string',
    __required: false,
  },
};