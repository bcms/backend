import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  createJwtProtectionPreRequestHandler,
  useJwt,
} from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAddDirDataSchema,
  BCMSMediaAggregate,
  BCMSMediaDuplicateData,
  BCMSMediaDuplicateDataSchema,
  BCMSMediaMoveData,
  BCMSMediaMoveDataSchema,
  BCMSMediaType,
  BCMSMediaUpdateData,
  BCMSMediaUpdateDataSchema,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '../types';
import {
  createJwtAndBodyCheckRouteProtection,
  createJwtApiProtectionPreRequestHandler,
} from '../util';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSMediaService } from './service';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSMediaRequestHandler } from './request-handler';

interface Setup {
  jwt: JWTManager;
}
export const BCMSMediaController = createController<Setup>({
  name: 'Media controller',
  path: '/api/media',
  setup() {
    return {
      jwt: useJwt(),
    };
  },
  methods({ jwt }) {
    return {
      getAll: createControllerMethod<unknown, { items: BCMSMedia[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.DEV],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAll(),
          };
        },
      }),

      getAllAggregated: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMediaAggregate[] }
      >({
        path: '/all/aggregate',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAllAggregated(),
          };
        },
      }),

      getAllByParentId: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMedia[] }
      >({
        path: '/all/parent/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            items: await BCMSMediaRequestHandler.getAllByParentId({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMedia[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSMediaRequestHandler.getMany(ids),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSMediaRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<unknown, { item: BCMSMedia }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.DEV],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSMediaRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
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
          return {
            item: await BCMSMediaRequestHandler.getByIdAggregated({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      getBinary: createControllerMethod<unknown, { __file: string }>({
        path: '/:id/bin',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.DEV],
          permissionName: JWTPermissionName.READ,
        }),
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

      getBinaryForSize: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { __file: string }
      >({
        path: '/:id/bin/:size',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
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

      createFile: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSMedia }
      >({
        path: '/file',
        type: 'post',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.WRITE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          return {
            item: await BCMSMediaRequestHandler.createFile({
              accessToken,
              errorHandler,
              logger,
              name,
              file: request.file,
              parentId: request.query.parentId as string,
            }),
          };
        },
      }),

      createDir: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSMediaAddDirData>,
        { item: BCMSMedia }
      >({
        path: '/dir',
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSMediaAddDirDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSMediaRequestHandler.createDir({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      updateFile: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSMediaUpdateData>,
        { item: BCMSMedia }
      >({
        path: '/file',
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSMediaUpdateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSMediaRequestHandler.update({
              body,
              accessToken,
              errorHandler,
            }),
          };
        },
      }),

      duplicateFile: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSMediaDuplicateData>,
        { item: BCMSMedia }
      >({
        path: '/duplicate',
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSMediaDuplicateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSMediaRequestHandler.duplicateFile({
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      moveFile: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSMediaMoveData>,
        { item: BCMSMedia }
      >({
        path: '/move',
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSMediaMoveDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSMediaRequestHandler.moveFile({
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
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
            ).map((e) => e._id);
            for (let i = 0; i < deletedChildrenIds.length; i++) {
              const childId = deletedChildrenIds[i];
              await BCMSRepo.media.deleteById(childId);
            }
            await BCMSRepo.media.deleteById(media._id);
            await BCMSMediaService.storage.removeDir(media);
          } else {
            const deleteResult = await BCMSRepo.media.deleteById(media._id);
            if (!deleteResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                bcmsResCode('mda006'),
              );
            }
            await BCMSMediaService.storage.removeFile(media);
          }
          const errors = await BCMSPropHandler.removeMedia({
            mediaId: media._id,
          });
          if (errors) {
            logger.error(name, errors);
          }
          await BCMSSocketManager.emit.media({
            mediaId: media._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('media');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
