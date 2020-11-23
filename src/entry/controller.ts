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
import { Entry, FSEntry } from './models';
import { EntryLite, EntryParsed } from './interfaces';
import { EntryRequestHandler } from './request-handler';
import { JWTApiSecurity, JWTSecurity } from '../security';

@Controller('/api/entry')
export class EntryController implements ControllerPrototype {
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
  async getAll(): Promise<{ entries: Array<Entry | FSEntry> }> {
    return {
      entries: await EntryRequestHandler.getAll(),
    };
  }

  @Get(
    '/all/lite',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllLite(): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getAllLite(),
    };
  }

  @Get(
    '/many/lite/:ids',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getManyLite(request: Request): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getManyLite(request.params.ids),
    };
  }

  @Get(
    '/all/:templateId',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllByTemplateId(
    request: Request,
  ): Promise<{ entries: Array<Entry | FSEntry> }> {
    return {
      entries: await EntryRequestHandler.getAllByTemplateId(
        request.params.templateId,
      ),
    };
  }

  @Get(
    '/all/:templateId/parse',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllByTemplateIdParsed(
    request: Request,
  ): Promise<{ entries: EntryParsed[] }> {
    return {
      entries: await EntryRequestHandler.getAllByTemplateIdParsed(
        request.params.templateId,
      ),
    };
  }

  @Get(
    '/all/:templateId/lite',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllLiteByTemplateId(
    request: Request,
  ): Promise<{ entries: EntryLite[] }> {
    return {
      entries: await EntryRequestHandler.getAllLiteByTemplateId(
        request.params.templateId,
      ),
    };
  }

  @Get(
    '/count/:templateId',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async countByTemplateId(request: Request): Promise<{ count: number }> {
    return {
      count: await EntryRequestHandler.countByTemplateId(
        request.params.templateId,
      ),
    };
  }

  @Get(
    '/:templateId/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.getById(request.params.id),
    };
  }

  @Get(
    '/:templateId/:id/lite',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getByIdLite(request: Request): Promise<{ entry: EntryLite }> {
    return {
      entry: await EntryRequestHandler.getByIdLite(request.params.id),
    };
  }

  @Post(
    '/:templateId',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async add(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.add(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put(
    '/:templateId',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async update(request: Request): Promise<{ entry: Entry | FSEntry }> {
    return {
      entry: await EntryRequestHandler.update(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete(
    '/:templateId/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.DELETE,
    ),
  )
  async deleteById(request: Request): Promise<{ message: string }> {
    await EntryRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
