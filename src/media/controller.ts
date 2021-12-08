import * as crypto from 'crypto';
import imageSize from 'image-size';
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
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
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
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSMediaService } from './service';
import { BCMSFactory } from '@bcms/factory';
import { BCMSPropHandler } from '@bcms/prop';

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
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSMedia[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.DEV],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSRepo.media.findAll(),
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
            items: await BCMSMediaService.aggregateFromRoot(),
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
            items: await BCMSRepo.media.findAllById(ids),
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
            count: await BCMSRepo.media.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSMedia }
      >({
        path: '/:id',
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
                _id: media._id,
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

      getBinary: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { __file: string }
      >({
        path: '/:id/bin',
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
          const fileInfo = BCMSMediaService.getNameAndExt(file.originalname);
          const media = BCMSFactory.media.create({
            userId: accessToken.payload.userId,
            type: BCMSMediaService.mimetypeToMediaType(file.mimetype),
            mimetype: file.mimetype,
            size: file.size,
            name: `${stringUtil.toSlug(fileInfo.name)}${
              fileInfo.ext ? '.' + fileInfo.ext : ''
            }`,
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
              parent ? parent._id : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          await BCMSMediaService.storage.save(media, file.buffer);
          if (media.type === BCMSMediaType.IMG) {
            try {
              const dimensions = await util.promisify(imageSize)(
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
          const addedMedia = await BCMSRepo.media.add(media);
          if (!addedMedia) {
            await BCMSMediaService.storage.removeFile(media);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda003'),
            );
          }

          await BCMSSocketManager.emit.media({
            mediaId: addedMedia._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedMedia,
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
            parentId: parent ? parent._id : '',
            hasChildren: true,
            altText: '',
            caption: '',
            height: -1,
            width: -1,
          });
          if (
            await BCMSRepo.media.methods.findByNameAndParentId(
              media.name,
              parent ? parent._id : undefined,
            )
          ) {
            media.name =
              crypto.randomBytes(6).toString('hex') + '-' + media.name;
          }
          const addedMedia = await BCMSRepo.media.add(media);
          if (!addedMedia) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda003'),
            );
          }
          await BCMSMediaService.storage.mkdir(addedMedia);
          await BCMSSocketManager.emit.media({
            mediaId: addedMedia._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedMedia,
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
          const media = await BCMSRepo.media.findById(body._id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: body._id }),
            );
          }
          const oldMedia = JSON.parse(JSON.stringify(media));
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda005'),
            );
          }
          let changeDetected = false;
          const mediaNameInfo = BCMSMediaService.getNameAndExt(media.name);

          if (
            typeof body.name === 'string' &&
            body.name !== mediaNameInfo.name
          ) {
            const name = `${stringUtil.toSlug(body.name)}${
              mediaNameInfo.ext ? '.' + mediaNameInfo.ext : ''
            }`;

            if (
              await BCMSRepo.media.methods.findByNameAndParentId(
                name,
                media.parentId,
              )
            ) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                bcmsResCode('mda002', { name }),
              );
            }

            changeDetected = true;
            media.name = name;
          }
          if (
            typeof body.altText === 'string' &&
            body.altText !== media.altText
          ) {
            changeDetected = true;
            media.altText = body.altText;
          }
          if (
            typeof body.caption === 'string' &&
            body.caption !== media.caption
          ) {
            changeDetected = true;
            media.caption = body.caption;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          await BCMSMediaService.storage.rename(oldMedia, media);
          const updateMedia = await BCMSRepo.media.update(media);
          if (!updateMedia) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda005'),
            );
          }
          await BCMSSocketManager.emit.media({
            mediaId: updateMedia._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: updateMedia,
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
          const oldMedia = await BCMSRepo.media.findById(body._id);
          if (!oldMedia) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: body._id }),
            );
          }
          if (oldMedia.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda005'),
            );
          }
          const duplicateToMedia = await BCMSRepo.media.findById(
            body.duplicateTo,
          );
          let isInRootMedia: boolean;
          let parentIdMedia: string;
          if (duplicateToMedia) {
            if (duplicateToMedia.type !== BCMSMediaType.DIR) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                bcmsResCode('mda005'),
              );
            }
            isInRootMedia = false;
            parentIdMedia = duplicateToMedia._id;
          } else {
            isInRootMedia = true;
            parentIdMedia = '';
          }
          const newMedia = BCMSFactory.media.create({
            userId: accessToken.payload.userId,
            type: oldMedia.type,
            mimetype: oldMedia.mimetype,
            size: oldMedia.size,
            name: oldMedia.name,
            isInRoot: isInRootMedia,
            hasChildren: false,
            parentId: parentIdMedia,
            altText: oldMedia.altText,
            caption: oldMedia.caption,
            height: oldMedia.height,
            width: oldMedia.width,
          });

          // Check if media with name exists, and if does,
          // prefix `copyof-{n}-{medianame}`
          {
            let loop = true;
            let depth = 0;
            let newName = newMedia.name;
            while (loop) {
              if (
                await BCMSRepo.media.methods.findByNameAndParentId(
                  newName,
                  body.duplicateTo,
                )
              ) {
                depth++;
              } else {
                loop = false;
              }
              newName = `copyof-${depth > 0 ? `${depth}-` : ''}${
                newMedia.name
              }`;
            }
            newMedia.name = newName;
          }

          await BCMSMediaService.storage.duplicate(oldMedia, newMedia);
          const duplicateMedia = await BCMSRepo.media.add(newMedia);
          if (!duplicateMedia) {
            await BCMSMediaService.storage.removeFile(newMedia);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda003'),
            );
          }
          await BCMSSocketManager.emit.media({
            mediaId: duplicateMedia._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: duplicateMedia,
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
          const media = await BCMSRepo.media.findById(body._id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('mda001', { id: body._id }),
            );
          }
          if (media.type === BCMSMediaType.DIR) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('mda005'),
            );
          }
          const moveToMedia = await BCMSRepo.media.findById(body.moveTo);

          await BCMSMediaService.storage.move(media, moveToMedia);
          if (moveToMedia) {
            media.isInRoot = false;
            media.parentId = body.moveTo;
          } else {
            media.isInRoot = true;
            media.parentId = '';
          }
          const moveMedia = await BCMSRepo.media.update(media);

          await BCMSSocketManager.emit.media({
            mediaId: media._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: moveMedia,
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
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
