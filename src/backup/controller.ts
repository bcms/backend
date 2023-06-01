import * as crypto from 'crypto';
import * as path from 'path';
import * as nodeFs from 'fs/promises';
import { ChildProcess } from '@banez/child_process';
import type { ChildProcessOnChunkHelperOutput } from '@banez/child_process/types';
import { bcmsResCode } from '@bcms/response-code';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRepo as BCMSRepoType,
  BCMSSocketEventType,
  BCMSRouteProtectionJwtResult,
} from '@bcms/types';
import { BCMSRouteProtection } from '@bcms/util';
import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSRepo } from '../repo';
import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import { BCMSMediaRequestHandler, BCMSMediaService } from '@bcms/media';
import { BCMSSocketManager } from '@bcms/socket';
import { bcmsCreateDocObject } from '@bcms/doc';

export interface BCMSBackupCreateBody {
  media?: boolean;
}
export const BCMSBackupCreateBodySchema: ObjectSchema = {
  media: {
    __type: 'boolean',
    __required: false,
  },
};

export interface BCMSBackupDeleteBody {
  fileNames: string[];
}
export const BCMSBackupDeleteBodySchema: ObjectSchema = {
  fileNames: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export interface BCMSBackupRestoreEntitiesBody {
  type: keyof BCMSRepoType;
  items: FSDBEntity[];
}
export const BCMSBackupRestoreEntitiesBodySchema: ObjectSchema = {
  type: {
    __type: 'string',
    __required: true,
  },
};

export interface BCMSBackupListItem {
  _id: string;
  size: number;
  available: boolean;
}
export const BCMSBackupListItemSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  size: {
    __type: 'number',
    __required: true,
  },
  available: {
    __type: 'boolean',
    __required: true,
  },
};

