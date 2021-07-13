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
} from '../types';
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
        async aggregateFromParent({ parent, basePath }) {
          if (!basePath) {
            basePath = await mediaService.getPath(parent);
          }
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
            path: basePath,
            size: parent.size,
            state: false,
            type: parent.type,
            userId: parent.userId,
          };

          if (parent.hasChildren) {
            const childMedia = await mediaRepo.methods.findAllByParentId(
              `${parent._id}`,
            );
            parentAggregate.children = [];
            for (let i = 0; i < childMedia.length; i++) {
              const child = childMedia[i];
              if (child.hasChildren) {
                parentAggregate.children.push(
                  await mediaService.aggregateFromParent({
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
          const rootMedia = await mediaRepo.methods.findAllByIsInRoot(true);
          for (let i = 0; i < rootMedia.length; i++) {
            aggregated.push(
              await mediaService.aggregateFromParent({ parent: rootMedia[i] }),
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
        async getPath(media) {
          if (
            media.type !== BCMSMediaType.DIR ||
            media.isInRoot ||
            !media.parentId
          ) {
            return `/${media.name}`;
          } else {
            const parent = await mediaRepo.findById(media.parentId);
            if (!parent) {
              return `/${media.name}`;
            }
            return `${mediaService.getPath(parent)}/${media.name}`;
          }
        },
        storage: {
          async getPath({ media, size }) {
            if (media.type === BCMSMediaType.DIR) {
              return path.join(
                process.cwd(),
                'uploads',
                await mediaService.getPath(media),
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
                  const mediaPathParts = (await mediaService.getPath(media)).split('/');
                  const location = path.join(
                    process.cwd(),
                    'uploads',
                    mediaPathParts
                      .slice(0, mediaPathParts.length - 1)
                      .join('/'),
                    `300-${media.name}`,
                  );
                  if (await fs.exist(location, true)) {
                    return location;
                  }
                }
              }
            }
            return path.join(
              process.cwd(),
              'uploads',
              await mediaService.getPath(media),
            );
          },
          async exist(media) {
            return await fs.exist(
              path.join(
                process.cwd(),
                'uploads',
                await mediaService.getPath(media),
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
                  const mediaPath = await mediaService.getPath(media);
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
                await mediaService.getPath(media),
              ),
            );
          },
          async mkdir(media) {
            if (media.type === BCMSMediaType.DIR) {
              await fs.save(
                '',
                path.join(
                  process.cwd(),
                  'uploads',
                  await mediaService.getPath(media),
                  'tmp.txt',
                ),
              );
              await fs.deleteFile(
                path.join(
                  process.cwd(),
                  'uploads',
                  await mediaService.getPath(media),
                  'tmp.txt',
                ),
              );
            }
          },
          async save(media, binary) {
            await fs.save(
              path.join(
                process.cwd(),
                'uploads',
                await mediaService.getPath(media),
              ),
              binary,
            );
            if (media.type === BCMSMediaType.IMG) {
              const nameParts = {
                name: media.name.split('.')[0],
                ext: media.name.split('.')[1].toLowerCase(),
              };
              const mediaPathParts = (await mediaService.getPath(media)).split('/');
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
                  path.join(
                    process.cwd(),
                    'uploads',
                    pathOnly,
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
                    pathOnly,
                    `300-${media.name}`,
                  ),
                  output,
                );
              }
            }
          },
          async removeFile(media) {
            const mediaPath = await mediaService.getPath(media);
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
            }
          },
          async removeDir(media) {
            await fs.deleteDir(
              path.join(
                process.cwd(),
                'uploads',
                await mediaService.getPath(media),
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
      moduleConfig.next();
    },
  };
}
