import {
  ControllerPrototype,
  Logger,
  Get,
  Controller,
  Put,
  Post,
  Delete,
  RoleName,
  PermissionName,
  ControllerMethodData,
  JWT,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { UserRequestHandler } from './request-handler';
import { ProtectedUser } from './models';
import { JWTSecurity } from '../security';
import { UserCustomPool } from './interfaces';

@Controller('/api/user')
export class UserController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get(
    '/count',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async count(): Promise<{ count: number }> {
    return {
      count: await UserRequestHandler.count(),
    };
  }

  @Get('/is-initialized')
  async isInitialized(): Promise<{ initialized: boolean }> {
    return {
      initialized: await UserRequestHandler.isInitialized(),
    };
  }

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ items: ProtectedUser[] }> {
    return {
      items: await UserRequestHandler.getAll(),
    };
  }

  @Get(
    '',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getByAccessToken(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ item: ProtectedUser }> {
    return {
      item: await UserRequestHandler.getByAccessToken(data[3]),
    };
  }

  @Get(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ item: ProtectedUser }> {
    return {
      item: await UserRequestHandler.getById(request.params.id),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async update(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ item: ProtectedUser }> {
    return {
      item: await UserRequestHandler.update(
        data[3],
        data[0].body,
        data[0].headers.sid as string,
      ),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ item: ProtectedUser }> {
    return {
      item: await UserRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Post(
    '/:id/make-an-admin',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async makeAnAdmin(request: Request): Promise<{ item: ProtectedUser }> {
    return {
      item: await UserRequestHandler.makeAnAdmin(
        request.params.id,
        request.headers.sid as string,
      ),
    };
  }

  @Post('/admin/secret')
  async adminSecret(): Promise<{ message: string }> {
    return {
      message: UserRequestHandler.adminSecret(),
    };
  }

  @Post('/admin/create')
  async adminCreate(
    request: Request,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return await UserRequestHandler.adminCreate(request.body);
  }

  @Delete(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.DELETE,
    ),
  )
  async delete(
    ...data: ControllerMethodData<JWT<UserCustomPool>>
  ): Promise<{ message: string }> {
    await UserRequestHandler.delete(
      data[3],
      data[0].params.id,
      data[0].headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
