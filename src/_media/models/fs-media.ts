import { FSDBEntity } from '@becomes/purple-cheetah';
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
    public parentId: string,
  ) {}
}
