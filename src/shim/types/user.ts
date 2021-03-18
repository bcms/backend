import { RoleName } from '@becomes/purple-cheetah';

export interface InstanceUserOrg {
  id: string;
  role: RoleName;
  owner: boolean;
}

export interface InstanceUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  organization: InstanceUserOrg[];
}
