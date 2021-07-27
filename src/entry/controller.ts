import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import {
  useBcmsIdCounterFactory,
  useBcmsIdCounterRepository,
} from '../id-counter';
import { useBcmsLanguageRepository } from '../language';
import { useBcmsPropHandler } from '../prop';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsSocketManager } from '../socket';
import { useBcmsStatusRepository } from '../status';
import { useBcmsTemplateRepository } from '../template';
import {
  BCMSEntryCreateData,
  BCMSEntryCreateDataSchema,
  BCMSEntryFactory,
  BCMSEntryMeta,
  BCMSEntryParsed,
  BCMSEntryParser,
  BCMSEntryRepository,
  BCMSEntryUpdateData,
  BCMSEntryUpdateDataSchema,
  BCMSIdCounterFactory,
  BCMSIdCounterRepository,
  BCMSLanguageRepository,
  BCMSPropHandler,
  BCMSResponseCode,
  BCMSSocketEventType,
  BCMSSocketManager,
  BCMSStatusRepository,
  BCMSTemplateRepository,
  BCMSUserCustomPool,
} from '../types';
import { createJwtApiProtectionPreRequestHandler } from '../util';
import { useBcmsEntryFactory } from './factory';
import { useBcmsEntryParser } from './parser';
import { useBcmsEntryRepository } from './repository';

interface Setup {
  entryRepo: BCMSEntryRepository;
  entryFactory: BCMSEntryFactory;
  resCode: BCMSResponseCode;
  tempRepo: BCMSTemplateRepository;
  entryParser: BCMSEntryParser;
  objectUtil: ObjectUtility;
  langRepo: BCMSLanguageRepository;
  propHandler: BCMSPropHandler;
  statusRepo: BCMSStatusRepository;
  idcRepo: BCMSIdCounterRepository;
  idcFactory: BCMSIdCounterFactory;
  socket: BCMSSocketManager;
}

