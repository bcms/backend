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
import { Request, Router } from 'express';
import { JWTSecurity } from '../security';
import { FSWidget, Widget } from './models';
import { WidgetRequestHandler } from './request-handler';

@Controller('/api/widget')
export class WidgetController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get(
    '/:id/where-is-it-used',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async whereIsItUsed(request: Request) {
    return await WidgetRequestHandler.whereIsItUsed(request.params.id);
  }

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ widgets: Array<Widget | FSWidget> }> {
    return {
      widgets: await WidgetRequestHandler.getAll(),
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
  ): Promise<{ widgets: Array<Widget | FSWidget> }> {
    return {
      widgets: await WidgetRequestHandler.getMany(request.params.ids),
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
      count: await WidgetRequestHandler.count(),
    };
  }

  @Get(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.update(
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
    await WidgetRequestHandler.deleteById(request.params.id);
    return {
      message: 'Success.',
    };
  }
}
