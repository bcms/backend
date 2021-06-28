import {
  MiddlewarePrototype,
  Middleware,
  Logger,
} from '@becomes/purple-cheetah';
import * as multer from 'multer';
import {
  RequestHandler,
  NextFunction,
  Response,
  Request,
  ErrorRequestHandler,
} from 'express';

const processFileFunction = multer({ limits: { fileSize: 102400000 } }).single(
  'media',
);

@Middleware({
  uri: '/api/media/file',
  handler: async (request: Request, response: Response, next: NextFunction) => {
    if (request.method === 'post' || request.method === 'POST') {
      processFileFunction(request, undefined, (e) => {
        if (e) {
          request.headers.upload_file_error_message = e.message;
        }
        next();
      });
    } else {
      next();
    }
  },
})
export class MediaParserMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger: Logger;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
