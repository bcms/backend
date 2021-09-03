import * as sharp from 'sharp';
import * as path from 'path';
import { move as fseMove } from 'fs-extra';
import type { FS, Module } from '@becomes/purple-cheetah/types';
import {
  BCMSMedia,
  BCMSMediaAggregate,
  BCMSMediaService as BCMSMediaServiceType,
  BCMSMediaType,
} from '../types';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from '@bcms/repo';

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
      _id:
        typeof parent._id === 'string' ? parent._id : parent._id.toHexString(),
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
        `${parent._id}`,
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
            _id:
              typeof child._id === 'string'
                ? child._id
                : child._id.toHexString(),
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
    const children = await BCMSRepo.media.methods.findAllByParentId(`${media._id}`);
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
            const mediaPathParts = (await BCMSMediaService.getPath(media)).split(
              '/',
            );
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
        path.join(process.cwd(), 'uploads', await BCMSMediaService.getPath(media)),
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
        path.join(process.cwd(), 'uploads', await BCMSMediaService.getPath(media)),
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
    async save(media, binary) {
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
      } else if (media.type === BCMSMediaType.VID) {
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
    async move(from, to) {
      await fseMove(
        path.join(process.cwd(), 'uploads', from),
        path.join(process.cwd(), 'uploads', to),
      );
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
