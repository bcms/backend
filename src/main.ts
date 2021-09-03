import 'module-alias/register';
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
import { BCMSConfig, loadBcmsConfig } from './config';
import { loadBcmsResponseCodes } from './response-code';
import { BCMSSwaggerController, BCMSSwaggerMiddleware } from './swagger';
import { BCMSCypressController } from './cypress';
import {
  BCMSShimHealthController,
  BCMSShimUserController,
  createBcmsShimService,
} from './shim';
import { BCMSUserController, createBcmsUserRepository } from './user';
import { createBcmsApiKeySecurity, useBcmsApiKeySecurity } from './security';
import { BCMSApiKeyController, createBcmsApiKeyRepository } from './api';
import { BCMSFunctionController, createBcmsFunctionModule } from './function';
import { BCMSPluginController, createBcmsPluginModule } from './plugin';
import { createBcmsEventModule } from './event';
import { createBcmsJobModule } from './job';
import { BCMSLanguageController, initLanguage } from './language';
import {
  BCMSMediaController,
  BCMSMediaMiddleware,
  createBcmsMediaRepository,
  createBcmsMediaService,
} from './media';
import { BCMSStatusController, createBcmsStatusRepository } from './status';
import { BCMSTemplateController, createBcmsTemplateRepository } from './template';
import { BCMSWidgetController, createBcmsWidgetRepository } from './widget';
import { createSocket } from '@becomes/purple-cheetah-mod-socket';
import { BCMSGroupController, createBcmsGroupRepository } from './group';
import { createBcmsPropHandler } from './prop';
import { createBcmsEntryParser, BCMSEntryController, createBcmsEntryRepository } from './entry';
import { createBcmsChildProcess, createBcmsFfmpeg } from './util';
import { BCMSTemplateOrganizerController, createBcmsTemplateOrganizerRepository } from './template-organizer';
import { createBcmsSocketManager } from './socket';
import { BCMSUiAssetMiddleware } from './ui-middleware';
import { createBcmsIdCounterRepository } from './id-counter';
import { createBcmsFactories } from './factory';

let backend: BCMSBackend;

async function initialize() {
  await loadBcmsConfig();
  await loadBcmsResponseCodes();
  createBcmsChildProcess();

  const modules: Module[] = [
    createBcmsFactories(),
    createBcmsShimService(),
    createJwt({
      scopes: [
        {
          secret: BCMSConfig.jwt.secret,
          issuer: BCMSConfig.jwt.scope,
          alg: JWTAlgorithm.HMACSHA256,
          expIn: BCMSConfig.jwt.expireIn,
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
    // Repos
    createBcmsApiKeyRepository(),
    createBcmsEntryRepository(),
    createBcmsGroupRepository(),
    createBcmsIdCounterRepository(),
    createBcmsMediaRepository(),
    createBcmsStatusRepository(),
    createBcmsTemplateRepository(),
    createBcmsTemplateOrganizerRepository(),
    createBcmsUserRepository(),
    createBcmsWidgetRepository(),
  ];
  const middleware: Middleware[] = [
    createCorsMiddleware(),
    createBodyParserMiddleware({
      limit: BCMSConfig.bodySizeLimit ? BCMSConfig.bodySizeLimit : undefined,
    }),
    BCMSMediaMiddleware,
    BCMSUiAssetMiddleware,
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
  if (BCMSConfig.database.fs) {
    modules.push(
      createFSDB({
        output: `db${BCMSConfig.database.prefix.startsWith('/') ? '' : '/'}${
          BCMSConfig.database.prefix
        }`,
      }),
    );
  } else if (BCMSConfig.database.mongodb) {
    if (BCMSConfig.database.mongodb.selfHosted) {
      modules.push(
        createMongoDB({
          selfHosted: {
            db: {
              port: BCMSConfig.database.mongodb.selfHosted.port,
              host: BCMSConfig.database.mongodb.selfHosted.host,
              name: BCMSConfig.database.mongodb.selfHosted.name,
            },
            user: {
              name: BCMSConfig.database.mongodb.selfHosted.user,
              password: BCMSConfig.database.mongodb.selfHosted.password,
            },
          },
        }),
      );
    } else if (BCMSConfig.database.mongodb.atlas) {
      modules.push(
        createMongoDB({
          atlas: {
            db: {
              name: BCMSConfig.database.mongodb.atlas.name,
              readWrite: true,
              cluster: BCMSConfig.database.mongodb.atlas.cluster,
            },
            user: {
              name: BCMSConfig.database.mongodb.atlas.user,
              password: BCMSConfig.database.mongodb.atlas.password,
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
  modules.push(createBcmsApiKeySecurity());
  modules.push(createBcmsPropHandler());
  modules.push(createBcmsEntryParser());
  modules.push(initLanguage());
  modules.push(createBcmsFunctionModule());
  modules.push(createBcmsEventModule());
  modules.push(createBcmsJobModule());

  modules.push(createBcmsPluginModule(BCMSConfig));

  backend = {
    app: createPurpleCheetah({
      port: BCMSConfig.port,
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
