import { IEntity, Entity, ObjectSchema } from '@becomes/purple-cheetah';
import { Prop } from '../../prop';
import { Types, Schema } from 'mongoose';

export interface IWidget extends IEntity {
  name: string;
  desc: string;
  props: Prop[];
}

export class Widget implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public desc: string,
    public props: Prop[],
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      desc: String,
      props: [Object],
    });
  }
}

export const WidgetSchema: ObjectSchema = {
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
  desc: {
    __type: 'string',
    __required: true,
  },
};
