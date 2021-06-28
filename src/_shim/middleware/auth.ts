import {
  Logger,
  Middleware,
  MiddlewarePrototype,
} from '@becomes/purple-cheetah';
import {
  ErrorRequestHandler,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { ShimService } from '../service';

@Middleware({
  after: false,
  uri: '/',
  handler: async (req: Request, res: Response, next) => {
    if (process.env.BCMS_LOCAL || ShimService.isConnected()) {
      next();
    } else {
      res.status(500);
      res.json({
        message: 'Shim not connected.',
      });
      res.end();
    }
  },
})
export class ShimAuthMiddleware implements MiddlewarePrototype {
  after: boolean;
  uri: string;
  logger: Logger;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
