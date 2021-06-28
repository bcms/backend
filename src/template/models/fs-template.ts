import { FSDBEntity } from '@becomes/purple-cheetah';
import { Prop } from '../../_prop';

export class FSTemplate implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public label: string,
    public desc: string,
    public userId: string,
    public singleEntry: boolean,
    public props: Prop[],
  ) {}
}
