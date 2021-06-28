import { IEntity } from "@becomes/purple-cheetah";

export interface IHistory extends IEntity {
  user: {
    id: string;
    username: string;
  }
}