import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
} from '@becomes/purple-cheetah';
import type {
  Controller,
  Middleware,
  Module,
} from '@becomes/purple-cheetah/types';
import { JWTAlgorithm } from '@becomes/purple-cheetah-mod-jwt/types';
import { createJwt } from '@becomes/purple-cheetah-mod-jwt';
import { createFSDB } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDB } from '@becomes/purple-cheetah-mod-mongodb';

import type { BCMSBackend } from './types';
import { loadBcmsConfig, useBcmsConfig } from './config';
import { loadResponseCode } from './response-code';
import { BCMSSwaggerController, BCMSSwaggerMiddleware } from './swagger';
import { BCMSCypressController } from './cypress';
import { UserController } from './user';
import {
  BCMSShimHealthController,
  BCMSShimUserController,
  createBcmsShimService,
} from './shim';

let backend: BCMSBackend;

async function initialize() {
  await loadBcmsConfig();
  await loadResponseCode();
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
  ];
  const middleware: Middleware[] = [
    createCorsMiddleware(),
    createBodyParserMiddleware({
      limit: bcmsConfig.bodySizeLimit ? bcmsConfig.bodySizeLimit : undefined,
    }),
  ];
  const controllers: Controller[] = [
    UserController,
    BCMSShimHealthController,
    BCMSShimUserController,
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
    controllers.push(BCMSSwaggerController);
    controllers.push(BCMSCypressController);
  }

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
  console.error(error);
  process.exit(1);
});

export function useBCMSBackend() {
  return backend;
}
