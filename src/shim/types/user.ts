import { Role, RoleName } from '@becomes/purple-cheetah';

export interface ShimInstanceUserOrg {
  id: string;
  role: RoleName;
  owner: boolean;
}

export interface ShimInstanceUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  organizations: ShimInstanceUserOrg[];
  roles: Role[];
}
