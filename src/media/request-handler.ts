import * as path from 'path';
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
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { Media, FSMedia, MediaType } from './models';
import { ResponseCode } from '../response-code';
import { ApiKeyRequestObject, ApiKeySecurity } from '../api';
import { CacheControl } from '../cache';
import {
  MediaAggregate,
  AddMediaDirData,
  AddMediaDirDataSchema,
  UpdateMediaData,
  UpdateMediaDataSchema,
} from './interfaces';
import { MediaFactory } from './factories';
import { MediaUtil, SocketUtil, SocketEventName } from '../util';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';
import { Socket } from 'dgram';

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
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
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
    const media = await CacheControl.media.findById(id);
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id }),
      );
    }
    return MediaUtil.getChildren(media);
  }

  static async getMany(
    authorization: string,
    idsString: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Array<Media | FSMedia>> {
    const error = HttpErrorFactory.instance('getMany', this.logger);
    const ids = idsString.split('-');
    for (const i in ids) {
      if (StringUtility.isIdValid(ids[i]) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g004', { id: `( ids[${i}] ): ${ids[i]}` }),
        );
      }
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
    return await CacheControl.media.findAllById(ids);
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
    sid: string,
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
    const fileNameParts = file.originalname.split('.');
    const fileName =
      fileNameParts.length > 1
        ? fileNameParts[fileNameParts.length - 2]
        : fileNameParts[0];
    const fileExt =
      fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
    const media = MediaFactory.instance;
    media.userId = jwt.payload.userId;
    media.type = MediaUtil.mimetypeToMediaType(file.mimetype);
    media.mimetype = file.mimetype;
    media.size = file.size;
    media.name =
      StringUtility.createSlug(fileName) + fileExt
        ? StringUtility.createSlug(fileName) +
          '.' +
          StringUtility.createSlug(fileExt)
        : '';
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
    SocketUtil.emit(SocketEventName.MEDIA, {
      entry: {
        _id: `${media._id}`,
      },
      message: 'Media added.',
      source: sid,
      type: 'add',
    });
    await EventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(media)),
    );
    return media;
  }

  static async addDir(
    authorization: string,
    data: AddMediaDirData,
    sid: string,
  ): Promise<Media | FSMedia> {
    const error = HttpErrorFactory.instance('addDir', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddMediaDirDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
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
    media.parentId = parent ? data.parentId : '';
    media.hasChildren = true;
    if (await CacheControl.media.findByNameAndPath(media.name, media.path)) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
      media.path = parent ? parent.path + '/' + media.name : '/' + media.name;
    }
    const addResult = await CacheControl.media.add(media);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('mda003'),
      );
    }
    await MediaUtil.fs.mkdir(media);
    SocketUtil.emit(SocketEventName.MEDIA, {
      entry: {
        _id: `${media._id}`,
      },
      message: 'Media added.',
      source: sid,
      type: 'add',
    });
    await EventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(media)),
    );
    return media;
  }

  static async update(
    authorization: string,
    data: UpdateMediaData,
    sid: string,
  ): Promise<Media | FSMedia> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateMediaDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    if (StringUtility.isIdValid(data._id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('mda010', { id: data._id }),
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
    const media: Media | FSMedia = JSON.parse(
      JSON.stringify(await CacheControl.media.findById(data._id)),
    );
    if (!media) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('mda001', { id: data._id }),
      );
    }
    const mediaToUpdate: Array<Media | FSMedia> = [];
    const fsChanges: Array<{
      move?: {
        from: string;
        to: string;
      };
      rename?: {
        from: string;
        to: string;
      };
    }> = [];
    if (media.type !== MediaType.DIR) {
      if (data.rename) {
        const currNamePart = media.name.split('.');
        const nameParts = StringUtility.createSlug(data.rename).split('.');
        nameParts.push(currNamePart[currNamePart.length - 1]);
        const oldName = media.name + '';
        media.name = nameParts.join('.');
        if (
          await CacheControl.media.findByNameAndPath(media.name, media.path)
        ) {
          media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
        }
        fsChanges.push({
          rename: {
            from: path.join(media.path, oldName),
            to: path.join(media.path, media.name),
          },
        });
        mediaToUpdate.push(media);
      }
    } else {
      if (data.rename) {
        media.name = StringUtility.createSlug(data.rename);
        if (
          await CacheControl.media.findByNameAndPath(media.name, media.path)
        ) {
          media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
        }
        const oldPath = media.path + '';
        const pathParts = media.path.split('/');
        media.path = [
          ...pathParts.splice(0, pathParts.length - 1),
          media.name,
        ].join('/');
        fsChanges.push({
          rename: {
            from: oldPath,
            to: media.path,
          },
        });
        mediaToUpdate.push(media);
        // tslint:disable-next-line: variable-name
        (await MediaUtil.getChildren(media)).forEach((_child) => {
          const child: Media | FSMedia = JSON.parse(JSON.stringify(_child));
          child.path = child.path.replace(oldPath, media.path);
          mediaToUpdate.push(child);
        });
      }
    }
    for (const i in mediaToUpdate) {
      await CacheControl.media.update(mediaToUpdate[i]);
    }
    for (const i in fsChanges) {
      if (fsChanges[i].rename) {
        await MediaUtil.fs.move(
          fsChanges[i].rename.from,
          fsChanges[i].rename.to,
        );
      }
    }
    SocketUtil.emit(SocketEventName.MEDIA, {
      entry: {
        _id: `${media._id}`,
      },
      message: {
        updated: [
          {
            name: 'media',
            ids: mediaToUpdate.map((e) => {
              return `${e._id}`;
            }),
          },
        ],
      },
      source: sid,
      type: 'update',
    });
    return media;
  }

  static async deleteById(authorization: string, id: string, sid: string) {
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
    let children: string[] = [];
    if (media.type === MediaType.DIR) {
      children = this.getAllChildren(media, await CacheControl.media.findAll());
      for (const i in children) {
        await CacheControl.media.deleteById(children[i]);
      }
      await MediaUtil.fs.removeDir(media);
    } else {
      const deleteResult = await CacheControl.media.deleteById(id);
      if (deleteResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('mda006'),
        );
      }
      await MediaUtil.fs.removeFile(media);
    }
    SocketUtil.emit(SocketEventName.MEDIA, {
      entry: {
        _id: `${media._id}`,
      },
      message: {
        updated: [
          {
            name: 'media',
            ids: children,
          },
        ],
      },
      source: sid,
      type: 'remove',
    });
    await EventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(media)),
    );
  }

  private static getAllChildren(
    media: Media | FSMedia,
    allMedia: Array<Media | FSMedia>,
  ): string[] {
    const ids: string[] = [
      typeof media._id === 'string' ? media._id : media._id.toHexString(),
    ];
    if (media.hasChildren) {
      const children = allMedia.filter((e) => e.parentId === media._id);
      for (const i in children) {
        const child = children[i];
        if (child.hasChildren) {
          this.getAllChildren(child, allMedia).forEach((id) => {
            ids.push(id);
          });
        } else {
          ids.push(
            typeof child._id === 'string' ? child._id : child._id.toHexString(),
          );
        }
      }
    }
    return ids;
  }
}
