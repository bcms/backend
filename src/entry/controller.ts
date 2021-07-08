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
import { useBcmsLanguageRepository } from '../language';
import { useBcmsPropHandler } from '../prop';
import { useResponseCode } from '../response-code';
import { useBcmsStatusRepository } from '../status';
import { useBcmsTemplateRepository } from '../template';
import type {
  BCMSLanguageRepository,
  BCMSPropHandler,
  BCMSStatusRepository,
  BCMSTemplateRepository,
  BCMSUserCustomPool,
  ResponseCode,
} from '../types';
import { createJwtApiProtectionPreRequestHandler } from '../util';
import { useBcmsEntryFactory } from './factory';
import { useBcmsEntryParser } from './parser';
import { useBcmsEntryRepository } from './repository';
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
} from './types';

interface Setup {
  entryRepo: BCMSEntryRepository;
  entryFactory: BCMSEntryFactory;
  resCode: ResponseCode;
  tempRepo: BCMSTemplateRepository;
  entryParser: BCMSEntryParser;
  objectUtil: ObjectUtility;
  langRepo: BCMSLanguageRepository;
  propHandler: BCMSPropHandler;
  statusRepo: BCMSStatusRepository;
}

export const BCMSEntryController = createController<Setup>({
  name: 'Entry controller',
  path: '/api/entry',
  setup() {
    return {
      entryRepo: useBcmsEntryRepository(),
      entryFactory: useBcmsEntryFactory(),
      resCode: useResponseCode(),
      tempRepo: useBcmsTemplateRepository(),
      entryParser: useBcmsEntryParser(),
      objectUtil: useObjectUtility(),
      langRepo: useBcmsLanguageRepository(),
      propHandler: useBcmsPropHandler(),
      statusRepo: useBcmsStatusRepository(),
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
  }) {
    return {
      getManyLiteById: createControllerMethod({
        path: '/many/lite/:eids',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = request.params.eids.split('-');
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
        // preRequestHandler: createJwtApiProtectionPreRequestHandler({
        //   roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
        //   permissionName: JWTPermissionName.READ,
        // }),
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
        async handler() {
          // TODO: add logic
          return {
            items: [],
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
          const eid = request.params.eid;
          const entry = await entryRepo.findById(eid);
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('etr001', { eid }),
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
          const entry = entryFactory.create({
            templateId: `${template._id}`,
            userId: token ? token.payload.userId : `key_${key?._id}`,
            status: status ? `${status._id}` : undefined,
            meta: meta,
          });
          const addedEntry = await entryRepo.add(entry as never);
          if (!addedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('etr004'),
            );
          }
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
        async handler({ request, errorHandler, token, key }) {
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
          const entry = entryFactory.create({
            templateId: `${template._id}`,
            userId: token ? token.payload.userId : `key_${key?._id}`,
            status: status ? `${status._id}` : undefined,
            meta: meta,
          });
          const addedEntry = await entryRepo.add(entry as never);
          if (!addedEntry) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('etr004'),
            );
          }
          return {
            item: addedEntry,
          };
        },
      }),
    };
  },
});
