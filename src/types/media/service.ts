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
  storage: {
    getPath(data: {
      media: BCMSMedia;
      size?: 'small';
      thumbnail?: boolean;
    }): Promise<string>;
    exist(media: BCMSMedia): Promise<boolean>;
    get(data: { media: BCMSMedia; size?: 'small' }): Promise<Buffer>;
    mkdir(media: BCMSMedia): Promise<void>;
    save(media: BCMSMedia, binary: Buffer): Promise<void>;
    rename(oldMedia: BCMSMedia, newMedia: BCMSMedia): Promise<void>;
    removeFile(media: BCMSMedia): Promise<void>;
    removeDir(media: BCMSMedia): Promise<void>;
    move(from: string, to: string): Promise<void>;
  };
}
