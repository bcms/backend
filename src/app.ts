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
} from '@becomes/purple-cheetah';
import { SwaggerController, SwaggerMiddleware } from './swagger';
import { UserController } from './user';
import { AuthController } from './auth';
import { GroupController } from './group';
import { TemplateController } from './template';
import { WidgetController } from './widget';
import { LanguageController } from './language';
import { ApiKeyController, ApiKeyManager } from './api';
import { MediaController, MediaParserMiddleware } from './media';
import { Types } from 'mongoose';
import { EntryController } from './entry/controller';
import { FunctionController } from './function';
import { controllers, middleware } from './plugins';
import { EntryChangeSocketHandler } from './socket';

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
    const jwt = JWTSecurity.checkAndValidateAndGet(socket.request._query.at, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      return false;
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
    ...controllers.map((e) => {
      return new e.PluginController();
    }),
  ],
  middleware: [
    new CORSMiddleware(),
    new BodyParserMiddleware(),
    new MediaParserMiddleware(),
    process.env.DEV === 'true' ? new SwaggerMiddleware() : undefined,
    ...middleware.map((e) => {
      return new e.PluginMiddleware();
    }),
  ],
  requestLoggerMiddleware: new RequestLoggerMiddleware(),
})
export class App extends PurpleCheetah {
  protected start() {
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
          response.sendFile(
            path.join(
              process.cwd(),
              'node_modules',
              '@becomes',
              'cms-ui',
              'public',
              'index.html',
            ),
          );
        }
      },
    );
  }
}
