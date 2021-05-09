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
import { Router, Request } from 'express';
import { JWTSecurity } from '../security';
import { Language, FSLanguage } from './models';
import { LanguageRequestHandler } from './request-handler';

@Controller('/api/language')
export class LanguageController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ items: Array<Language | FSLanguage> }> {
    return {
      items: await LanguageRequestHandler.getAll(),
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
      count: await LanguageRequestHandler.count(),
    };
  }

  @Get(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ item: Language | FSLanguage }> {
    return {
      item: await LanguageRequestHandler.getById(request.params.id),
    };
  }

  @Post(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async add(request: Request): Promise<{ item: Language | FSLanguage }> {
    return {
      item: await LanguageRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '',
    JWTSecurity.preRequestHandler([RoleName.ADMIN], PermissionName.WRITE),
  )
  async update(request: Request): Promise<{ item: Language | FSLanguage }> {
    return {
      item: await LanguageRequestHandler.update(
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
    await LanguageRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
