import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  HttpErrorFactory,
  HttpStatus,
  Post,
  Delete,
  Put,
  RoleName,
  PermissionName,
  ControllerMethodData,
  JWT,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { Media, FSMedia, MediaType } from './models';
import { MediaRequestHandler } from './request-handler';
import { MediaAggregate } from './interfaces';
import { ResponseCode } from '../response-code';
import { MediaUtil } from '../util';
import { JWTApiSecurity, JWTSecurity } from '../security';

@Controller('/api/media')
export class MediaController implements ControllerPrototype {
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
  async getAll(): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getAll(),
    };
  }

  @Get(
    '/all/aggregate',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllAggregated(): Promise<{ media: MediaAggregate[] }> {
    return {
      media: await MediaRequestHandler.getAllAggregated(),
    };
  }

  @Get(
    '/all/parent/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAllByParentId(
    request: Request,
  ): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getAllByParentId(request.params.id),
    };
  }

  @Get(
    '/many/:ids',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getMany(request: Request): Promise<{ media: Array<Media | FSMedia> }> {
    return {
      media: await MediaRequestHandler.getMany(request.params.ids),
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
      count: await MediaRequestHandler.count(),
    };
  }

  @Get(
    '/:id',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getById(request: Request): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.getById(request.params.id),
    };
  }

  @Get(
    '/:id/aggregate',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getByIdAggregated(
    request: Request,
  ): Promise<{ media: MediaAggregate }> {
    return {
      media: await MediaRequestHandler.getByIdAggregated(request.params.id),
    };
  }

  @Get(
    '/:id/bin',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getBinary(request: Request) {
    const error = HttpErrorFactory.instance('getBinary', this.logger);
    const media = await MediaRequestHandler.getById(request.params.id);
    if (media.type === MediaType.DIR) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('mda007', { id: request.params.id }),
      );
    }
    if ((await MediaUtil.fs.exist(media)) === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda008', { id: request.params.id }),
      );
    }
    return { __file: await MediaUtil.fs.getPath(media) };
  }

  @Get(
    '/:id/bin/:size',
    JWTApiSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getBinaryBySize(request: Request) {
    const error = HttpErrorFactory.instance('getBinary', this.logger);
    const media = await MediaRequestHandler.getById(request.params.id);
    if (media.type === MediaType.DIR) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('mda007', { id: request.params.id }),
      );
    }
    if ((await MediaUtil.fs.exist(media)) === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda008', { id: request.params.id }),
      );
    }
    // return await MediaUtil.fs.get(media, request.params.size as any);
    // response.sendFile(
    //   await MediaUtil.fs.getPath(media, request.params.size as any),
    // );
    return {
      __file: await MediaUtil.fs.getPath(
        media,
        request.params.size ? 'small' : undefined,
      ),
    };
  }

  @Post(
    '/file',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async addFile(
    ...data: ControllerMethodData<JWT>
  ): Promise<{ media: Media | FSMedia }> {
    this.logger.warn('addFile', data[0].headers.upload_file_error_message);
    return {
      media: await MediaRequestHandler.addFile(
        data[3],
        data[0].headers.sid as string,
        data[0].query.parentId ? '' + data[0].query.parentId : undefined,
        data[0].file,
      ),
    };
  }

  @Post(
    '/dir',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async addDir(
    ...data: ControllerMethodData<JWT>
  ): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.addDir(
        data[3],
        data[0].body,
        data[0].headers.sid as string,
      ),
    };
  }

  @Put(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.WRITE,
    ),
  )
  async update(request: Request): Promise<{ media: Media | FSMedia }> {
    return {
      media: await MediaRequestHandler.update(
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete(
    '/:id',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.DELETE,
    ),
  )
  async deleteById(request: Request): Promise<{ message: string }> {
    await MediaRequestHandler.deleteById(
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
