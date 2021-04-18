import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  RoleName,
  PermissionName,
} from '@becomes/purple-cheetah';
import { Request } from 'express';
import { JWTApiSecurity, JWTSecurity } from '../security';
import { Template, FSTemplate } from './models';
import { TemplateRequestHandler } from './request-handler';

@Controller('/api/template')
export class TemplateController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ items: Array<Template | FSTemplate> }> {
    return {
      items: await TemplateRequestHandler.getAll(),
    };
  }

  @Get(
    '/many/:ids',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getMany(
    request: Request,
  ): Promise<{ items: Array<Template | FSTemplate> }> {
    return {
      items: await TemplateRequestHandler.getMany(request.params.ids),
    };
  }

  @Get(
    '/count',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async count(): Promise<{ count: number }> {
    return {
      count: await TemplateRequestHandler.count(),
    };
  }

  @Get(
    '/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ item: Template | FSTemplate }> {
    return {
      item: await TemplateRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ item: Template | FSTemplate }> {
    return {
      item: await TemplateRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ item: Template | FSTemplate }> {
    return {
      item: await TemplateRequestHandler.update(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete(
    '/:id',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.DELETE),
  )
  async deleteById(request: Request): Promise<{ message: string }> {
    await TemplateRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
