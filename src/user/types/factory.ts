import type { BCMSProtectedUser, BCMSUser } from './models';

export interface BCMSUserFactory {
  create(config: {
    admin?: boolean;
    options?: {
      email: string;
      firstName: string;
      lastName: string;
      avatarUri?: string;
    };
  }): BCMSUser;
  toProtected(user: BCMSUser): BCMSProtectedUser;
}
