import * as express from 'express';
import * as path from 'path';

import {
  Application,
  CORSMiddleware,
  BodyParserMiddleware,
  PurpleCheetah,
  MongoDBConfig,
  EnableMongoDB,
  EnableSocketServer,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  RequestLoggerMiddleware,
  FSUtil,
} from '@becomes/purple-cheetah';
import { SwaggerController, SwaggerMiddleware } from './_swagger';
import { UserController } from './_user';
import { AuthController } from './_auth';
import { GroupController } from './_group';
import { TemplateController } from './_template';
import { WidgetController } from './_widget';
import { LanguageController } from './_language';
import { ApiKeyController, ApiKeyManager } from './_api';
import { MediaController, MediaParserMiddleware } from './_media';
import { Types } from 'mongoose';
import { EntryController } from './entry';
import { FunctionController } from './_function';
import { PluginController, PluginManager } from './_plugin';
import { EntryChangeSocketHandler } from './socket';
import { ApiKeySecurity } from './_security';
import { CypressController } from './_cypress';
import { StatusController } from './_status';
import {
  ShimAuthMiddleware,
  ShimHealthController,
  ShimInstanceUserController,
} from './_shim';

let dbConfig: MongoDBConfig;
if (process.env.DB_USE_FS) {
  dbConfig = {
    doNotUse: true,
  };
} else {
  if (process.env.DB_CLUSTER && process.env.DB_CLUSTER !== 'undefined') {
    dbConfig = {
      atlas: {
        db: {
          cluster: process.env.DB_CLUSTER,
          name: process.env.DB_NAME,
          readWrite: true,
        },
        user: {
          name: process.env.DB_USER,
          password: process.env.DB_PASS,
        },
      },
    };
  } else {
    dbConfig = {
      selfHosted: {
        db: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10),
          name: process.env.DB_NAME,
        },
        user: {
          name: process.env.DB_USER,
          password: process.env.DB_PASS,
        },
      },
    };
  }
}

/**
 * Application Module that starts all dependencies and
 * handles HTTP requests.
 */
@EnableSocketServer({
  path: '/api/socket/server/',
  onConnection: (socket) => {
    return {
      id: new Types.ObjectId().toHexString(),
      createdAt: Date.now(),
      group: 'global',
      socket,
    };
  },
  verifyConnection: async (socket) => {
    const query = (socket.request as any)._query;
    if (query.signature) {
      try {
        const key = await ApiKeySecurity.verify(
          {
            path: '',
            requestMethod: 'POST',
            data: {
              key: query.key,
              nonce: query.nonce,
              timestamp: query.timestamp,
              signature: query.signature,
            },
            payload: {},
          },
          true,
        );
        if (!key) {
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(query.at, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        return false;
      }
    }
    return true;
  },
  eventHandlers: [new EntryChangeSocketHandler()],
})
@EnableMongoDB(dbConfig)
@Application({
  port: parseInt(process.env.API_PORT, 10),
  controllers: [
    process.env.DEV === 'true' ? new SwaggerController() : undefined,
    process.env.CYPRESS === 'true' ? new CypressController() : undefined,
    new UserController(),
    new AuthController(),
    new GroupController(),
    new TemplateController(),
    new WidgetController(),
    new LanguageController(),
    new ApiKeyController(),
    new MediaController(),
    new EntryController(),
    new FunctionController(),
    new StatusController(),
    new PluginController(),
    new ShimHealthController(),
    new ShimInstanceUserController(),
  ],
  middleware: [
    new CORSMiddleware(),
    new BodyParserMiddleware({
      limit: process.env.BCMS_BODY_LIMIT
        ? parseInt(process.env.BCMS_BODY_LIMIT)
        : undefined,
    }),
    new ShimAuthMiddleware(),
    new MediaParserMiddleware(),
    process.env.DEV === 'true' ? new SwaggerMiddleware() : undefined,
    ...PluginManager.getMiddlewares(),
  ],
  requestLoggerMiddleware: new RequestLoggerMiddleware(),
})
export class App extends PurpleCheetah {
  protected start() {
    const pluginControllers = PluginManager.getControllers();
    pluginControllers.forEach((e) => {
      if (e) {
        e.initRouter();
      }
    });
    if (pluginControllers.length > 0) {
      this.controllers = [
        ...this.controllers,
        ...PluginManager.getControllers(),
      ];
    }
    const pluginMiddleware = PluginManager.getMiddlewares();
    if (pluginMiddleware.length > 0) {
      this.middleware = [...this.middleware, ...pluginMiddleware];
    }
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    this.app.use(
      express.static(
        path.join(
          process.cwd(),
          'node_modules',
          '@becomes',
          'cms-ui',
          'public',
        ),
      ),
    );
  }

  protected finalize() {
    ApiKeyManager.initializeKeys().catch((error) => {
      this.logger.error('Initialize api key manager', error);
    });
    let indexPath = path.join(process.cwd(), 'public', 'index.html');
    let checkIndex = true;
    this.app.use(
      '/',
      async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ) => {
        if (request.path.startsWith('/api')) {
          next();
          return;
        } else {
          response.status(200);
          if (checkIndex) {
            checkIndex = false;
            if (!(await FSUtil.exist(indexPath))) {
              indexPath = path.join(
                process.cwd(),
                'node_modules',
                '@becomes',
                'cms-ui',
                'public',
                'index.html',
              );
            }
          }
          response.sendFile(indexPath);
        }
      },
    );
  }
}
