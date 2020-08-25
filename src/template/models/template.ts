import { IEntity, Entity, ObjectSchema } from '@becomes/purple-cheetah';
import { Prop } from '../../prop';
import { Types, Schema } from 'mongoose';

export interface ITemplate extends IEntity {
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: Prop[];
  _schema: ObjectSchema;
}

export class Template implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public label: string,
    public desc: string,
    public userId: string,
    public singleEntry: boolean,
    public props: Prop[],
    // tslint:disable-next-line: variable-name
    public _schema: ObjectSchema,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      label: String,
      desc: String,
      userId: String,
      singleEntry: Boolean,
      props: [Object],
      _schema: Object,
    });
  }
}

export const TemplateSchema: ObjectSchema = {
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
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  singleEntry: {
    __type: 'boolean',
    __required: true,
  },
};
