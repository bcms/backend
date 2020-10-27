import { IEntity, Entity, ObjectSchema } from '@becomes/purple-cheetah';
import { Types, Schema } from 'mongoose';

export enum MediaType {
  DIR = 'DIR',
  IMG = 'IMG',
  VID = 'VID',
  TXT = 'TXT',
  GIF = 'GIF',
  OTH = 'OTH',
  PDF = 'PDF',
  JS = 'JS',
  HTML = 'HTML',
  CSS = 'CSS',
  JAVA = 'JAVA',
}

export interface IMedia extends IEntity {
  userId: string;
  type: MediaType;
  mimetype: string;
  size: number;
  name: string;
  path: string;
  isInRoot: boolean;
  hasChildren: boolean;
  parentId: string;
}

export class Media implements Entity {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public userId: string,
    public type: MediaType,
    public mimetype: string,
    public size: number,
    public name: string,
    public path: string,
    public isInRoot: boolean,
    public hasChildren: boolean,
    public parentId: string,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      userId: String,
      type: String,
      mimetype: String,
      size: Number,
      name: String,
      path: String,
      isInRoot: Boolean,
      hasChildren: Boolean,
      parentId: String,
    });
  }
}

export const MediaSchema: ObjectSchema = {
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
  type: {
    __type: 'string',
    __required: true,
  },
  mimetype: {
    __type: 'string',
    __required: true,
  },
  size: {
    __type: 'number',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  path: {
    __type: 'string',
    __required: true,
  },
  isInRoot: {
    __type: 'boolean',
    __required: true,
  },
  hasChildren: {
    __type: 'boolean',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: true,
  },
};
