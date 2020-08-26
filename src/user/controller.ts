import {
  ControllerPrototype,
  Logger,
  Get,
  Controller,
  Put,
  Post,
  Delete,
} from '@becomes/purple-cheetah';
import { Request } from 'express';
import { UserRequestHandler } from './request-handler';
import { ProtectedUser } from './models';

@Controller('/api/user')
export class UserController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await UserRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/is-initialized')
  async isInitialized(): Promise<{ initialized: boolean }> {
    return {
      initialized: await UserRequestHandler.isInitialized(),
    };
  }

  @Get('/all')
  async getAll(request: Request): Promise<{ users: ProtectedUser[] }> {
    return {
      users: await UserRequestHandler.getAll(request.headers.authorization),
    };
  }

  @Get()
  async getByAccessToken(request: Request): Promise<{ user: ProtectedUser }> {
    return {
      user: await UserRequestHandler.getByAccessToken(
        request.headers.authorization,
      ),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ user: ProtectedUser }> {
    return {
      user: await UserRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ user: ProtectedUser }> {
    return {
      user: await UserRequestHandler.update(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ user: ProtectedUser }> {
    return {
      user: await UserRequestHandler.add(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Post('/:id/make-an-admin')
  async makeAnAdmin(request: Request): Promise<{ user: ProtectedUser }> {
    return {
      user: await UserRequestHandler.makeAnAdmin(
        request.headers.authorization,
        request.params.id,
        request.headers.sid as string,
      ),
    };
  }

  @Post('/admin/secret')
  async adminSecret(request: Request): Promise<{ message: string }> {
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

  @Delete('/:id')
  async delete(request: Request): Promise<{ message: string }> {
    await UserRequestHandler.delete(
      request.headers.authorization,
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
