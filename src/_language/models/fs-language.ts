import { FSDBEntity } from '@becomes/purple-cheetah';

export class FSLanguage implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public userId: string,
    public code: string,
    public name: string,
    public nativeName: string,
    public def: boolean,
  ) {}
}
