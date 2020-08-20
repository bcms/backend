import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { Media, FSMedia } from './models';
import { MediaRequestHandler } from './request-handler';

@Controller('/api/media')
export class MediaController implements ControllerPrototype {
  baseUri: string;
  initRouter: any;
  logger: Logger;
  name: string;
  router: Router;

  @Get('/all')
  async getAll(request: Request): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getAll(request.headers.authorization),
    };
  }
}
