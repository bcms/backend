import * as sharp from 'sharp';
import * as path from 'path';
import { move as fseMove, readFile as fseRead } from 'fs-extra';
import type { FS, Module } from '@becomes/purple-cheetah/types';
import {
  BCMSMedia,
  BCMSMediaAggregate,
  BCMSMediaService as BCMSMediaServiceType,
  BCMSMediaType,
} from '../types';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from '@bcms/repo';
import { BCMSFfmpeg } from '@bcms/util';
let fs: FS;

export const BCMSMimeTypes: {
  css: string[];
  js: string[];
} = {
  css: ['application/x-pointplus', 'text/css'],
  js: [
    'application/x-javascript',
    'application/javascript',
    'application/ecmascript',
    'text/javascript',
    'text/ecmascript',
  ],
};

export const BCMSMediaService: BCMSMediaServiceType = {
  async aggregateFromParent({ parent, basePath }) {
    if (!basePath) {
      basePath = await BCMSMediaService.getPath(parent);
    }
    const parentAggregate: BCMSMediaAggregate = {
      _id: typeof parent._id === 'string' ? parent._id : parent._id,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      isInRoot: parent.isInRoot,
      mimetype: parent.mimetype,
      name: parent.name,
      path: basePath,
      size: parent.size,
      state: false,
      type: parent.type,
      userId: parent.userId,
    };

    if (parent.hasChildren) {
      const childMedia = await BCMSRepo.media.methods.findAllByParentId(
        parent._id,
      );
      parentAggregate.children = [];
      for (let i = 0; i < childMedia.length; i++) {
        const child = childMedia[i];
        if (child.hasChildren) {
          parentAggregate.children.push(
            await BCMSMediaService.aggregateFromParent({
              parent: child,
              basePath: `${basePath}/${child.name}`,
            }),
          );
        } else {
          parentAggregate.children.push({
            _id: child._id,
            createdAt: child.createdAt,
            updatedAt: child.updatedAt,
            isInRoot: child.isInRoot,
            mimetype: child.mimetype,
            name: child.name,
            path: `${basePath}/${child.name}`,
            size: child.size,
            state: false,
            type: child.type,
            userId: child.userId,
          });
        }
      }
    }

    return parentAggregate;
  },
  async aggregateFromRoot() {
    const aggregated: BCMSMediaAggregate[] = [];
    const rootMedia = await BCMSRepo.media.methods.findAllByIsInRoot(true);
    for (let i = 0; i < rootMedia.length; i++) {
      aggregated.push(
        await BCMSMediaService.aggregateFromParent({ parent: rootMedia[i] }),
      );
    }
    return aggregated;
  },
  mimetypeToMediaType(mimetype) {
    switch (mimetype) {
      case 'image/gif': {
        return BCMSMediaType.GIF;
      }
      case 'application/pdf': {
        return BCMSMediaType.PDF;
      }
      case 'text/html': {
        return BCMSMediaType.HTML;
      }
      case 'text/x-java-source': {
        return BCMSMediaType.JAVA;
      }
    }
    if (BCMSMimeTypes.js.includes(mimetype)) {
      return BCMSMediaType.JS;
    }
    if (BCMSMimeTypes.css.includes(mimetype)) {
      return BCMSMediaType.CSS;
    }
    switch (mimetype.split('/')[0]) {
      case 'image': {
        return BCMSMediaType.IMG;
      }
      case 'video': {
        return BCMSMediaType.VID;
      }
      case 'text': {
        return BCMSMediaType.TXT;
      }
      default: {
        return BCMSMediaType.OTH;
      }
    }
  },
  async getChildren(media) {
    const children = await BCMSRepo.media.methods.findAllByParentId(media._id);
    const childrenOfChildren: BCMSMedia[] = [];
    for (const i in children) {
      const child = children[i];
      if (child.type === BCMSMediaType.DIR) {
        (await BCMSMediaService.getChildren(child)).forEach((e) => {
          childrenOfChildren.push(e);
        });
      }
    }
    return [...children, ...childrenOfChildren];
  },
  async getPath(media) {
    if (media.type !== BCMSMediaType.DIR && media.isInRoot && !media.parentId) {
      return `/${media.name}`;
    } else {
      const parent = await BCMSRepo.media.findById(media.parentId);
      if (!parent) {
        return `/${media.name}`;
      }
      return `${await BCMSMediaService.getPath(parent)}/${media.name}`;
    }
  },
  getNameAndExt(fullName) {
    const nameParts = fullName.split('.');
    return {
      name:
        nameParts.length > 1
          ? nameParts.slice(0, nameParts.length - 1).join('.')
          : nameParts[0],
      ext: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  },
  storage: {
    async getPath({ media, size, thumbnail }) {
      if (media.type === BCMSMediaType.DIR) {
        return path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        );
      }
      if (size === 'small' && media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          if (size === 'small') {
            const mediaPathParts = (
              await BCMSMediaService.getPath(media)
            ).split('/');
            const location = path.join(
              process.cwd(),
              'uploads',
              mediaPathParts.slice(0, mediaPathParts.length - 1).join('/'),
              `300-${media.name}`,
            );
            if (await fs.exist(location, true)) {
              return location;
            }
          }
        }
      } else if (
        thumbnail &&
        (media.type === BCMSMediaType.VID || media.type === BCMSMediaType.GIF)
      ) {
        const pathParts = path
          .join(process.cwd(), 'uploads', await BCMSMediaService.getPath(media))
          .split('/');
        const dirPath = pathParts.slice(0, pathParts.length - 1).join('/');
        const nameParts = media.name.split('.');
        const name =
          'thumbnail-' +
          nameParts.slice(0, nameParts.length - 1).join('.') +
          '.png';
        return `${dirPath}/${name}`;
      }
      return path.join(
        process.cwd(),
        'uploads',
        await BCMSMediaService.getPath(media),
      );
    },
    async exist(media) {
      return await fs.exist(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
        media.type !== BCMSMediaType.DIR,
      );
    },
    async get({ media, size }) {
      if (size && media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          if (size === 'small') {
            const mediaPath = await BCMSMediaService.getPath(media);
            const location = path.join(
              process.cwd(),
              'uploads',
              mediaPath
                .split('/')
                .slice(0, mediaPath.length - 1)
                .join('/'),
              `300-${media.name}`,
            );
            if (await fs.exist(location, true)) {
              return await fs.read(location);
            }
          }
        }
      }
      return await fs.read(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
      );
    },
    async mkdir(media) {
      if (media.type === BCMSMediaType.DIR) {
        const mediaPath = await BCMSMediaService.getPath(media);
        await fs.save(
          path.join(process.cwd(), 'uploads', mediaPath, 'tmp.txt'),
          '',
        );
        await fs.deleteFile(
          path.join(process.cwd(), 'uploads', mediaPath, 'tmp.txt'),
        );
      }
    },

    async duplicate(oldMedia, newMedia) {
      const oldMediaPath = await BCMSMediaService.getPath(oldMedia);
      const oldMediaBuffer = await fseRead(
        path.join(process.cwd(), 'uploads', oldMediaPath),
      );
      BCMSMediaService.storage.save(newMedia, oldMediaBuffer);
    },

    async save(media, binary, logger) {
      const pathToMedia = await BCMSMediaService.getPath(media);
      await fs.save(path.join(process.cwd(), 'uploads', pathToMedia), binary);
      if (media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        const mediaPathParts = pathToMedia.split('/');
        const pathOnly = mediaPathParts
          .slice(0, mediaPathParts.length - 1)
          .join('/');
        if (nameParts.ext === 'png') {
          const output = await sharp(binary)
            .resize({
              width: 300,
              withoutEnlargement: true,
            })
            .png({
              quality: 50,
            })
            .toBuffer();
          await fs.save(
            path.join(process.cwd(), 'uploads', pathOnly, `300-${media.name}`),
            output,
          );
        } else if (nameParts.ext === 'jpg' || nameParts.ext === 'jpeg') {
          const output = await sharp(binary)
            .resize({
              width: 300,
              withoutEnlargement: true,
            })
            .jpeg({
              quality: 50,
            })
            .toBuffer();
          await fs.save(
            path.join(process.cwd(), 'uploads', pathOnly, `300-${media.name}`),
            output,
          );
        }
      } else if (media.type === BCMSMediaType.VID) {
        try {
          await BCMSFfmpeg.createVideoThumbnail({ media });
        } catch (error) {
          if (logger) {
            logger.error('save', error);
          } else {
            // eslint-disable-next-line no-console
            console.error('save', error);
          }
        }
      } else if (media.type === BCMSMediaType.GIF) {
        try {
          await BCMSFfmpeg.createGifThumbnail({ media });
        } catch (error) {
          if (logger) {
            logger.error('save', error);
          } else {
            // eslint-disable-next-line no-console
            console.error('save', error);
          }
        }
      }
    },
    async rename(oldMedia, newMedia) {
      if (oldMedia.name !== newMedia.name) {
        const pathToOldMedia = await BCMSMediaService.getPath(oldMedia);
        const pathToNewMedia = await BCMSMediaService.getPath(newMedia);
        await fs.rename(
          path.join(process.cwd(), 'uploads', pathToOldMedia),
          path.join(process.cwd(), 'uploads', pathToNewMedia),
        );
        const pathParts = pathToNewMedia.split('/');
        const basePath = pathParts.slice(0, pathParts.length - 1).join('/');
        if (newMedia.type === BCMSMediaType.IMG) {
          await fs.rename(
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `300-${oldMedia.name}`,
            ),
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `300-${newMedia.name}`,
            ),
          );
        } else if (
          newMedia.type === BCMSMediaType.VID ||
          newMedia.type === BCMSMediaType.GIF
        ) {
          const oldNameParts = oldMedia.name.split('.');
          const oldName =
            oldNameParts.slice(0, oldNameParts.length - 1).join('.') + '.png';
          const newNameParts = newMedia.name.split('.');
          const newName =
            newNameParts.slice(0, newNameParts.length - 1).join('.') + '.png';
          await fs.rename(
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `thumbnail-${oldName}`,
            ),
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `thumbnail-${newName}`,
            ),
          );
        }
      }
    },
    async removeFile(media) {
      const mediaPath = await BCMSMediaService.getPath(media);
      await fs.deleteFile(path.join(process.cwd(), 'uploads', mediaPath));
      if (media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          await fs.deleteFile(
            path.join(
              process.cwd(),
              'uploads',
              mediaPath
                .split('/')
                .slice(0, mediaPath.length - 1)
                .join('/'),
              `300-${media.name}`,
            ),
          );
        }
      } else if (
        media.type === BCMSMediaType.VID ||
        media.type === BCMSMediaType.GIF
      ) {
        const pathParts = mediaPath.split('/');
        const dirPath =
          process.cwd() +
          '/uploads' +
          pathParts.slice(0, pathParts.length - 1).join('/');
        const nameParts = media.name.split('.');
        const name =
          nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
        await fs.deleteFile(`${dirPath}/thumbnail-${name}`);
      }
    },
    async removeDir(media) {
      await fs.deleteDir(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
      );
    },
    async move(oldMedia, newMedia) {
      const pathToOldMedia = await BCMSMediaService.getPath(oldMedia);
      const pathToOldMediaParts = pathToOldMedia.split('/');
      const fullNameMedia = pathToOldMediaParts
        .slice(pathToOldMediaParts.length - 1, pathToOldMediaParts.length)
        .join('');
      const namePartsMedia = await BCMSMediaService.getNameAndExt(
        fullNameMedia,
      );
      let pathToNewMedia: string;
      let mediaNameWithNewPath: string;
      let pathForThumbnailVideo: string;
      let pathForThumbnailImage: string;
      if (newMedia) {
        pathToNewMedia = await BCMSMediaService.getPath(newMedia);
        mediaNameWithNewPath = `${pathToNewMedia}/${oldMedia.name}`;
        pathForThumbnailVideo = `${pathToNewMedia}/thumbnail-${namePartsMedia.name}.png`;
        pathForThumbnailImage = `${pathToNewMedia}/300-${oldMedia.name}`;
      } else {
        mediaNameWithNewPath = `${oldMedia.name}`;
        mediaNameWithNewPath = `${oldMedia.name}`;
        pathForThumbnailVideo = `thumbnail-${namePartsMedia.name}.png`;
        pathForThumbnailImage = `300-${oldMedia.name}`;
      }
      await fseMove(
        path.join(process.cwd(), 'uploads', pathToOldMedia),
        path.join(process.cwd(), 'uploads', mediaNameWithNewPath),
      );
      if (oldMedia.type !== BCMSMediaType.DIR) {
        const basePathToOldMedia = pathToOldMediaParts
          .slice(0, pathToOldMediaParts.length - 1)
          .join('/');
        if (oldMedia.type === BCMSMediaType.IMG) {
          await fseMove(
            path.join(
              process.cwd(),
              'uploads',
              basePathToOldMedia,
              `300-${oldMedia.name}`,
            ),
            path.join(process.cwd(), 'uploads', pathForThumbnailImage),
          );
        } else if (
          oldMedia.type === BCMSMediaType.VID ||
          oldMedia.type === BCMSMediaType.GIF
        ) {
          const mediaInfo = BCMSMediaService.getNameAndExt(oldMedia.name);
          const name = mediaInfo.name + '.png';
          await fseMove(
            path.join(
              process.cwd(),
              'uploads',
              basePathToOldMedia,
              `thumbnail-${name}`,
            ),
            path.join(process.cwd(), 'uploads', pathForThumbnailVideo),
          );
        }
      }
    },
  },
};

export function createBcmsMediaService(): Module {
  return {
    name: 'Media service',
    initialize(moduleConfig) {
      fs = useFS();
      moduleConfig.next();
    },
  };
}
