import { FSDBEntity } from '@becomes/purple-cheetah';

export class FSStatus implements FSDBEntity {
  constructor(
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public label: string,
    public name: string,
    public color: string,
  ) {}
}
