import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '@becomes/purple-cheetah';
import type {
  Controller,
  Middleware,
  Module,
} from '@becomes/purple-cheetah/types';
import {
  JWT,
  JWTAlgorithm,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { createJwt, useJwt } from '@becomes/purple-cheetah-mod-jwt';
import { createFSDB } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDB } from '@becomes/purple-cheetah-mod-mongodb';

import type { BCMSBackend, BCMSUserCustomPool } from './types';
import { loadBcmsConfig, useBcmsConfig } from './config';
import { loadResponseCode } from './response-code';
import { BCMSSwaggerController, BCMSSwaggerMiddleware } from './swagger';
import { BCMSCypressController } from './cypress';
import {
  BCMSShimHealthController,
  BCMSShimUserController,
  createBcmsShimService,
} from './shim';
import { BCMSUserController } from './user';
import { createBcmsApiKeySecurity, useBcmsApiKeySecurity } from './security';
import { BCMSApiKeyController } from './api';
import { BCMSFunctionController, createBcmsFunctionModule } from './function';
import { BCMSPluginController, createBcmsPluginModule } from './plugin';
import { createBcmsEventModule } from './event';
import { createBcmsJobModule } from './job';
import { BCMSLanguageController, initLanguage } from './language';
import {
  BCMSMediaController,
  BCMSMediaMiddleware,
  createBcmsMediaService,
} from './media';
import { BCMSStatusController } from './status';
import { BCMSTemplateController } from './template';
import { BCMSWidgetController } from './widget';
import { createSocket } from '@becomes/purple-cheetah-mod-socket';
import { BCMSGroupController } from './group';
import { createBcmsPropHandler } from './prop';
import { createBcmsEntryParser, BCMSEntryController } from './entry';
import { bcmsSetup } from './setup';
import { createBcmsChildProcess, createBcmsFfmpeg } from './util';
import { BCMSTemplateOrganizerController } from './template-organizer';
import { createBcmsSocketManager } from './socket';

let backend: BCMSBackend;

async function initialize() {
  await loadBcmsConfig();
  await loadResponseCode();
  createBcmsChildProcess();
  const bcmsConfig = useBcmsConfig();

  const modules: Module[] = [
    createBcmsShimService(),
    createJwt({
      scopes: [
        {
          secret: bcmsConfig.jwt.secret,
          issuer: bcmsConfig.jwt.scope,
          alg: JWTAlgorithm.HMACSHA256,
          expIn: bcmsConfig.jwt.expireIn,
        },
      ],
    }),
    createSocket({
      path: '/api/socket/server',
      onConnection(socket) {
        let id: string;
        if (socket.handshake.query.at) {
          try {
            const token: JWT<BCMSUserCustomPool> = JSON.parse(
              socket.handshake.query.token as string,
            );
            id = token.payload.userId;
          } catch (err) {
            id = 'none';
          }
        } else {
          id = socket.handshake.query.key as string;
        }
        return {
          id,
          createdAt: Date.now(),
          scope: 'global',
          socket,
        };
      },
      async verifyConnection(socket) {
        const query = socket.handshake.query as {
          at: string;
          signature: string;
          key: string;
          nonce: string;
          timestamp: string;
        };
        if (query.signature) {
          try {
            const apiKeySecurity = useBcmsApiKeySecurity();
            const key = await apiKeySecurity.verify(
              {
                path: '',
                requestMethod: 'POST',
                data: {
                  k: query.key,
                  n: query.nonce,
                  t: query.timestamp,
                  s: query.signature,
                },
                payload: {},
              },
              true,
            );
            if (!key) {
              return false;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
          }
        } else {
          const jwt = useJwt();
          const token = jwt.get({
            jwtString: query.at,
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.READ,
          });
          if (token instanceof JWTError) {
            return false;
          }
        }
        return true;
      },
      // eventHandlers: [createEntryChangeSocketHandler()],
    }),
    createBcmsSocketManager(),
    createBcmsMediaService(),
    createBcmsFfmpeg(),
  ];
  const middleware: Middleware[] = [
    createCorsMiddleware(),
    createBodyParserMiddleware({
      limit: bcmsConfig.bodySizeLimit ? bcmsConfig.bodySizeLimit : undefined,
    }),
    BCMSMediaMiddleware,
  ];
  const controllers: Controller[] = [
    BCMSUserController,
    BCMSShimHealthController,
    BCMSShimUserController,
    BCMSApiKeyController,
    BCMSPluginController,
    BCMSLanguageController,
    BCMSGroupController,
    BCMSMediaController,
    BCMSStatusController,
    BCMSFunctionController,
    BCMSTemplateController,
    BCMSWidgetController,
    BCMSEntryController,
    BCMSTemplateOrganizerController,
  ];
  if (bcmsConfig.database.fs) {
    modules.push(
      createFSDB({
        output: `db${bcmsConfig.database.prefix.startsWith('/') ? '' : '/'}${
          bcmsConfig.database.prefix
        }`,
      }),
    );
  } else if (bcmsConfig.database.mongodb) {
    if (bcmsConfig.database.mongodb.selfHosted) {
      modules.push(
        createMongoDB({
          selfHosted: {
            db: {
              port: bcmsConfig.database.mongodb.selfHosted.port,
              host: bcmsConfig.database.mongodb.selfHosted.host,
              name: bcmsConfig.database.mongodb.selfHosted.name,
            },
            user: {
              name: bcmsConfig.database.mongodb.selfHosted.user,
              password: bcmsConfig.database.mongodb.selfHosted.password,
            },
          },
        }),
      );
    } else if (bcmsConfig.database.mongodb.atlas) {
      modules.push(
        createMongoDB({
          atlas: {
            db: {
              name: bcmsConfig.database.mongodb.atlas.name,
              readWrite: true,
              cluster: bcmsConfig.database.mongodb.atlas.cluster,
            },
            user: {
              name: bcmsConfig.database.mongodb.atlas.user,
              password: bcmsConfig.database.mongodb.atlas.password,
            },
          },
        }),
      );
    } else {
      throw Error('No MongoDB database configuration detected.');
    }
  } else {
    throw Error('No database configuration detected.');
  }
  if (process.env.BCMS_ENV !== 'PRODUCTION') {
    middleware.push(BCMSSwaggerMiddleware);
    middleware.push(createRequestLoggerMiddleware());
    controllers.push(BCMSSwaggerController);
    controllers.push(BCMSCypressController);
  }
  modules.push(createBcmsFunctionModule());
  modules.push(createBcmsEventModule());
  modules.push(createBcmsJobModule());
  modules.push(createBcmsApiKeySecurity());
  modules.push(createBcmsPropHandler());
  modules.push(createBcmsEntryParser());
  modules.push(initLanguage());

  modules.push(createBcmsPluginModule(bcmsConfig));

  modules.push(bcmsSetup());

  backend = {
    app: createPurpleCheetah({
      port: bcmsConfig.port,
      middleware,
      controllers,
      modules,
    }),
  };
}
initialize().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

export function useBCMSBackend(): BCMSBackend {
  return backend;
}
