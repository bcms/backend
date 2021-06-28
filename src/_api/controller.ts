import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  ControllerMethodData,
  RoleName,
  PermissionName,
  JWT,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { UserCustomPool } from '../_user';
import { ApiKeySecurity, JWTSecurity } from '../_security';
import { ApiKeyAccess, ApiKey, FSApiKey } from './models';
import { ApiKeyRequestHandler } from './request-handler';

@Controller('/api/key')
export class ApiKeyController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/access/list', ApiKeySecurity.preRequestHandler())
  async getAccessList(
    ...data: ControllerMethodData<ApiKey | FSApiKey>
  ): Promise<{ access: ApiKeyAccess }> {
    return {
      access: await ApiKeyRequestHandler.getAccessList(data[3]),
    };
  }

  @Get(
    '/count',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.READ),
  )
  async count(): Promise<{ count: number }> {
    return {
      count: await ApiKeyRequestHandler.count(),
    };
  }

  @Get(
    '/all',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.READ),
  )
  async getAll(): Promise<{ keys: Array<ApiKey | FSApiKey> }> {
    return {
      keys: await ApiKeyRequestHandler.getAll(),
    };
  }

  @Get(
    '/:id',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.READ),
  )
  async getById(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.getById(data[0].params.id),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.add(
        data[3],
        data[0].headers.sid as string,
        data[0].body,
      ),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ key: ApiKey | FSApiKey }> {
    return {
      key: await ApiKeyRequestHandler.update(
        data[0].headers.sid as string,
        data[0].body,
      ),
    };
  }

  @Delete(
    '/:id',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.DELETE),
  )
  async deleteById(request: Request): Promise<{ message: string }> {
    await ApiKeyRequestHandler.deleteById(
      request.headers.sid as string,
      request.params.id,
    );
    return {
      message: 'Success.',
    };
  }
}
