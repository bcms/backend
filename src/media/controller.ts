import * as path from 'path';
import {
  createController,
  createControllerMethod,
  createQueue,
  useFS,
} from '@becomes/purple-cheetah';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { FS, HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
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
  BCMSRouteProtectionJwtApiResult,
  BCMSRouteProtectionJwtResult,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSMediaService } from './service';
import { BCMSMediaRequestHandler } from './request-handler';
import { BCMSImageProcessor } from './image-processor';
import type { Request } from 'express';
import { bcmsCreateDocObject } from '@bcms/doc';

interface Setup {
  jwt: JWTManager;
  fs: FS;
}
export const BCMSMediaController = createController<Setup>({
  name: 'Media controller',
  path: '/api/media',
  setup() {
    return {
      jwt: useJwt(),
      fs: useFS({
        base: process.cwd(),
      }),
    };
  },
  methods({ jwt, fs }) {
    const imageProcessQueue = createQueue();
    async function getBinFile(
      request: Request,
      errorHandler: HTTPError,
    ): Promise<{
      __file: string;
    }> {
      const apiKey = await BCMSRepo.apiKey.findById(request.params.keyId);
      if (!apiKey) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: request.params.id }),
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
      const queryParts = Buffer.from(request.params.fileOptions, 'hex')
        .toString()
        .split('&');
      const query: {
        [name: string]: string;
      } = {};
      for (let i = 0; i < queryParts.length; i++) {
        const part = queryParts[i];
        const keyValue = part.split('=');
        if (keyValue.length === 2) {
          query[keyValue[0]] = keyValue[1];
        }
      }

      if (
        query.ops &&
        (media.mimetype === 'image/jpeg' ||
          media.mimetype === 'image/jpg' ||
          media.mimetype === 'image/png')
      ) {
        let idx = parseInt(query.idx as string, 10);
        if (isNaN(idx) || idx < 0) {
          idx = 0;
        }
        const filePath = path.join(
          process.cwd(),
          'uploads',
          media._id,
          query.ops,
          media.name,
        );
        const filePathParts = filePath.split('.');
        const firstPart = filePathParts
          .slice(0, filePathParts.length - 1)
          .join('.');
        const lastPart = filePathParts[filePathParts.length - 1];
        const outputFilePath = `${firstPart}_${idx}.${
          query.webp ? 'webp' : lastPart
        }`;
        if (!(await fs.exist(outputFilePath, true))) {
          const options = BCMSImageProcessor.stringToOptions(query.ops + '');
          const mediaPath = path.join(
            process.cwd(),
            'uploads',
            await BCMSMediaService.getPath(media),
          );
          await imageProcessQueue({
            name: request.originalUrl,
            handler: async () => {
              await BCMSImageProcessor.process({
                media,
                pathToSrc: mediaPath,
                options,
              });
            },
          }).wait;
        }
        return {
          __file: outputFilePath,
        };
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
    }

    return {
      getAll: createControllerMethod<
        BCMSRouteProtectionJwtApiResult,
        { items: BCMSMedia[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all media',
          security: ['AccessToken', 'ApiKey'],
          response: {
            json: 'BCMSMediaItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAll(),
          };
        },
      }),

      getAllAggregated: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSMediaAggregate[] }
      >({
        path: '/all/aggregate',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get media aggregated',
          security: ['AccessToken'],
          ignore: true,
          response: {},
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSMediaRequestHandler.getAllAggregated(),
          };
        },
      }),

      getAllByParentId: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSMedia[] }
      >({
        path: '/all/parent/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all media for specified partner',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Parent media ID',
              required: true,
            },
          ],
          response: {
            json: 'BCMSMediaItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
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
        BCMSRouteProtectionJwtResult,
        { items: BCMSMedia[] }
      >({
        path: '/many',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get many media by IDs',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Ids',
              required: true,
              type: 'header',
              description: 'Media IDs split by `-` sign',
            },
          ],
          response: {
            json: 'BCMSMediaItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
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
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get number of available media',
          security: ['AccessToken'],
          response: {
            jsonSchema: {
              count: {
                __type: 'number',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSMediaRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        BCMSRouteProtectionJwtApiResult,
        { item: BCMSMedia }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get media by ID',
          security: ['AccessToken', 'ApiKey'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
          ],
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
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

      getByIdAggregated: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSMediaAggregate }
      >({
        path: '/:id/aggregate',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get media aggregated by ID',
          security: ['AccessToken'],
          ignore: true,
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
          ],
          response: {},
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
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

      getBinary: createControllerMethod<
        BCMSRouteProtectionJwtApiResult,
        { __file: string }
      >({
        path: '/:id/bin',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get media ID binary data',
          security: ['AccessToken', 'ApiKey'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
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
        doc: bcmsCreateDocObject({
          summary: 'Get media ID binary data by access token in cookie',
          security: ['AccessToken'],
          ignore: true,
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        async handler({ request, errorHandler }) {
          const atCookie = request.headers.cookie
            ? request.headers.cookie
                .split('; ')
                .find((e) => e.startsWith('bcmsat')) + ''
            : '';
          const accessToken = jwt.get({
            jwtString: atCookie.split('=')[1] || '',
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

      getBinaryApiKeyV2: createControllerMethod<unknown, { __file: string }>({
        path: '/pip/:id/bin/:keyId/:fileOptions/:fileName',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get optimized media file by API key',
          ignore: true,
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
            {
              name: 'keyId',
              type: 'path',
              description: 'API Key ID',
              required: true,
            },
            {
              name: 'fileOptions',
              type: 'path',
              description: 'Options for file optimization',
              required: true,
            },
            {
              name: 'fileName',
              type: 'path',
              description: 'Name of the media file',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        async handler({ request, errorHandler }) {
          return await getBinFile(request, errorHandler);
        },
      }),

      getBinaryApiKey: createControllerMethod<unknown, { __file: string }>({
        path: '/pip/:id/bin/:keyId/:fileOptions',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: '**DEPRECATED**: Get optimized media file by API key',
          ignore: true,
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
            {
              name: 'keyId',
              type: 'path',
              description: 'API Key ID',
              required: true,
            },
            {
              name: 'fileOptions',
              type: 'path',
              description: 'Options for file optimization',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        async handler({ request, errorHandler }) {
          return getBinFile(request, errorHandler);
        },
      }),

      getBinaryForSize: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { __file: string }
      >({
        path: '/:id/bin/:size',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get thumbnail for media',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
            {
              name: 'size',
              type: 'path',
              description: 'Can be on of: `small`',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
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
        doc: bcmsCreateDocObject({
          summary: 'Get thumbnail for media',
          security: ['AccessToken'],
          ignore: true,
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'Media ID',
              required: true,
            },
            {
              name: 'size',
              type: 'path',
              description: 'Can be on of: `small`',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
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

      requestUploadToken: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { token: string }
      >({
        path: '/request-upload-token',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Generate an upload token for media file uploading',
          security: ['AccessToken'],
          response: {
            jsonSchema: {
              token: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.WRITE,
        ),
        async handler({ accessToken }) {
          return BCMSMediaRequestHandler.requestUploadToken({ accessToken });
        },
      }),

      createFile: createControllerMethod<void, { item: BCMSMedia }>({
        path: '/file',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Upload a media file using upload token',
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
            {
              name: 'X-Bcms-Upload-Token',
              required: true,
              type: 'header',
              description: 'File upload token',
            },
            {
              name: 'parentId',
              required: false,
              description: 'Parent media ID',
              type: 'query',
            },
          ],
          body: {
            file: 'media',
          },
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        async handler({ request, errorHandler, logger, name }) {
          return {
            item: await BCMSMediaRequestHandler.createFile({
              sid: request.headers['x-bcms-sid'] as string,
              uploadToken: request.headers['x-bcms-upload-token'] as string,
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
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaAddDirData>,
        { item: BCMSMedia }
      >({
        path: '/dir',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Create media of type directory',
          description:
            'Media of type directory can be a parent for other media',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
          ],
          body: {
            json: 'BCMSMediaAddDirData',
          },
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaAddDirDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.createDir({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      updateFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaUpdateData>,
        { item: BCMSMedia }
      >({
        path: '/file',
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Update existing media',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
          ],
          body: {
            json: 'BCMSMediaUpdateData',
          },
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              accessToken,
              errorHandler,
            }),
          };
        },
      }),

      duplicateFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaDuplicateData>,
        { item: BCMSMedia }
      >({
        path: '/duplicate',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Duplicate existing media',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
          ],
          body: {
            json: 'BCMSMediaDuplicateDate',
          },
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaDuplicateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.duplicateFile({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      moveFile: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSMediaMoveData>,
        { item: BCMSMedia }
      >({
        path: '/move',
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Move media file to another location',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
          ],
          body: {
            json: 'BCMSMediaMoveData',
          },
          response: {
            json: 'BCMSMediaItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSMediaMoveDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSMediaRequestHandler.moveFile({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        doc: bcmsCreateDocObject({
          summary: 'Delete media by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'Media ID',
            },
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Socket connection ID',
            },
          ],
          response: {
            jsonSchema: {
              message: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          await BCMSMediaRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            id: request.params.id,
            errorHandler,
            accessToken,
            logger,
            name,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
