import { IEntity, Entity, ObjectSchema } from '@becomes/purple-cheetah';
import { Types, Schema } from 'mongoose';

export interface ILanguage extends IEntity {
  userId: string;
  code: string;
  name: string;
  nativeName: string;
  def: boolean;
}

export class Language implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public userId: string,
    public code: string,
    public name: string,
    public nativeName: string,
    public def: boolean,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      userId: String,
      code: String,
      name: String,
      nativeName: String,
      def: Boolean,
    });
  }
}

export const LanguageSchema: ObjectSchema = {
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
  userId: {
    __type: 'string',
    __required: true,
  },
  code: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  nativeName: {
    __type: 'string',
    __required: true,
  },
  def: {
    __type: 'boolean',
    __required: true,
  },
};
