import * as express from 'express';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

import {
  Application,
  CORSMiddleware,
  RequestLoggerMiddleware,
  BodyParserMiddleware,
  PurpleCheetah,
  MongoDBConfig,
  EnableMongoDB,
} from '@becomes/purple-cheetah';
import { SwaggerController } from './swagger/controller';
import { SwaggerMiddleware } from './swagger/middleware';
import { UserController } from './user';

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
@Application({
  port: parseInt(process.env.API_PORT, 10),
  controllers: [
    process.env.DEV === 'true' ? new SwaggerController() : undefined,
    new UserController(),
  ],
  middleware: [
    new CORSMiddleware(),
    new RequestLoggerMiddleware(),
    new BodyParserMiddleware(),
    process.env.DEV === 'true' ? new SwaggerMiddleware() : undefined,
  ],
})
@EnableMongoDB(dbConfig)
export class App extends PurpleCheetah {
  protected start() {
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
          if (
            await util.promisify(fs.exists)(
              path.join(
                process.cwd(),
                'node_modules',
                '@becomes',
                'cms-ui',
                'public',
                'index.html',
              ),
            )
          ) {
            response.status(200);
            response.sendFile(
              path.join(
                process.cwd(),
                'node_modules',
                '@becomes',
                'cms-ui',
                'public',
                '404.html',
              ),
            );
          } else {
            response.status(404);
            response.send('404');
          }
        }
      },
    );
  }
}
