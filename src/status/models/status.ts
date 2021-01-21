import { Types, Schema } from 'mongoose';
import { Entity, IEntity, ObjectSchema } from '@becomes/purple-cheetah';

export interface IStatus extends IEntity {
  label: string;
  name: string;
  color: string;
}

export class Status implements Entity {
  constructor(
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public label: string,
    public name: string,
    public color: string,
  ) {}

  static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      label: String,
      name: String,
      color: String,
    });
  }
}

export const StatusSchema: ObjectSchema = {
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
  label: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  color: {
    __type: 'string',
    __required: true,
  },
};
