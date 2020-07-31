import { FSDBEntity, ObjectSchema } from '@becomes/purple-cheetah';
import { MediaType } from './media';

export class FSMedia implements FSDBEntity {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: string,
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
};