export const BCMSBackupController = createController({
  name: 'Backup',
  path: '/api/backup',
  methods() {
    const outputFsName = '____backup';
    const fs = useFS({
      base: path.join(process.cwd(), outputFsName),
    });
    const downloadHashes: {
      [hash: string]: string;
    } = {};
    const createBackupBuffer: {
      [fileName: string]: boolean;
    } = {};

    return {
      list: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSBackupListItem[] }
      >({
        path: '/list',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get list of available backups',
          security: ['AccessToken'],
          response: {
            json: 'BCMSBackupListItemItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler() {
          if (await fs.exist('')) {
            const files = (await fs.readdir('')).filter((e) =>
              e.endsWith('.zip'),
            );
            const output: BCMSBackupListItem[] = [];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const fileStats = await nodeFs.lstat(
                path.join(process.cwd(), outputFsName, file),
              );
              output.push({
                _id: file,
                available: true,
                size: fileStats.size,
              });
            }
            for (const fileName in createBackupBuffer) {
              output.push({
                _id: fileName,
                available: false,
                size: -1,
              });
            }
            return { items: output };
          }
          return {
            items: [],
          };
        },
      }),

      getDownloadHash: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { hash: string }
      >({
        path: '/:fileName/hash',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Generate a download hash for specified backup file',
          security: ['AccessToken'],
          params: [
            {
              name: 'fileName',
              type: 'path',
              required: true,
              description: 'Name of the backup file',
            },
          ],
          response: {
            jsonSchema: {
              hash: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const fileName = request.params.fileName as string;
          if (!(await fs.exist(fileName, true))) {
            throw errorHandler.occurred(HTTPStatus.NOT_FOUNT, {
              message: 'Not found',
              fileName,
            });
          }
          const hash = crypto
            .createHash('sha1')
            .update(Date.now() + crypto.randomBytes(8).toString('hex'))
            .digest('hex');
          downloadHashes[hash] = fileName;
          return { hash };
        },
      }),

      get: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { __file: string }
      >({
        path: '/:hash',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get a backup file using generated hash',
          security: ['AccessToken'],
          params: [
            {
              name: 'hash',
              type: 'path',
              required: true,
            },
          ],
          response: {
            file: true,
          },
        }),
        async handler({ request, errorHandler, response }) {
          const hash = request.params.hash as string;
          if (!downloadHashes[hash]) {
            throw errorHandler.occurred(HTTPStatus.NOT_FOUNT, {
              message: 'Not found',
              hash,
            });
          }
          const fileName = downloadHashes[hash];
          response.setHeader('Content-Type', 'application/zip');
          response.setHeader(
            'Content-Disposition',
            `attachment; filename=${fileName}`,
          );
          delete downloadHashes[hash];
          return {
            __file: path.join(process.cwd(), outputFsName, fileName),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSBackupCreateBody>,
        {
          item: BCMSBackupListItem;
        }
      >({
        path: '/create',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Create a new backup',
          security: ['AccessToken'],
          body: {
            json: 'BCMSBackupCreateBody',
          },
          response: {
            json: 'BCMSBackupListItemItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.READ,
            bodySchema: BCMSBackupCreateBodySchema,
          }),
        async handler({ name, body, errorHandler, logger }) {
          if (!(await fs.exist(''))) {
            await fs.mkdir('');
          }
          const outputDir = new Date().toISOString();
          await fs.mkdir(outputDir);
          await fs.mkdir([outputDir, 'db']);
          async function processBackup() {
            if (body.media) {
              const pout: ChildProcessOnChunkHelperOutput = {
                err: '',
                out: '',
              };
              await ChildProcess.advancedExec(
                `zip -r ${outputFsName}/${outputDir}/uploads.zip uploads/*`,
                {
                  onChunk: ChildProcess.onChunkHelper(pout),
                  doNotThrowError: true,
                },
              ).awaiter;
              if (pout.err) {
                logger.error('create', pout);
                throw errorHandler.occurred(
                  HTTPStatus.INTERNAL_SERVER_ERROR,
                  bcmsResCode('bak001'),
                );
              }
            }
            for (const _key in BCMSRepo) {
              const key = _key as keyof BCMSRepoType;
              await fs.save(
                [outputDir, 'db', `${BCMSRepo[key].collection}.json`],
                JSON.stringify(await BCMSRepo[key].findAll()),
              );
            }
            await fs.copy(['..', 'logs'], [outputDir, 'logs']);
            {
              const pout: ChildProcessOnChunkHelperOutput = {
                err: '',
                out: '',
              };
              await ChildProcess.advancedExec(
                `cd ${outputFsName}/${outputDir} && zip -r ../${outputDir}.zip *`,
                {
                  onChunk: ChildProcess.onChunkHelper(pout),
                  doNotThrowError: true,
                },
              ).awaiter;
              if (pout.err) {
                logger.error('create', pout);
                throw errorHandler.occurred(
                  HTTPStatus.INTERNAL_SERVER_ERROR,
                  bcmsResCode('bak001'),
                );
              }
            }
            await fs.deleteDir(outputDir);
          }
          processBackup()
            .then(async () => {
              const fileStats = await nodeFs.lstat(
                path.join(process.cwd(), outputFsName, outputDir + '.zip'),
              );
              await BCMSSocketManager.emit.backup({
                fileName: outputDir + '.zip',
                size: fileStats.size,
                type: BCMSSocketEventType.UPDATE,
                userIds: (await BCMSRepo.user.findAll())
                  .filter((e) => e.roles[0].name === JWTRoleName.ADMIN)
                  .map((e) => e._id),
              });
              delete createBackupBuffer[outputDir + '.zip'];
            })
            .catch(async (err) => {
              delete createBackupBuffer[outputDir + '.zip'];
              logger.error(name, err);
              await BCMSSocketManager.emit.backup({
                fileName: outputDir + '.zip',
                size: -1,
                type: BCMSSocketEventType.REMOVE,
                userIds: (await BCMSRepo.user.findAll())
                  .filter((e) => e.roles[0].name === JWTRoleName.ADMIN)
                  .map((e) => e._id),
              });
            });
          await BCMSSocketManager.emit.backup({
            fileName: outputDir + '.zip',
            size: -1,
            type: BCMSSocketEventType.UPDATE,
            userIds: (await BCMSRepo.user.findAll())
              .filter((e) => e.roles[0].name === JWTRoleName.ADMIN)
              .map((e) => e._id),
          });
          createBackupBuffer[outputDir + '.zip'] = true;
          return {
            item: {
              available: false,
              size: -1,
              _id: outputDir + '.zip',
            },
          };
        },
      }),

      delete: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSBackupDeleteBody>,
        { ok: boolean }
      >({
        path: '/delete',
        type: 'delete',
        doc: bcmsCreateDocObject({
          summary: 'Delete a backup',
          security: ['AccessToken'],
          body: {
            json: 'BCMSBackupDeleteBody',
          },
          response: {
            jsonSchema: {
              ok: {
                __type: 'boolean',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.DELETE,
            bodySchema: BCMSBackupDeleteBodySchema,
          }),
        async handler({ body }) {
          for (let i = 0; i < body.fileNames.length; i++) {
            const fileName = body.fileNames[i];
            if (await fs.exist(fileName, true)) {
              await fs.deleteFile(fileName);
            }
          }
          return {
            ok: true,
          };
        },
      }),

      restoreEntities: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSBackupRestoreEntitiesBody>,
        { ok: boolean }
      >({
        path: '/restore-entities',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Restore entries from the backup',
          security: ['AccessToken'],
          body: {
            json: 'BCMSBackupRestoreEntitiesBody',
          },
          response: {
            jsonSchema: {
              ok: {
                __type: 'boolean',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSBackupRestoreEntitiesBodySchema,
          }),
        async handler({ body }) {
          const itemsToDelete: string[] = [];
          const dbItems = (await BCMSRepo[body.type].findAll()) as FSDBEntity[];
          for (let i = 0; i < body.items.length; i++) {
            const item = body.items[i];
            if (dbItems.find((e) => e._id === item._id)) {
              itemsToDelete.push(item._id);
            }
          }
          if (itemsToDelete.length > 0) {
            await BCMSRepo[body.type].deleteAllById(itemsToDelete);
          }
          await BCMSRepo[body.type].addMany(body.items as never);
          return {
            ok: true,
          };
        },
      }),

      restoreMediaFile: createControllerMethod<void, { ok: boolean }>({
        path: '/restore-media-file/:id',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Restore media file',
          params: [
            {
              name: 'X-Bcms-Upload-Token',
              type: 'header',
              description: 'Upload token',
              required: true,
            },
          ],
          response: {
            jsonSchema: {
              ok: {
                __type: 'boolean',
                __required: true,
              },
            },
          },
        }),
        async preRequestHandler({ errorHandler, request }) {
          if (
            !BCMSMediaRequestHandler.validateUploadToken(
              request.headers['x-bcms-upload-token'] as string,
            )
          ) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              'Missing or invalid upload token.',
            );
          }
        },
        async handler({ request, errorHandler }) {
          const file = request.file as Express.Multer.File;
          if (!file) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              'Missing file.',
            );
          }
          const media = await BCMSRepo.media.findById(request.params.id);
          if (!media) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              `Missing media index for "${request.params.id}"`,
            );
          }
          await BCMSMediaService.storage.save(media, file.buffer);
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
