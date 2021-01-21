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
  async getAll(): Promise<{ statuses: Array<Status | FSStatus> }> {
    return {
      statuses: await StatusRequestHandler.getAll(),
    };
  }

  @Get(
    '/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ status: Status | FSStatus }> {
    return {
      status: await StatusRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTApiSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ status: Status | FSStatus }> {
    return {
      status: await StatusRequestHandler.add(request.body),
    };
  }

  @Put(
    '',
    JWTApiSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ status: Status | FSStatus }> {
    return {
      status: await StatusRequestHandler.update(request.body),
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
    await StatusRequestHandler.deleteById(request.params.id);
    return {
      message: 'Success.',
    };
  }
}
