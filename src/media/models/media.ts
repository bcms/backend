import { IEntity, Entity } from '@becomes/purple-cheetah';
import { Types, Schema } from 'mongoose';

export enum MediaType {
  DIR = 'DIR',
  IMG = 'IMG',
  VID = 'VID',
  TXT = 'TXT',
  GIF = 'GIF',
  OTH = 'OTH',
  PDF = 'PDF',
  CODE = 'CODE',
  JS = 'JS',
  HTML = 'HTML',
  CSS = 'CSS',
  JAVA = 'JAVA',
  PHP = 'PHP',
  FONT = 'FONT',
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
    });
  }
}
