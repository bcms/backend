import * as systemPath from 'path';
import type { FS, Module } from '@becomes/purple-cheetah/types';
import { BCMSFfmpeg as BCMSFfmpegType, BCMSMediaType } from '../types';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSMediaService } from '@bcms/media';
import { ChildProcess } from '@banez/child_process';

let fs: FS;

export const BCMSFfmpeg: BCMSFfmpegType = {
  async createVideoThumbnail({ media }) {
    if (media.type !== BCMSMediaType.VID) {
      return;
    }
    const nameParts = media.name.split('.');
    const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
    const pathParts = (await BCMSMediaService.getPath(media)).split('/');
    const path =
      process.cwd() +
      '/uploads' +
      pathParts.slice(0, pathParts.length - 1).join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/${media.name}`,
      '-ss',
      '00:00:01.000',
      '-vframes',
      '1',
      `${path}/tmp-${name}`,
    ]);
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/tmp-${name}`,
      '-vf',
      'scale=300:-1',
      `${path}/thumbnail-${name}`,
    ]);
    // await sharp(`${path}/tmp-${name}`)
    //   .resize({
    //     width: 300,
    //     withoutEnlargement: true,
    //   })
    //   .png({
    //     quality: 50,
    //   })
    //   .toFile(`${path}/thumbnail-${name}`);
    await fs.deleteFile(`${path}/tmp-${name}`);
  },
  async createGifThumbnail({ media }) {
    if (media.type !== BCMSMediaType.GIF) {
      return;
    }
    const nameParts = media.name.split('.');
    const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
    const pathParts = (await BCMSMediaService.getPath(media)).split('/');
    const path =
      process.cwd() +
      '/uploads' +
      pathParts.slice(0, pathParts.length - 1).join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/${media.name}`,
      '-ss',
      '00:00:01.000',
      '-vframes',
      '1',
      `${path}/tmp-${name}`,
    ]);
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/tmp-${name}`,
      '-vf',
      'scale=300:-1',
      `${path}/thumbnail-${name}`,
    ]);
    // await sharp(`${path}/tmp-${name}`)
    //   .resize({
    //     width: 300,
    //     withoutEnlargement: true,
    //   })
    //   .png({
    //     quality: 50,
    //   })
    //   .toFile(`${path}/thumbnail-${name}`);
    await fs.deleteFile(`${path}/tmp-${name}`);
  },
  async createImageThumbnail({ media }) {
    const pathToMedia = await BCMSMediaService.getPath(media);
    const inputPath = systemPath.join(process.cwd(), 'uploads', pathToMedia);
    const mediaPathParts = pathToMedia.split('/');
    const pathOnly = mediaPathParts
      .slice(0, mediaPathParts.length - 1)
      .join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vf',
      'scale=300:-1',
      systemPath.join(process.cwd(), 'uploads', pathOnly, `300-${media.name}`),
    ]);
  },
};

export function createBcmsFfmpeg(): Module {
  return {
    name: 'FFMPEG',
    initialize(moduleConfig) {
      fs = useFS();
      moduleConfig.next();
    },
  };
}
