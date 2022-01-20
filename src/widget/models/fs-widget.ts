import { FSDBEntity } from '@becomes/purple-cheetah';
import { Prop } from '../../prop';

export class FSWidget implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public label: string,
    public desc: string,
    public previewImage: string,
    public previewScript: string,
    public previewStyle: string,
    public props: Prop[],
  ) {}
}