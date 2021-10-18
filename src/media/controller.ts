import * as crypto from 'crypto';
import sizeOf from 'image-size';
import * as util from 'util';
import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  createJwtProtectionPreRequestHandler,
  useJwt,
} from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import {
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAddDirDataSchema,
  BCMSMediaType,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '../types';
import { createJwtAndBodyCheckRouteProtection, BCMSFfmpeg } from '../util';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSMediaService } from './service';
import { BCMSFactory } from '@bcms/factory';

interface Setup {
  jwt: JWTManager;
  stringUtil: StringUtility;
}

export const BCMSMediaController = createController<Setup>({
  name: 'Media controller',
  path: '/api/media',
  setup() {
    return {
      jwt: useJwt(),
      stringUtil: useStringUtility(),
    };
  },
  methods({ jwt, stringUtil }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler() {
          return {
            items: await BCMSRepo.media.findAll(),
          };
        },
      }),

      getAllAggregated: createControllerMethod({
        path: '/all/aggregate',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler() {
          return {
            items: await BCMSMediaService.aggregateFromRoot(),
          };
        },
      }),

      getAllByParentId: createControllerMethod({
        path: '/all/parent/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          return {
            items: await BCMSMediaService.getChildren(media),
          };
        },
      }),

      getMany: createControllerMethod({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSRepo.media.findAllById(ids),
          };
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler() {
          return {
            count: await BCMSRepo.media.count(),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          return {
            item: media,
          };
        },
      }),

      getByIdAggregated: createControllerMethod({
        path: '/:id/aggregate',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type !== BCMSMediaType.DIR) {
            return {
              item: {
                _id: `${media._id}`,
                createdAt: media.createdAt,
                updatedAt: media.updatedAt,
                isInRoot: media.isInRoot,
                mimetype: media.mimetype,
                name: media.name,
                size: media.size,
                state: false,
                type: media.type,
                userId: media.userId,
              },
            };
          }
          return {
            item: await BCMSMediaService.aggregateFromParent({ parent: media }),
          };
        },
      }),

      getBinary: createControllerMethod({
        path: '/:id/bin',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({ media }),
          };
        },
      }),

      getBinaryByAccessToken: createControllerMethod<
        unknown,
        { __file: string }
      >({
        path: '/:id/bin/act',
        type: 'get',
        async handler({ request, errorHandler }) {
          const accessToken = jwt.get({
            jwtString: request.query.act + '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({ media }),
          };
        },
      }),

      getBinaryForSize: createControllerMethod({
        path: '/:id/bin/:size',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.READ),
        async handler({ request, errorHandler }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              size: request.params.size === 'small' ? 'small' : undefined,
            }),
          };
        },
      }),

      getBinaryForSizeByAccessToken: createControllerMethod<
        unknown,
        { __file: string }
      >({
        path: '/:id/bin/:size/act',
        type: 'get',
        async handler({ request, errorHandler }) {
          const accessToken = jwt.get({
            jwtString: request.query.act + '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              size: request.params.size === 'small' ? 'small' : undefined,
            }),
          };
        },
      }),

      getVideoThumbnail: createControllerMethod<unknown, { __file: string }>({
        path: '/:id/vid/bin/thumbnail',
        type: 'get',
        async handler({ request, errorHandler }) {
          const accessToken = jwt.get({
            jwtString: request.query.act + '',
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('mda012'),
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('mda007', { id: request.params.id }),
            );
          }
          if (!(await BCMSMediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await BCMSMediaService.storage.getPath({
              media,
              thumbnail: true,
            }),
          };
        },
      }),

      createFile: createControllerMethod({
        path: '/file',
        type: 'post',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.WRITE),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          const parentId = request.query.parentId as string;
          const file = request.file;
          if (!file) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('mda009'),
            );
          }
          let parent: BCMSMedia | null = null;
          if (parentId) {
            parent = await BCMSRepo.media.findById(parentId);
            if (!parent) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                bcmsResCode('mda001', { id: parentId }),
              );
            }
          }
          const fileNameParts = file.originalname.split('.');
          const fileName =
            fileNameParts.length > 1
              ? fileNameParts[fileNameParts.length - 2]
              : fileNameParts[0];
          const fileExt =
            fileNameParts.length > 1
              ? fileNameParts[fileNameParts.length - 1]
              : '';
          const media = BCMSFactory.media.create({
            userId: accessToken.payload.userId,
            type: BCMSMediaService.mimetypeToMediaType(file.mimetype),
            mimetype: file.mimetype,
            size: file.size,
            name:
              stringUtil.toSlug(fileName) + fileExt
                ? stringUtil.toSlug(fileName) + '.' + stringUtil.toSlug(fileExt)
                : '',
            isInRoot: !parent,
            hasChildren: false,
            parentId: parentId ? parentId : '',
            altText: '',
            caption: '',
            height: -1,
            width: -1,
          });
          if (
            await BCMSRepo.media.methods.findByNameAndParentId(
              media.name,
              parent ? `${parent._id}` : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          await BCMSMediaService.storage.save(media, file.buffer);
          if (media.type === BCMSMediaType.IMG) {
            try {
              const dimensions = await util.promisify(sizeOf)(
                await BCMSMediaService.storage.getPath({ media }),
              );
              if (!dimensions) {
                throw errorHandler.occurred(
                  HTTPStatus.NOT_FOUNT,
                  bcmsResCode('mda013'),
                );
              }
              media.width = dimensions.width as number;
              media.height = dimensions.height as number;
            } catch (error) {
              logger.error(name, error);
            }
          }
          const addedMedia = await BCMSRepo.media.add(media as never);
          if (!addedMedia) {
            await BCMSMediaService.storage.removeFile(media);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda003'),
            );
          }
          if (media.type === BCMSMediaType.VID) {
            try {
              await BCMSFfmpeg.createVideoThumbnail({ media });
            } catch (error) {
              logger.error(name, error);
            }
          } else if (media.type === BCMSMediaType.GIF) {
            try {
              await BCMSFfmpeg.createGifThumbnail({ media });
            } catch (error) {
              logger.error(name, error);
            }
          }
          await BCMSSocketManager.emit.media({
            mediaId: `${addedMedia._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedMedia,
          };
        },
      }),

      createDir: createControllerMethod({
        path: '/dir',
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSMediaAddDirData
        >({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSMediaAddDirDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          let parent: BCMSMedia | null = null;
          if (body.parentId) {
            parent = await BCMSRepo.media.findById(body.parentId);
            if (!parent) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                bcmsResCode('mda001', { id: body.parentId }),
              );
            }
          }
          body.name = stringUtil.toSlug(body.name);
          const media = BCMSFactory.media.create({
            userId: accessToken.payload.userId,
            type: BCMSMediaType.DIR,
            mimetype: 'dir',
            name: body.name,
            isInRoot: !parent,
            parentId: parent ? `${parent._id}` : '',
            hasChildren: true,
            altText: '',
            caption: '',
            height: -1,
            width: -1,
          });
          if (
            await BCMSRepo.media.methods.findByNameAndParentId(
              media.name,
              parent ? `${parent._id}` : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          const addedMedia = await BCMSRepo.media.add(media as never);
          if (!addedMedia) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda003'),
            );
          }
          await BCMSMediaService.storage.mkdir(addedMedia);
          await BCMSSocketManager.emit.media({
            mediaId: `${addedMedia._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedMedia,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler<
          BCMSUserCustomPool
        >([JWTRoleName.ADMIN, JWTRoleName.DEV], JWTPermissionName.DELETE),
        async handler({ request, errorHandler, accessToken }) {
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: request.params.id }),
            );
          }
          let deletedChildrenIds: string[] = [];
          if (media.type === BCMSMediaType.DIR) {
            deletedChildrenIds = (
              await BCMSMediaService.getChildren(media)
            ).map((e) => `${e._id}`);
            for (let i = 0; i < deletedChildrenIds.length; i++) {
              const childId = deletedChildrenIds[i];
              await BCMSRepo.media.deleteById(childId);
            }
            await BCMSRepo.media.deleteById(`${media._id}`);
            await BCMSMediaService.storage.removeDir(media);
          } else {
            const deleteResult = await BCMSRepo.media.deleteById(
              `${media._id}`,
            );
            if (!deleteResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                bcmsResCode('mda006'),
              );
            }
            await BCMSMediaService.storage.removeFile(media);
          }
          await BCMSSocketManager.emit.media({
            mediaId: `${media._id}`,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
