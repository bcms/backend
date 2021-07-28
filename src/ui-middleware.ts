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
      if (req.path.startsWith('/api')) {
        next();
      } else {
        const filePath = path.join(
          process.cwd(),
          'public',
          req.path.replace(/../g, ''),
        );
        if (fs.exist(filePath, true)) {
          res.sendFile(filePath);
        } else {
          res.send(path.join(process.cwd(), 'public', 'index.html'));
        }
      }
    };
  },
});
