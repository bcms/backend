import type { BCMSMediaType } from './main';

export interface BCMSMediaAggregate {
  _id: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  type: BCMSMediaType;
  mimetype: string;
  size: number;
  name: string;
  path: string;
  isInRoot: boolean;
  children?: BCMSMediaAggregate[];
  state: boolean;
}

export interface BCMSMediaSimpleAggregate {
  _id: string;
  createdAt: number;
  updatedAt: number;
  isInRoot: boolean;
  mimetype: string;
  name: string;
  size: number;
  state: false;
  type: string;
  userId: string;
}
