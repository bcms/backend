import { FSDBEntity, ObjectSchema, Role } from '@becomes/purple-cheetah';
import { RefreshToken, UserCustomPool } from '../interfaces';

export class FSUser implements FSDBEntity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public username: string,
    public email: string,
    public password: string,
    public roles: Role[],
    public refreshTokens: RefreshToken[],
    public customPool: UserCustomPool,
  ) {}
}
