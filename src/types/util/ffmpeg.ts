import type { BCMSMedia } from '../media';

export interface BCMSFfmpeg {
  createVideoThumbnail(data: { media: BCMSMedia }): Promise<void>;
  createGifThumbnail(data: { media: BCMSMedia }): Promise<void>;
}
