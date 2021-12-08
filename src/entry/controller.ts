import { BCMSFactory } from '@bcms/factory';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
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
  BCMSEntryCreateData,
  BCMSEntryCreateDataSchema,
  BCMSEntryMeta,
  BCMSEntryParsed,
  BCMSEntryParser,
  BCMSEntryUpdateData,
  BCMSEntryUpdateDataSchema,
  BCMSSocketEventType,
  BCMSUserCustomPool,
  BCMSTypeConverterResultItem,
} from '../types';
import {
  createJwtApiProtectionPreRequestHandler,
  BCMSTypeConverter,
} from '../util';
import { useBcmsEntryParser } from './parser';

interface Setup {
  entryParser: BCMSEntryParser;
  objectUtil: ObjectUtility;
}

export const BCMSEntryController = createController<Setup>({
  name: 'Entry controller',
  path: '/api/entry',
  setup() {
    return {
      entryParser: useBcmsEntryParser(),
      objectUtil: useObjectUtility(),
    };
  },
  methods({ entryParser, objectUtil }) {
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
            items: await BCMSRepo.entry.findAllById(ids),
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
            items: await BCMSRepo.entry.methods.findAllByTemplateId(
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
          const entries = await BCMSRepo.entry.methods.findAllByTemplateId(
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
          const entries = await BCMSRepo.entry.methods.findAllByTemplateId(
            request.params.tid,
          );
          return {
            items: entries.map((e) => BCMSFactory.entry.toLite(e)),
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
            count: BCMSRepo.entry.methods.countByTemplateId(request.params.tid),
          };
        },
      }),
      typeConverter: createControllerMethod<
        unknown,
        { items: BCMSTypeConverterResultItem[] }
      >({
        path: '/type-convert/:tid/:id/:type',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler, request }) {
          const template =
            request.params.tid.length === 24
              ? await BCMSRepo.template.findById(request.params.tid)
              : await BCMSRepo.template.methods.findByCid(request.params.tid);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: request.params.tid }),
            );
          }
          if (request.params.type === 'typescript') {
            return {
              items: await BCMSTypeConverter.typescript([
                {
                  name: template.name,
                  type: 'entry',
                  props: template.props,
                },
              ]),
            };
          } else {
            return {
              items: [],
            };
          }
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
              ? await BCMSRepo.template.findById(request.params.tid)
              : await BCMSRepo.template.methods.findByCid(request.params.tid);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id: request.params.tid }),
            );
          }
          const entry =
            request.params.eid.length === 24
              ? await BCMSRepo.entry.methods.findByTemplateIdAndId(
                  template._id,
                  request.params.eid,
                )
              : await BCMSRepo.entry.methods.findByTemplateIdAndCid(
                  template._id,
                  request.params.eid,
                );
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: request.params.eid }),
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
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
            );
          }
          const template = await BCMSRepo.template.findById(entry.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
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
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
            );
          }
          return {
            item: BCMSFactory.entry.toLite(entry),
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
              bcmsResCode('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryCreateData;
          const template = await BCMSRepo.template.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', {
                id: body.templateId,
              }),
            );
          }

          const meta: BCMSEntryMeta[] = [];
          const langs = await BCMSRepo.language.findAll();
          const status = body.status
            ? await BCMSRepo.status.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await BCMSPropHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          let idc = await BCMSRepo.idc.methods.findAndIncByForId('entries');
          if (!idc) {
            const entryIdc = BCMSFactory.idc.create({
              count: 2,
              forId: 'entries',
              name: 'Entries',
            });
            const addIdcResult = await BCMSRepo.idc.add(entryIdc);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const entry = BCMSFactory.entry.create({
            cid: idc.toString(16),
            templateId: template._id,
            userId: token
              ? token.payload.userId
              : `key_${key ? key._id : 'unknown'}`,
            status: status ? status._id : undefined,
            meta: meta,
            content: body.content,
          });
          const addedEntry = await BCMSRepo.entry.add(entry);
          if (!addedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr004'),
            );
          }
          await BCMSSocketManager.emit.entry({
            entryId: addedEntry._id,
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
              bcmsResCode('g002', {
                msg: checkBody.message,
              }),
            );
          }
          const body = request.body as BCMSEntryUpdateData;
          const template = await BCMSRepo.template.findById(body.templateId);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', {
                id: body.templateId,
              }),
            );
          }
          const entry = await BCMSRepo.entry.findById(body._id);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { id: request.params.eid }),
            );
          }
          const meta: BCMSEntryMeta[] = [];
          const langs = await BCMSRepo.language.findAll();
          const status = body.status
            ? await BCMSRepo.status.findById(body.status)
            : null;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const langMeta = body.meta.find((e) => e.lng === lang.code);
            if (!langMeta) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr002', {
                  lng: lang.name,
                  prop: 'meta',
                }),
              );
            }
            const metaCheckResult = await BCMSPropHandler.checkPropValues({
              props: template.props,
              values: langMeta.props,
              level: `body.meta[${i}].props`,
            });
            if (metaCheckResult instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('etr003', {
                  error: metaCheckResult.message,
                  prop: 'meta',
                }),
              );
            }
            meta.push(langMeta);
          }
          entry.status = status ? status._id : '';
          entry.meta = meta;
          entry.content = body.content;
          const updatedEntry = await BCMSRepo.entry.update(entry);
          if (!updatedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr004'),
            );
          }
          await BCMSSocketManager.emit.entry({
            entryId: updatedEntry._id,
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
          const entry = await BCMSRepo.entry.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('etr001', { eid }),
            );
          }
          const deleteResult = await BCMSRepo.entry.deleteById(eid);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('etr006'),
            );
          }
          await BCMSSocketManager.emit.entry({
            entryId: entry._id,
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
