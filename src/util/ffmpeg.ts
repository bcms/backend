import * as sharp from 'sharp';
import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsMediaService } from '../media';
import { BCMSFfmpeg, BCMSMediaType } from '../types';
import { useBcmsChildProcess } from './child-process';
import { useFS } from '@becomes/purple-cheetah';

let ffmpeg: BCMSFfmpeg;

export function useBcmsFfmpeg(): BCMSFfmpeg {
  return ffmpeg;
}

async function exec() {
  const mediaService = useBcmsMediaService();
  const childProcess = useBcmsChildProcess();
  const fs = useFS();
  ffmpeg = {
    async createVideoThumbnail({ media }) {
      if (media.type !== BCMSMediaType.VID) {
        return;
      }
      const nameParts = media.name.split('.');
      const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
      const pathParts = (await mediaService.getPath(media)).split('/');
      const path =
        process.cwd() +
        '/uploads' +
        pathParts.slice(0, pathParts.length - 1).join('/');
      await childProcess.spawn('ffmpeg', [
        '-i',
        `${path}/${media.name}`,
        '-ss',
        '00:00:01.000',
        '-vframes',
        '1',
        `${path}/tmp-${name}`,
      ]);
      await sharp(`${path}/tmp-${name}`)
        .resize({
          width: 300,
          withoutEnlargement: true,
        })
        .png({
          quality: 50,
        })
        .toFile(`${path}/thumbnail-${name}`);
      await fs.deleteFile(`${path}/tmp-${name}`);
    },
    async createGifThumbnail({ media }) {
      if (media.type !== BCMSMediaType.GIF) {
        return;
      }
      const nameParts = media.name.split('.');
      const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
      const pathParts = (await mediaService.getPath(media)).split('/');
      const path =
        process.cwd() +
        '/uploads' +
        pathParts.slice(0, pathParts.length - 1).join('/');
      await childProcess.spawn('ffmpeg', [
        '-i',
        `${path}/${media.name}`,
        '-ss',
        '00:00:01.000',
        '-vframes',
        '1',
        `${path}/tmp-${name}`,
      ]);
      await sharp(`${path}/tmp-${name}`)
        .resize({
          width: 300,
          withoutEnlargement: true,
        })
        .png({
          quality: 50,
        })
        .toFile(`${path}/thumbnail-${name}`);
      await fs.deleteFile(`${path}/tmp-${name}`);
    },
  };
}

export function createBcmsFfmpeg(): Module {
  return {
    name: 'FFMPEG',
    initialize(moduleConfig) {
      exec()
        .then(() => {
          moduleConfig.next();
        })
        .catch((err) => {
          moduleConfig.next(err);
        });
    },
  };
}
