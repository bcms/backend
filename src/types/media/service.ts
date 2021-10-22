import type { Logger } from '@becomes/purple-cheetah/types';
import type { BCMSMedia, BCMSMediaAggregate, BCMSMediaType } from './models';

export interface BCMSMediaService {
  aggregateFromParent(data: {
    parent: BCMSMedia;
    basePath?: string;
  }): Promise<BCMSMediaAggregate>;
  aggregateFromRoot(): Promise<BCMSMediaAggregate[]>;
  getChildren(parent: BCMSMedia): Promise<BCMSMedia[]>;
  mimetypeToMediaType(mimetype: string): BCMSMediaType;
  getPath(media: BCMSMedia): Promise<string>;
  getNameAndExt(fullName: string): { name: string; ext: string };
  storage: {
    getPath(data: {
      media: BCMSMedia;
      size?: 'small';
      thumbnail?: boolean;
    }): Promise<string>;
    exist(media: BCMSMedia): Promise<boolean>;
    get(data: { media: BCMSMedia; size?: 'small' }): Promise<Buffer>;
    mkdir(media: BCMSMedia): Promise<void>;
    save(media: BCMSMedia, binary: Buffer, logger?: Logger): Promise<void>;
    rename(oldMedia: BCMSMedia, newMedia: BCMSMedia): Promise<void>;
    removeFile(media: BCMSMedia): Promise<void>;
    removeDir(media: BCMSMedia): Promise<void>;
    move(oldMedia: BCMSMedia, newMedia?: BCMSMedia | null): Promise<void>;
    duplicate(oldMedia: BCMSMedia, newMedia: BCMSMedia): Promise<void>;
  };
}
