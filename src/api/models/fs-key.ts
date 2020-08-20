import { FSDBEntity } from '@becomes/purple-cheetah';
import { ApiKeyAccess } from './key';

export class FSApiKey implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public userId: string,
    public name: string,
    public desc: string,
    public blocked: boolean,
    public secret: string,
    public access: ApiKeyAccess,
  ) {}
}
