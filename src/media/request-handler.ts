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
import { MediaAggregate, AddMediaDirData } from './interfaces';
import { MediaFactory } from './factories';
import { MediaUtil } from '../util';

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

  static async getAllByParentId(
    authorization: string,
    id: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Array<Media | FSMedia>> {
    const error = HttpErrorFactory.instance('getAllByParentId', this.logger);
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
    return await CacheControl.media.findAllByParentId(id);
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
  ): Promise<{ bin: Buffer; path: string }> {
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
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda008', { id: mediaId }),
      );
    }
    return {
      bin: await MediaUtil.fs.get(media),
      path: MediaUtil.fs.getPath(media),
    };
  }

  static async count(authorization: string): Promise<number> {
    const error = HttpErrorFactory.instance('count', this.logger);
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
    return await CacheControl.media.count();
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
    // const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
    //   roles: [RoleName.ADMIN],
    //   permission: PermissionName.WRITE,
    //   JWTConfig: JWTConfigService.get('user-token-config'),
    // });
    // if (jwt instanceof Error) {
    //   throw error.occurred(
    //     HttpStatus.UNAUTHORIZED,
    //     ResponseCode.get('g001', {
    //       msg: jwt.message,
    //     }),
    //   );
    // }
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
    const fileNameParts = file.originalname.split('.');
    const fileName =
      fileNameParts.length > 1
        ? fileNameParts[fileNameParts.length - 2]
        : fileNameParts[0];
    const fileExt =
      fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
    const media = MediaFactory.instance;
    media.userId = ''; //jwt.payload.userId;
    media.type = MediaUtil.mimetypeToMediaType(file.mimetype);
    media.mimetype = file.mimetype;
    media.size = file.size;
    media.name =
      StringUtility.createSlug(fileName) +
      '.' +
      StringUtility.createSlug(fileExt);
    media.path = parent ? parent.path : '/';
    media.isInRoot = parent ? false : true;
    media.hasChildren = false;
    media.parentId = parentId ? parentId : '';
    if (await CacheControl.media.findByNameAndPath(media.name, media.path)) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
    }
    await MediaUtil.fs.save(media, file.buffer);
    const addResult = await CacheControl.media.add(media);
    if (addResult === false) {
      await MediaUtil.fs.removeFile(media);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda003'),
      );
    }
    return media;
  }

  static async addDir(
    authorization: string,
    data: AddMediaDirData,
  ): Promise<Media | FSMedia> {
    const error = HttpErrorFactory.instance('addDir', this.logger);
    if (data.parentId && StringUtility.isIdValid(data.parentId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('mda010', { id: data.parentId }),
      );
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
    if (data.parentId) {
      parent = await CacheControl.media.findById(data.parentId);
      if (!parent) {
        throw error.occurred(
          HttpStatus.NOT_FOUNT,
          ResponseCode.get('mda001', { id: data.parentId }),
        );
      }
    }
    data.name = StringUtility.createSlug(data.name);
    const media = MediaFactory.instance;
    media.userId = jwt.payload.userId;
    media.type = MediaType.DIR;
    media.mimetype = 'dir';
    media.name = data.name;
    media.path = parent ? parent.path + '/' + data.name : '/' + data.name;
    media.isInRoot = parent ? false : true;
    media.hasChildren = true;
    if (await CacheControl.media.findByNameAndPath(media.name, media.path)) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
    }
    const addResult = await CacheControl.media.add(media);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda003'),
      );
    }
    return media;
  }

  // TODO: Add update method.
  // static async update(
  //   authorization: string,
  //   data: UpdateMediaData,
  // ): Promise<Media | FSMedia> {
  //   const error = HttpErrorFactory.instance('update', this.logger);
  //   try {
  //     ObjectUtility.compareWithSchema(data, UpdateMediaDataSchema, 'data');
  //   } catch (e) {
  //     throw error.occurred(
  //       HttpStatus.BAD_REQUEST,
  //       ResponseCode.get('g002', {
  //         msg: e.message,
  //       }),
  //     );
  //   }
  //   if (StringUtility.isIdValid(data._id) === false) {
  //     throw error.occurred(
  //       HttpStatus.BAD_REQUEST,
  //       ResponseCode.get('mda010', { id: data._id }),
  //     );
  //   }
  //   const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
  //     roles: [RoleName.ADMIN],
  //     permission: PermissionName.WRITE,
  //     JWTConfig: JWTConfigService.get('user-token-config'),
  //   });
  //   if (jwt instanceof Error) {
  //     throw error.occurred(
  //       HttpStatus.UNAUTHORIZED,
  //       ResponseCode.get('g001', {
  //         msg: jwt.message,
  //       }),
  //     );
  //   }
  //   const media = await CacheControl.media.findById(data._id);

  // }

  static async deleteById(authorization: string, id: string) {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.DELETE,
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
    const media = await CacheControl.media.findById(id);
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id }),
      );
    }
    const deleteResult = await CacheControl.media.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda006'),
      );
    }
  }
}
