import type { BCMSChange } from './models';

export interface BCMSChangeFactory {
  create(data: {
    entry?: number;
    group?: number;
    color?: number;
    language?: number;
    media?: number;
    status?: number;
    tag?: number;
    templates?: number;
    widget?: number;
  }): BCMSChange;
}
