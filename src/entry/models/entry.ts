import { IEntity, Entity, ObjectSchema } from '@becomes/purple-cheetah';
import { Prop, PropSchema } from '../../prop';
import { Types, Schema } from 'mongoose';

export interface EntryMeta {
  lng: string;
  props: Prop[];
}

export const EntryMetaSchema: ObjectSchema = {
  lng: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: PropSchema,
    },
  },
};

export interface IEntry extends IEntity {
  title: string;
  slug: string;
  templateId: string;
  userId: string;
  meta: EntryMeta[];
  content: any[];
}

export class Entry implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public title: string,
    public slug: string,
    public templateId: string,
    public userId: string,
    public meta: EntryMeta[],
    public content: any[],
  ) {}

  static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      title: String,
      slug: String,
      templateId: String,
      userId: String,
      meta: [Object],
      content: [Object],
    });
  }
}

export const EntrySchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  createdAt: {
    __type: 'number',
    __required: true,
  },
  updatedAt: {
    __type: 'number',
    __required: true,
  },
  title: {
    __type: 'string',
    __required: true,
  },
  slug: {
    __type: 'string',
    __required: true,
  },
  templateId: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: EntryMetaSchema,
    },
  },
  content: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
    },
  },
};
