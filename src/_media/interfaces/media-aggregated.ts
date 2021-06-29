import { MediaType } from '../models';

export interface MediaAggregate {
  _id: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  type: MediaType;
  mimetype: string;
  size: number;
  name: string;
  path: string;
  isInRoot: boolean;
  children?: MediaAggregate[];
  state: boolean;
}
