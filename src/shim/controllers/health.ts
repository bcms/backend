import {
  Controller,
  ControllerPrototype,
  HttpErrorFactory,
  HttpStatus,
  Logger,
  Post,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { ShimService } from '../service';

@Controller('/api/shim/health')
export class ShimHealthController implements ControllerPrototype {
  router: Router;
  logger: Logger;
  name: string;
  baseUri: string;
  initRouter: () => void;

  @Post('')
  async health(
    request: Request,
  ): Promise<{
    heepAvailable: number;
    heepUsed: number;
  }> {
    const error = HttpErrorFactory.instance('health', this.logger);
    const shimCode = request.headers.shimcode as string;
    if (!shimCode) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Missing important headers.',
      );
    }
    if (process.env.PROD === 'true' && shimCode !== ShimService.getCode()) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, 'Unauthorized');
    }
    ShimService.refreshAvailable();
    const mem = process.memoryUsage();
    return {
      heepAvailable: mem.heapTotal,
      heepUsed: mem.heapUsed,
    };
  }
}
