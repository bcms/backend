import * as crypto from 'crypto';
import * as path from 'path';
import { ChildProcess } from '@banez/child_process';
import type { ChildProcessOnChunkHelperOutput } from '@banez/child_process/types';
import { bcmsResCode } from '@bcms/response-code';
import type {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRepo as BCMSRepoType,
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

interface CreateBackupBody {
  media?: boolean;
}
const CreateBackupBodySchema: ObjectSchema = {
  media: {
    __type: 'boolean',
    __required: false,
  },
};
interface DeleteBackupBody {
  hash?: string;
}
const DeleteBackupBodySchema: ObjectSchema = {
  hash: {
    __type: 'string',
    __required: false,
  },
};

export const BCMSBackupController = createController({
  name: 'Backup controller',
  path: '/api/backup',
  methods() {
    const outputFsName = '____backup';
    const fs = useFS({
      base: path.join(process.cwd(), outputFsName),
    });
    return {
      get: createControllerMethod<unknown, { __file: string }>({
        path: '/:hash',
        type: 'get',
        async handler({ request, errorHandler, response }) {
          const hash =
            request.params.hash.replace(/\//g, '').replace(/\.\./g, '') +
            '.zip';
          if (!(await fs.exist(hash, true))) {
            throw errorHandler.occurred(HTTPStatus.NOT_FOUNT, {
              message: 'Not found',
              hash,
            });
          }
          response.setHeader('Content-Type', 'application/zip');
          response.setHeader(
            'Content-Disposition',
            'attachment; filename=backup.zip',
          );
          return {
            __file: path.join(process.cwd(), outputFsName, hash),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<CreateBackupBody>,
        {
          hash: string;
        }
      >({
        path: '/create',
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.READ,
            bodySchema: CreateBackupBodySchema,
          }),
        async handler({ body, errorHandler, logger }) {
          if (!(await fs.exist(''))) {
            await fs.mkdir('');
          }
          const hash = crypto
            .createHash('sha1')
            .update(Date.now() + crypto.randomBytes(16).toString('hex'))
            .digest('hex');
          await fs.mkdir(hash);
          await fs.mkdir([hash, 'db']);
          if (body.media) {
            const pout: ChildProcessOnChunkHelperOutput = {
              err: '',
              out: '',
            };
            await ChildProcess.advancedExec(
              `zip -r ${outputFsName}/${hash}/uploads.zip uploads/*`,
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
              [hash, 'db', `${BCMSRepo[key].collection}.json`],
              JSON.stringify(await BCMSRepo[key].findAll()),
            );
          }
          {
            const pout: ChildProcessOnChunkHelperOutput = {
              err: '',
              out: '',
            };
            await ChildProcess.advancedExec(
              `cd ${outputFsName}/${hash} && zip -r ../${hash}.zip *`,
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
          await fs.deleteDir(hash);
          return {
            hash,
          };
        },
      }),

      delete: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<DeleteBackupBody>,
        { ok: boolean }
      >({
        path: '/delete',
        type: 'delete',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.DELETE,
            bodySchema: DeleteBackupBodySchema,
          }),
        async handler({ body, errorHandler }) {
          if (body.hash) {
            if (!(await fs.exist(body.hash + '.zip', true))) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                bcmsResCode('bak002', { hash: body.hash }),
              );
            }
            await fs.deleteFile(body.hash + '.zip');
          } else {
            const files = await fs.readdir('');
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              await fs.deleteFile(file);
            }
          }
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
