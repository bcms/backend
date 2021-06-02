import type { JWTRole, JWTRoleName } from '@becomes/purple-cheetah/types';

export interface BCMSShimInstanceUserOrg {
  id: string;
  role: JWTRoleName;
  owner: boolean;
}

export interface BCMSShimInstanceUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  organizations: BCMSShimInstanceUserOrg[];
  roles: JWTRole[];
}
