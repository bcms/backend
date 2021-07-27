import * as crypto from 'crypto';
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
import { useBcmsMediaFactory } from './factory';
import { useBcmsMediaRepository } from './repository';
import { useBcmsMediaService } from './service';
import {
  BCMSFfmpeg,
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAddDirDataSchema,
  BCMSMediaFactory,
  BCMSMediaRepository,
  BCMSMediaService,
  BCMSMediaType,
  BCMSResponseCode,
  BCMSSocketEventType,
  BCMSSocketManager,
  BCMSUserCustomPool,
} from '../types';
import { createJwtAndBodyCheckRouteProtection, useBcmsFfmpeg } from '../util';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsSocketManager } from '../socket';

interface Setup {
  mediaRepo: BCMSMediaRepository;
  mediaFactory: BCMSMediaFactory;
  resCode: BCMSResponseCode;
  mediaService: BCMSMediaService;
  jwt: JWTManager;
  stringUtil: StringUtility;
  ffmpeg: BCMSFfmpeg;
  socket: BCMSSocketManager;
}

export const BCMSMediaController = createController<Setup>({
  name: 'Media controller',
  path: '/api/media',
  setup() {
    return {
      mediaRepo: useBcmsMediaRepository(),
      mediaFactory: useBcmsMediaFactory(),
      resCode: useBcmsResponseCode(),
      mediaService: useBcmsMediaService(),
      jwt: useJwt(),
      stringUtil: useStringUtility(),
      ffmpeg: useBcmsFfmpeg(),
      socket: useBcmsSocketManager(),
    };
  },
  methods({
    mediaRepo,
    mediaFactory,
    mediaService,
    resCode,
    jwt,
    stringUtil,
    ffmpeg,
    socket,
  }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await mediaRepo.findAll(),
          };
        },
      }),

      getAllAggregated: createControllerMethod({
        path: '/all/aggregate',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await mediaService.aggregateFromRoot(),
          };
        },
      }),

      getAllByParentId: createControllerMethod({
        path: '/all/parent/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          return {
            items: await mediaService.getChildren(media),
          };
        },
      }),

      getMany: createControllerMethod({
        path: '/many',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await mediaRepo.findAllById(ids),
          };
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            count: await mediaRepo.count(),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
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
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
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
            item: await mediaService.aggregateFromParent({ parent: media }),
          };
        },
      }),

      getBinary: createControllerMethod({
        path: '/:id/bin',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('mda007', { id: request.params.id }),
            );
          }
          if (!(await mediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await mediaService.storage.getPath({ media }),
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
              resCode.get('mda012'),
            );
          }
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('mda007', { id: request.params.id }),
            );
          }
          if (!(await mediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await mediaService.storage.getPath({ media }),
          };
        },
      }),

      getBinaryForSize: createControllerMethod({
        path: '/:id/bin/:size',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('mda007', { id: request.params.id }),
            );
          }
          if (!(await mediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await mediaService.storage.getPath({
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
              resCode.get('mda012'),
            );
          }
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('mda007', { id: request.params.id }),
            );
          }
          if (!(await mediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await mediaService.storage.getPath({
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
              resCode.get('mda012'),
            );
          }
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('mda007', { id: request.params.id }),
            );
          }
          if (!(await mediaService.storage.exist(media))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda008', { id: request.params.id }),
            );
          }
          return {
            __file: await mediaService.storage.getPath({
              media,
              thumbnail: true,
            }),
          };
        },
      }),

      createFile: createControllerMethod({
        path: '/file',
        type: 'post',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.WRITE,
          ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          const parentId = request.query.parentId as string;
          const file = request.file;
          if (!file) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('mda009'),
            );
          }
          let parent: BCMSMedia | null = null;
          if (parentId) {
            parent = await mediaRepo.findById(parentId);
            if (!parent) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                resCode.get('mda001', { id: parentId }),
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
          const media = mediaFactory.create({
            userId: accessToken.payload.userId,
            type: mediaService.mimetypeToMediaType(file.mimetype),
            mimetype: file.mimetype,
            size: file.size,
            name:
              stringUtil.toSlug(fileName) + fileExt
                ? stringUtil.toSlug(fileName) + '.' + stringUtil.toSlug(fileExt)
                : '',
            isInRoot: !parent,
            hasChildren: false,
            parentId: parentId ? parentId : '',
          });
          if (
            await mediaRepo.methods.findByNameAndParentId(
              media.name,
              parent ? `${parent._id}` : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          await mediaService.storage.save(media, file.buffer);
          const addedMedia = await mediaRepo.add(media as never);
          if (!addedMedia) {
            await mediaService.storage.removeFile(media);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda003'),
            );
          }
          if (media.type === BCMSMediaType.VID) {
            try {
              await ffmpeg.createVideoThumbnail({ media });
            } catch (error) {
              logger.error(name, error);
            }
          } else if (media.type === BCMSMediaType.GIF) {
            try {
              await ffmpeg.createGifThumbnail({ media });
            } catch (error) {
              logger.error(name, error);
            }
          }
          await socket.emit.media({
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
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSMediaAddDirData>({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaAddDirDataSchema,
          }),
        async handler({ body, errorHandler, accessToken }) {
          let parent: BCMSMedia | null = null;
          if (body.parentId) {
            parent = await mediaRepo.findById(body.parentId);
            if (!parent) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                resCode.get('mda001', { id: body.parentId }),
              );
            }
          }
          body.name = stringUtil.toSlug(body.name);
          const media = mediaFactory.create({
            userId: accessToken.payload.userId,
            type: BCMSMediaType.DIR,
            mimetype: 'dir',
            name: body.name,
            isInRoot: !parent,
            parentId: parent ? `${parent._id}` : '',
            hasChildren: true,
          });
          if (
            await mediaRepo.methods.findByNameAndParentId(
              media.name,
              parent ? `${parent._id}` : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          const addedMedia = await mediaRepo.add(media as never);
          if (!addedMedia) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('mda003'),
            );
          }
          await mediaService.storage.mkdir(addedMedia);
          await socket.emit.media({
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
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.DEV],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const media = await mediaRepo.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('mda001', { id: request.params.id }),
            );
          }
          let deletedChildrenIds: string[] = [];
          if (media.type === BCMSMediaType.DIR) {
            deletedChildrenIds = (await mediaService.getChildren(media)).map(
              (e) => `${e._id}`,
            );
            for (let i = 0; i < deletedChildrenIds.length; i++) {
              const childId = deletedChildrenIds[i];
              await mediaRepo.deleteById(childId);
            }
            await mediaRepo.deleteById(`${media._id}`);
            await mediaService.storage.removeDir(media);
          } else {
            const deleteResult = await mediaRepo.deleteById(`${media._id}`);
            if (!deleteResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                resCode.get('mda006'),
              );
            }
            await mediaService.storage.removeFile(media);
          }
          await socket.emit.media({
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
