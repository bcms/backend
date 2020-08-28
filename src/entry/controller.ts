import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { Entry, FSEntry } from './models';
import { EntryLite } from './interfaces';
import { EntryRequestHandler } from './request-handler';
import { ApiKeySecurity } from '../api';

@Controller('/api/entry')
export class EntryController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/all')
  async getAll(request: Request): Promise<{ entries: Array<Entry | FSEntry> }> {
    return {
      entries: await EntryRequestHandler.getAll(request.headers.authorization),
    };
  }

  @Get('/all/lite')
  async getAllLite(request: Request): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getAllLite(
        request.headers.authorization,
      ),
    };
  }

  @Get('/many/lite/:ids')
  async getManyLite(
    request: Request,
  ): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getManyLite(
        request.headers.authorization,
        request.params.ids,
      ),
    };
  }

  @Get('/all/:templateId')
  async getAllByTemplateId(
    request: Request,
  ): Promise<{ entries: Array<Entry | FSEntry> }> {
    return {
      entries: await EntryRequestHandler.getAllByTemplateId(
        request.headers.authorization,
        request.params.templateId,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/all/:templateId/lite')
  async getAllLiteByTemplateId(
    request: Request,
  ): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getAllLiteByTemplateId(
        request.headers.authorization,
        request.params.templateId,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Get('/count/:templateId')
  async countByTemplateId(request: Request): Promise<{ count: number }> {
    return {
      count: await EntryRequestHandler.countByTemplateId(
        request.headers.authorization,
        request.params.templateId,
      ),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
        request.query.signature
          ? ApiKeySecurity.requestToApiKeyRequest(request)
          : undefined,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.add(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.update(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await EntryRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
