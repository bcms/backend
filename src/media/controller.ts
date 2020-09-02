import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  HttpErrorFactory,
  HttpStatus,
  Post,
  Delete,
  Put,
} from '@becomes/purple-cheetah';
import { Router, Request, Response } from 'express';
import { Media, FSMedia, MediaType } from './models';
import { MediaRequestHandler } from './request-handler';
import { ApiKeySecurity } from '../api';
import { MediaAggregate } from './interfaces';
import { ResponseCode } from '../response-code';
import { MediaUtil } from '../util';

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
      media: await MediaRequestHandler.getAll(
        request.headers.authorization,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/all/aggregate')
  async getAllAggregated(
    request: Request,
  ): Promise<{ media: MediaAggregate[] }> {
    return {
      media: await MediaRequestHandler.getAllAggregated(
        request.headers.authorization,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/all/parent/:id')
  async getAllByParentId(
    request: Request,
  ): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getAllByParentId(
        request.headers.authorization,
        request.params.id,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/many/:ids')
  async getMany(request: Request): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getMany(
        request.headers.authorization,
        request.params.ids,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await MediaRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/:id/aggregate')
  async getByIdAggregated(
    request: Request,
  ): Promise<{ media: MediaAggregate }> {
    return {
      media: await MediaRequestHandler.getByIdAggregated(
        request.headers.authorization,
        request.params.id,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/:id/bin')
  async getBinary(request: Request, response: Response) {
    const error = HttpErrorFactory.instance('getBinary', this.logger);
    const media = await MediaRequestHandler.getById(
      request.headers.authorization,
      request.params.id,
      request.query.signature
        ? ApiKeySecurity.requestToApiKeyRequest(request)
        : undefined,
    );
    if (media.type === MediaType.DIR) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('mda007', { id: request.params.id }),
      );
    }
    if ((await MediaUtil.fs.exist(media)) === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda008', { id: request.params.id }),
      );
    }
    response.sendFile(MediaUtil.fs.getPath(media));
    return;
  }

  @Post('/file')
  async addFile(request: Request): Promise<{ media: Media | FSMedia }> {
    this.logger.warn('addFile', request.headers.upload_file_error_message);
    return {
      media: await MediaRequestHandler.addFile(
        request.headers.authorization,
        request.headers.sid as string,
        request.query.parentId ? '' + request.query.parentId : undefined,
        request.file,
      ),
    };
  }

  @Post('/dir')
  async addDir(request: Request): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.addDir(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put('/:id')
  async update(request: Request): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.update(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await MediaRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
