import * as path from 'path';
import { createMiddleware, useFS } from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';

export const BCMSUiAssetMiddleware = createMiddleware({
  name: 'UI assets middleware',
  after: false,
  path: '/',
  handler() {
    const fs = useFS();
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        next();
      } else {
        const filePath = path.join(
          process.cwd(),
          'public',
          ...req.originalUrl.substring(1).replace(/\.\./g, '').split('/'),
        );
        console.log(filePath);
        if (await fs.exist(filePath, true)) {
          res.sendFile(filePath);
        } else {
          res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
        }
      }
    };
  },
});
