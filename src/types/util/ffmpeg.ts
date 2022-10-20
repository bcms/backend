import type { BCMSMedia } from '../media';

export interface BCMSFfmpeg {
  createVideoThumbnail(data: { media: BCMSMedia }): Promise<void>;
  createGifThumbnail(data: { media: BCMSMedia }): Promise<void>;
  createImageThumbnail(data: { media: BCMSMedia }): Promise<void>;
  getVideoInfo(data: {
    media: BCMSMedia;
  }): Promise<{ width: number; height: number }>;
}
