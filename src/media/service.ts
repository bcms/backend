import * as sharp from 'sharp';
import * as path from 'path';
import { move as fseMove } from 'fs-extra';
import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsMediaRepository } from './repository';
import {
  BCMSMedia,
  BCMSMediaAggregate,
  BCMSMediaService,
  BCMSMediaType,
} from './types';
import { useFS } from '@becomes/purple-cheetah';

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
let mediaService: BCMSMediaService;

export function useBcmsMediaService(): BCMSMediaService {
  return mediaService;
}

export function createBcmsMediaService(): Module {
  return {
    name: 'Media service',
    initialize(moduleConfig) {
      const mediaRepo = useBcmsMediaRepository();
      const fs = useFS();

      mediaService = {
        async aggregateFromParent(parent) {
          const parentAggregate: BCMSMediaAggregate = {
            _id:
              typeof parent._id === 'string'
                ? parent._id
                : parent._id.toHexString(),
            createdAt: parent.createdAt,
            updatedAt: parent.updatedAt,
            isInRoot: parent.isInRoot,
            mimetype: parent.mimetype,
            name: parent.name,
            path: parent.path,
            size: parent.size,
            state: false,
            type: parent.type,
            userId: parent.userId,
          };

          if (parent.hasChildren) {
            const allMedia = await mediaRepo.findAll();
            parentAggregate.children = [];
            const childrenIndexes: number[] = [];
            for (let i = 0; i < allMedia.length; i++) {
              if (
                allMedia[i].parentId ===
                (typeof parent._id === 'string'
                  ? parent._id
                  : parent._id.toHexString())
              ) {
                childrenIndexes.push(i);
              }
            }
            for (let i = 0; i < childrenIndexes.length; i++) {
              const child = allMedia[childrenIndexes[i]];
              if (child.hasChildren) {
                parentAggregate.children.push(
                  await mediaService.aggregateFromParent(child),
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
                  path: child.path,
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
          const allMedia = await mediaRepo.findAll();
          for (let i = 0; i < allMedia.length; i++) {
            if (allMedia[i].isInRoot) {
              aggregated.push(
                await mediaService.aggregateFromParent(allMedia[i]),
              );
            }
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
          const children = await mediaRepo.methods.findAllByParentId(
            `${media._id}`,
          );
          const childrenOfChildren: BCMSMedia[] = [];
          for (const i in children) {
            const child = children[i];
            if (child.type === BCMSMediaType.DIR) {
              (await mediaService.getChildren(child)).forEach((e) => {
                childrenOfChildren.push(e);
              });
            }
          }
          return [...children, ...childrenOfChildren];
        },
        storage: {
          async getPath({ media, size }) {
            if (media === BCMSMediaType.DIR) {
              return path.join(process.cwd(), 'uploads', media.path);
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
                  const location = path.join(
                    process.cwd(),
                    'uploads',
                    media.path,
                    `300-${media.name}`,
                  );
                  if (await fs.exist(location, true)) {
                    return location;
                  }
                }
              }
            }
            return path.join(process.cwd(), 'uploads', media.path, media.name);
          },
          async exist(media) {
            if (media.type === BCMSMediaType.DIR) {
              return await fs.exist(
                path.join(process.cwd(), 'uploads', media.path),
              );
            }
            return await fs.exist(
              path.join(process.cwd(), 'uploads', media.path, media.name),
              true,
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
                  const location = path.join(
                    process.cwd(),
                    'uploads',
                    media.path,
                    `300-${media.name}`,
                  );
                  if (await fs.exist(location, true)) {
                    return await fs.read(location);
                  }
                }
              }
            }
            return await fs.read(
              path.join(process.cwd(), 'uploads', media.path, media.name),
            );
          },
          async mkdir(media) {
            if (media.type === BCMSMediaType.DIR) {
              await fs.save(
                '',
                path.join(process.cwd(), 'uploads', media.path, 'tmp.txt'),
              );
              await fs.deleteFile(
                path.join(process.cwd(), 'uploads', media.path, 'tmp.txt'),
              );
            }
          },
          async save(media, binary) {
            await fs.save(
              path.join(process.cwd(), 'uploads', media.path, media.name),
              binary,
            );
            if (media.type === BCMSMediaType.IMG) {
              const nameParts = {
                name: media.name.split('.')[0],
                ext: media.name.split('.')[1].toLowerCase(),
              };
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
                  path.join(
                    process.cwd(),
                    'uploads',
                    media.path,
                    `300-${media.name}`,
                  ),
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
                  path.join(
                    process.cwd(),
                    'uploads',
                    media.path,
                    `300-${media.name}`,
                  ),
                  output,
                );
              }
            }
          },
          async removeFile(media) {
            await fs.deleteFile(
              path.join(process.cwd(), 'uploads', media.path, media.name),
            );
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
                    media.path,
                    `300-${media.name}`,
                  ),
                );
              }
            }
          },
          async removeDir(media) {
            await fs.deleteDir(path.join(process.cwd(), 'uploads', media.path));
          },
          async move(from, to) {
            await fseMove(
              path.join(process.cwd(), 'uploads', from),
              path.join(process.cwd(), 'uploads', to),
            );
          },
        },
      };
      moduleConfig.next();
    },
  };
}
