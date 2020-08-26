import { FSDBEntity } from '@becomes/purple-cheetah';
import { Prop } from '../../prop';

export class FSGroup implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public label: string,
    public desc: string,
    public props: Prop[],
  ) {}
}
