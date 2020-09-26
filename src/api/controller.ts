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
import { ApiKeyAccess, ApiKey, FSApiKey } from './models';
import { ApiKeyRequestHandler } from './request-handler';
import { ApiKeySecurity } from './security';

@Controller('/api/key')
export class ApiKeyController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/access/list')
  async getAccessList(request: Request): Promise<{ access: ApiKeyAccess }> {
    return {
      access: await ApiKeyRequestHandler.getAccessList(
        ApiKeySecurity.requestToApiKeyRequest(request),
      ),
    };
  }

  @Get('/all')
  async getAll(request: Request): Promise<{ keys: Array<ApiKey | FSApiKey> }> {
    return {
      keys: await ApiKeyRequestHandler.getAll(request.headers.authorization),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await ApiKeyRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.add(
        request.headers.authorization,
        request.headers.sid as string,
        request.body,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.update(
        request.headers.authorization,
        request.headers.sid as string,
        request.body,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await ApiKeyRequestHandler.deleteById(
      request.headers.authorization,
      request.headers.sid as string,
      request.params.id,
    );
    return {
      message: 'Success.',
    };
  }
}
