import { FSDBEntity } from '@becomes/purple-cheetah';
import { EntryContent, EntryMeta } from './entry';

export class FSEntry implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public templateId: string,
    public userId: string,
    public meta: EntryMeta[],
    public content: EntryContent[],
    public status?: string,
  ) {}
}
