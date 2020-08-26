import { FSDBEntity } from '@becomes/purple-cheetah';
import { EntryMeta } from './entry';

export class FSEntry implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public title: string,
    public slug: string,
    public templateId: string,
    public userId: string,
    public meta: EntryMeta[],
    public content: any[],
  ) {}
}
