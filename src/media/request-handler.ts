import * as crypto from 'crypto';
import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  RoleName,
  JWTSecurity,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  StringUtility,
} from '@becomes/purple-cheetah';
import { Media, FSMedia, MediaType } from './models';
import { ResponseCode } from '../response-code';
import { ApiKeyRequestObject, ApiKeySecurity } from '../api';
import { CacheControl } from '../cache';
import { MediaAggregate } from './interfaces';
import { MediaFactory } from './factories';
import { MediaUtil } from 'src/util';

export class MediaRequestHandler {
  @CreateLogger(MediaRequestHandler)
  private static logger: Logger;

  static async getAll(
    authorization: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Array<Media | FSMedia>> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
    if (apiRequest) {
      try {
        ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
    }
    return await CacheControl.media.findAll();
  }

  static async getAllAggregated(
    authorization: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<MediaAggregate[]> {
    const error = HttpErrorFactory.instance('getAllAggregated', this.logger);
    if (apiRequest) {
      try {
        ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
    }
    return MediaFactory.aggregateFromRoot(await CacheControl.media.findAll());
  }

  static async getById(
    authorization: string,
    mediaId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Media | FSMedia> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(mediaId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: mediaId }),
      );
    }
    if (apiRequest) {
      try {
        ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
    }
    const media = await CacheControl.media.findById(mediaId);
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id: mediaId }),
      );
    }
    return media;
  }

  static async getByIdAggregated(
    authorization: string,
    mediaId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<MediaAggregate> {
    const error = HttpErrorFactory.instance('getByIdAggregated', this.logger);
    if (StringUtility.isIdValid(mediaId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: mediaId }),
      );
    }
    if (apiRequest) {
      try {
        ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
    }
    const media = await CacheControl.media.findById(mediaId);
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id: mediaId }),
      );
    }
    if (media.type !== MediaType.DIR) {
      return {
        _id:
          typeof media._id === 'string' ? media._id : media._id.toHexString(),
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
        isInRoot: media.isInRoot,
        mimetype: media.mimetype,
        name: media.name,
        path: media.path,
        size: media.size,
        state: false,
        type: media.type,
        userId: media.userId,
      };
    }
    return MediaFactory.aggregateParent(
      media,
      await CacheControl.media.findAll(),
    );
  }

  static async getBinary(
    authorization: string,
    mediaId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Buffer> {
    const error = HttpErrorFactory.instance('getBinary', this.logger);
    if (StringUtility.isIdValid(mediaId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: mediaId }),
      );
    }
    if (apiRequest) {
      try {
        ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
        permission: PermissionName.READ,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
    }
    const media = await CacheControl.media.findById(mediaId);
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id: mediaId }),
      );
    }
    if (media.type === MediaType.DIR) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('mda007', { id: mediaId }),
      );
    }
    if ((await MediaUtil.fs.exist(media)) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('mda008', { id: mediaId }),
      );
    }
    return await MediaUtil.fs.get(media);
  }

  static async addFile(
    authorization: string,
    parentId?: string,
    file?: Express.Multer.File,
  ): Promise<Media | FSMedia> {
    const error = HttpErrorFactory.instance('addFile', this.logger);
    if (parentId && StringUtility.isIdValid(parentId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('mda010', { id: parentId }),
      );
    }
    if (!file) {
      throw error.occurred(HttpStatus.BAD_REQUEST, ResponseCode.get('mda009'));
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.WRITE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    let parent: Media | FSMedia;
    if (parentId) {
      parent = await CacheControl.media.findById(parentId);
      if (!parent) {
        throw error.occurred(
          HttpStatus.NOT_FOUNT,
          ResponseCode.get('mda001', { id: parentId }),
        );
      }
    }
    const media = MediaFactory.instance;
    media.userId = jwt.payload.userId;
    media.type = MediaUtil.mimetypeToMediaType(file.mimetype);
    media.mimetype = file.mimetype;
    media.size = file.size;
    media.name = file.originalname;
    media.path = parent ? parent.path : '/';
    media.isInRoot = parent ? true : false;
    media.hasChildren = false;
    media.parentId = parentId ? parentId : '';
    if (await CacheControl.media.findByNameAndPath(media.name, media.path)) {
      media.name += crypto.randomBytes(6).toString('hex');
    }
  }
}
