import type { ProtectedUser, User } from './models';

export interface UserFactory {
  create(config: {
    admin?: boolean;
    options?: {
      email: string;
      firstName: string;
      lastName: string;
      avatarUri?: string;
    };
  }): User;
  toProtected(user: User): ProtectedUser;
}