export const BCMSEntryController = createController<Setup>({
  name: 'Entry controller',
  path: '/api/entry',
  setup() {
    return {
      entryRepo: useBcmsEntryRepository(),
      entryFactory: useBcmsEntryFactory(),
      resCode: useBcmsResponseCode(),
      tempRepo: useBcmsTemplateRepository(),
      entryParser: useBcmsEntryParser(),
      objectUtil: useObjectUtility(),
      langRepo: useBcmsLanguageRepository(),
      propHandler: useBcmsPropHandler(),
      statusRepo: useBcmsStatusRepository(),
      idcRepo: useBcmsIdCounterRepository(),
      idcFactory: useBcmsIdCounterFactory(),
      socket: useBcmsSocketManager(),
    };
  },
  methods({
    entryRepo,
    entryFactory,
    resCode,
    tempRepo,
    entryParser,
    objectUtil,
    langRepo,
    propHandler,
    statusRepo,
    idcRepo,
    idcFactory,
    socket,
  }) {
    return {
      getManyLiteById: createControllerMethod({
        path: '/many/lite',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await entryRepo.findAllById(ids),
          };
        },
      }),

      getAllByTemplateId: createControllerMethod({
        path: '/all/:tid',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          return {
            items: await entryRepo.methods.findAllByTemplateId(
              request.params.tid,
            ),
          };
        },
      }),

      getAllByTemplateIdParsed: createControllerMethod({
        path: '/all/:tid/parse',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          const entries = await entryRepo.methods.findAllByTemplateId(
            request.params.tid,
          );
          const entriesParsed: BCMSEntryParsed[] = [];
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const entryParsed = await entryParser.parse({
              entry,
              maxDepth: 1,
              depth: 0,
            });
            if (entryParsed) {
              entriesParsed.push(entryParsed);
            }
          }
          return {
            items: entriesParsed,
          };
        },
      }),

      getAllByTemplateIdLite: createControllerMethod({
        path: '/all/:tid/lite',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          const entries = await entryRepo.methods.findAllByTemplateId(
            request.params.tid,
          );
          return {
            items: entries.map((e) => entryFactory.toLite(e)),
          };
        },
      }),

      countByTemplateId: createControllerMethod({
        path: '/count/:tid',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request }) {
          return {
            count: entryRepo.methods.countByTemplateId(request.params.tid),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:tid/:eid',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const template =
            request.params.tid.length === 24
              ? await tempRepo.findById(request.params.tid)
              : await tempRepo.methods.findByCid(request.params.tid);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', { id: request.params.tid }),
            );
          }
          const entry =
            request.params.eid.length === 24
              ? await entryRepo.methods.findByTemplateIdAndId(
                  `${template._id}`,
                  request.params.eid,
                )
              : await entryRepo.methods.findByTemplateIdAndCid(
                  `${template._id}`,
                  request.params.eid,
                );
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { id: request.params.eid }),
            );
          }
          return {
            item: entry,
          };
        },
      }),

      getByIdParsed: createControllerMethod({
        path: '/:tid/:eid/parse',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const eid = request.params.eid;
          const entry = await entryRepo.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { eid }),
            );
          }
          const template = await tempRepo.findById(entry.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { eid }),
            );
          }
          return {
            item: await entryParser.parse({
              entry,
              maxDepth: 1,
              depth: 0,
            }),
          };
        },
      }),

      getByIdLite: createControllerMethod({
        path: '/:tid/:eid/lite',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler({ request, errorHandler }) {
          const eid = request.params.eid;
          const entry = await entryRepo.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { eid }),
            );
          }
          return {
            item: entryFactory.toLite(entry),
          };
        },
      }),

      create: createControllerMethod({
        path: '/:tid',
        type: 'post',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
        }),
        async handler({ request, errorHandler, token, key }) {
          const checkBody = objectUtil.compareWithSchema(
            request.body,
            BCMSEntryCreateDataSchema,
            'body',
          );
          if (checkBody instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryCreateData;
          const template = await tempRepo.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', {
                id: body.templateId,
              }),
            );
          }

          const meta: BCMSEntryMeta[] = [];
          const langs = await langRepo.findAll();
          const status = body.status
            ? await statusRepo.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await propHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          let idc = await idcRepo.methods.findAndIncByForId('entries');
          if (!idc) {
            const entryIdc = idcFactory.create({
              count: 2,
              forId: 'entries',
              name: 'Entries',
            });
            const addIdcResult = await idcRepo.add(entryIdc as never);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const entry = entryFactory.create({
            cid: idc.toString(16),
            templateId: `${template._id}`,
            userId: token ? token.payload.userId : `key_${key?._id}`,
            status: status ? `${status._id}` : undefined,
            meta: meta,
            content: body.content,
          });
          const addedEntry = await entryRepo.add(entry as never);
          if (!addedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('etr004'),
            );
          }
          await socket.emit.entry({
            entryId: `${addedEntry._id}`,
            templateId: addedEntry.templateId,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: token ? [token.payload.userId] : undefined,
          });
          return {
            item: addedEntry,
          };
        },
      }),

      update: createControllerMethod({
        path: '/:tid',
        type: 'put',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
        }),
        async handler({ request, errorHandler, token }) {
          const checkBody = objectUtil.compareWithSchema(
            request.body,
            BCMSEntryUpdateDataSchema,
            'body',
          );
          if (checkBody instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryUpdateData;
          const template = await tempRepo.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', {
                id: body.templateId,
              }),
            );
          }
          const entry = await entryRepo.findById(body._id);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { id: request.params.eid }),
            );
          }
          const meta: BCMSEntryMeta[] = [];
          const langs = await langRepo.findAll();
          const status = body.status
            ? await statusRepo.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await propHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          entry.status = status ? `${status._id}` : '';
          entry.meta = meta;
          entry.content = body.content;
          const updatedEntry = await entryRepo.update(entry as never);
          if (!updatedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('etr004'),
            );
          }
          await socket.emit.entry({
            entryId: `${updatedEntry._id}`,
            templateId: updatedEntry.templateId,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: token ? [token.payload.userId] : undefined,
          });
          return {
            item: updatedEntry,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:tid/:eid',
        type: 'delete',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.DELETE,
        }),
        async handler({ request, errorHandler, token }) {
          const eid = request.params.eid;
          const entry = await entryRepo.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { eid }),
            );
          }
          const deleteResult = await entryRepo.deleteById(eid);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('etr006'),
            );
          }
          await socket.emit.entry({
            entryId: `${entry._id}`,
            templateId: entry.templateId,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: token ? [token.payload.userId] : undefined,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
