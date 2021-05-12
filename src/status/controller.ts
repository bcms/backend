import {
  Controller,
  ControllerPrototype,
  Delete,
  Get,
  Logger,
  PermissionName,
  Post,
  Put,
  RoleName,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { CacheControl } from '../cache';
import { JWTApiSecurity } from '../security';
import { FSStatus, Status } from './models';
import { StatusRequestHandler } from './request-handler';

@Controller('/api/status')
export class StatusController implements ControllerPrototype {
  baseUri: string;
  initRouter: () => void;
  logger: Logger;
  name: string;
  router: Router;

  @Get(
    '/all',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ items: Array<Status | FSStatus> }> {
    return {
      items: await StatusRequestHandler.getAll(),
    };
  }

  @Get(
    '/count',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async count(): Promise<{ count: number }> {
    return {
      count: await CacheControl.status.count(),
    };
  }

  @Get(
    '/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ item: Status | FSStatus }> {
    return {
      item: await StatusRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTApiSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ item: Status | FSStatus }> {
    return {
      item: await StatusRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '',
    JWTApiSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ item: Status | FSStatus }> {
    return {
      item: await StatusRequestHandler.update(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete(
    '/:id',
    JWTApiSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.DELETE),
  )
  async deleteById(
    request: Request,
  ): Promise<{
    message: 'Success.';
  }> {
    await StatusRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
