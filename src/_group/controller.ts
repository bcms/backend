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
import { GroupLite } from './interfaces';
import { Group, FSGroup } from './models';
import { GroupRequestHandler } from './request-handler';
import { GroupFactory } from './factories';
import { JWTSecurity } from '../_security';

@Controller('/api/group')
export class GroupController implements ControllerPrototype {
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
    return await GroupRequestHandler.whereIsItUsed(request.params.id);
  }

  @Get(
    '/all/lite',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllLite(): Promise<{ items: GroupLite[] }> {
    return {
      items: (await GroupRequestHandler.getAll()).map((e) => {
        return GroupFactory.toLite(e);
      }),
    };
  }

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ items: Array<Group | FSGroup> }> {
    return {
      items: await GroupRequestHandler.getAll(),
    };
  }

  @Get(
    '/many/:ids',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getMany(request: Request): Promise<{ item: Array<Group | FSGroup> }> {
    return {
      item: await GroupRequestHandler.getMany(request.params.ids),
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
      count: await GroupRequestHandler.count(),
    };
  }

  @Get(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ item: Group | FSGroup }> {
    return {
      item: await GroupRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ item: Group | FSGroup }> {
    return {
      item: await GroupRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ item: Group | FSGroup }> {
    return {
      item: await GroupRequestHandler.update(
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
    await GroupRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
