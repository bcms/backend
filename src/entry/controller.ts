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
  ControllerMethodData,
  JWT,
  Entity,
  FSDBEntity,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { Entry, FSEntry } from './models';
import { EntryLite, EntryParsed } from './interfaces';
import { EntryRequestHandler } from './request-handler';
import {
  JWTApiSecurity,
  JWTSecurity,
  JWTApiSecurityPreRequestHandlerOutput,
} from '../security';
import { UserCustomPool } from '../user';

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
  async getAll(): Promise<{ items: Array<Entry | FSEntry> }> {
    return {
      items: await EntryRequestHandler.getAll(),
    };
  }

  @Get(
    '/all/lite',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllLite(): Promise<{ items: EntryLite[] }> {
    return {
      items: await EntryRequestHandler.getAllLite(),
    };
  }

  @Get(
    '/many/lite/:ids',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getManyLite(request: Request): Promise<{ items: EntryLite[] }> {
    return {
      items: await EntryRequestHandler.getManyLite(request.params.ids),
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
  ): Promise<{ items: Array<Entry | FSEntry> }> {
    return {
      items: await EntryRequestHandler.getAllByTemplateId(
        request.params.templateId,
      ),
    };
  }

  @Get(
    '/all/:templateId/index',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllByTemplateIdIndexed(
    request: Request,
  ): Promise<{ items: Array<Entity | FSDBEntity> }> {
    return {
      items: await EntryRequestHandler.getAllByTemplateIdIndexed(
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
  ): Promise<{ items: EntryParsed[] }> {
    return {
      items: await EntryRequestHandler.getAllByTemplateIdParsed(
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
  ): Promise<{ items: EntryLite[] }> {
    return {
      items: await EntryRequestHandler.getAllLiteByTemplateId(
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
  async getById(request: Request): Promise<{ item: Entry | FSEntry }> {
    return {
      item: await EntryRequestHandler.getById(request.params.id),
    };
  }

  @Get(
    '/:templateId/:id/parse',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getByIdParsed(request: Request): Promise<{ item: EntryParsed }> {
    return {
      item: await EntryRequestHandler.getByIdParsed(request.params.id),
    };
  }

  @Get(
    '/:templateId/:id/lite',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getByIdLite(request: Request): Promise<{ item: EntryLite }> {
    return {
      item: await EntryRequestHandler.getByIdLite(request.params.id),
    };
  }

  @Post(
    '/:templateId',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async add(
    ...data: ControllerMethodData<JWTApiSecurityPreRequestHandlerOutput>
  ): Promise<{ item: Entry | FSEntry }> {
    return {
      item: await EntryRequestHandler.add(
        data[0].body,
        data[0].headers.sid as string,
        data[3].type === 'jwt' ? (data[3].value as JWT<UserCustomPool>).payload.userId : '',
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
  async update(request: Request): Promise<{ item: Entry | FSEntry }> {
    return {
      item: await EntryRequestHandler.update(
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
