import { createMiddleware } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';

export const RequestLogger = createMiddleware({
  name: 'Request logger',
  async handler({ logger }) {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const ip = req.headers['x-forwarded-for'];
      logger.info('', `(${ip}) ${req.method} > ${req.originalUrl}`);
      next();
    };
  },
});
