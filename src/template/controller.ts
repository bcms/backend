import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import { useBcmsApiKeyRepository } from '../api';
import {
  useBcmsIdCounterFactory,
  useBcmsIdCounterRepository,
} from '../id-counter';
import { useBcmsPropHandler } from '../prop';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsTemplateFactory } from './factory';
import { useBcmsTemplateRepository } from './repository';
import {
  BCMSApiKey,
  BCMSApiKeyRepository,
  BCMSPropHandler,
  BCMSUserCustomPool,
  BCMSTemplateCreateData,
  BCMSTemplateCreateDataSchema,
  BCMSTemplateFactory,
  BCMSTemplateRepository,
  BCMSTemplateUpdateData,
  BCMSTemplateUpdateDataSchema,
  BCMSResponseCode,
  BCMSIdCounterRepository,
  BCMSIdCounterFactory,
  BCMSEntryRepository,
} from '../types';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsEntryRepository } from '../entry';

interface Setup {
  entryRepo: BCMSEntryRepository;
  tempRepo: BCMSTemplateRepository;
  tempFactory: BCMSTemplateFactory;
  resCode: BCMSResponseCode;
  apiKeyRepo: BCMSApiKeyRepository;
  stringUtil: StringUtility;
  propHandler: BCMSPropHandler;
  idcRepo: BCMSIdCounterRepository;
  idcFactory: BCMSIdCounterFactory;
}

export const BCMSTemplateController = createController<Setup>({
  name: 'Template controller',
  path: '/api/template',
  setup() {
    return {
      entryRepo: useBcmsEntryRepository(),
      tempRepo: useBcmsTemplateRepository(),
      tempFactory: useBcmsTemplateFactory(),
      resCode: useBcmsResponseCode(),
      apiKeyRepo: useBcmsApiKeyRepository(),
      stringUtil: useStringUtility(),
      propHandler: useBcmsPropHandler(),
      idcRepo: useBcmsIdCounterRepository(),
      idcFactory: useBcmsIdCounterFactory(),
    };
  },
  methods({
    entryRepo,
    tempRepo,
    tempFactory,
    resCode,
    apiKeyRepo,
    stringUtil,
    propHandler,
    idcRepo,
    idcFactory,
  }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await tempRepo.findAll(),
          };
        },
      }),

      getMany: createControllerMethod({
        path: '/many',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await tempRepo.methods.findAllByCid(ids),
          };
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            count: await tempRepo.count(),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const template = await tempRepo.methods.findByCid(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', { id }),
            );
          }
          return {
            item: template,
          };
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSTemplateCreateData>({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSTemplateCreateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken }) {
          let idc = await idcRepo.methods.findAndIncByForId('templates');
          if (!idc) {
            const templateIdc = idcFactory.create({
              count: 2,
              forId: 'templates',
              name: 'Templates',
            });
            const addIdcResult = await idcRepo.add(templateIdc as never);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const template = tempFactory.create({
            cid: idc.toString(16),
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            desc: body.desc,
            singleEntry: body.singleEntry,
            userId: accessToken.payload.userId,
          });
          const templateWithSameName = await tempRepo.methods.findByName(
            template.name,
          );
          if (templateWithSameName) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('tmp002', { name: template.name }),
            );
          }
          const addedTemplate = await tempRepo.add(template as never);
          if (!addedTemplate) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tmp003'),
            );
          }
          // TODO: trigger socket event and event manager

          return {
            item: addedTemplate,
          };
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSTemplateUpdateData>({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSTemplateUpdateDataSchema,
          }),
        async handler({ body, errorHandler }) {
          const id = body._id;
          const template = await tempRepo.findById(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', { id }),
            );
          }
          let changeDetected = false;
          if (
            typeof body.label !== 'undefined' &&
            body.label !== template.label
          ) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (template.name !== name) {
              if (await tempRepo.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('tmp002', { name: template.name }),
                );
              }
            }
            changeDetected = true;
            template.label = body.label;
            template.name = name;
          }
          if (typeof body.desc !== 'undefined' && template.desc !== body.desc) {
            changeDetected = true;
            template.desc = body.desc;
          }
          if (
            typeof body.singleEntry !== 'undefined' &&
            template.singleEntry !== body.singleEntry
          ) {
            changeDetected = true;
            template.singleEntry = body.singleEntry;
          }
          if (
            typeof body.propChanges !== 'undefined' &&
            body.propChanges.length > 0
          ) {
            for (let i = 0; i < body.propChanges.length; i++) {
              const change = body.propChanges[i];
              if (change.add) {
                const name = stringUtil.toSlugUnderscore(change.add.label);
                if (name === 'title' || name === 'slug') {
                  throw errorHandler.occurred(
                    HTTPStatus.FORBIDDEN,
                    resCode.get('tmp009', {
                      name,
                    }),
                  );
                }
              } else if (change.update) {
                if (
                  change.update.label === 'Title' ||
                  change.update.label === 'Slug'
                ) {
                  throw errorHandler.occurred(
                    HTTPStatus.FORBIDDEN,
                    resCode.get('tmp009', {
                      name: change.update.label,
                    }),
                  );
                }
              } else if (change.remove) {
                if (change.remove === 'title' || change.remove === 'slug') {
                  throw errorHandler.occurred(
                    HTTPStatus.FORBIDDEN,
                    resCode.get('tmp009', {
                      name: change.remove,
                    }),
                  );
                }
              }
            }
            changeDetected = true;
            const result = await propHandler.applyPropChanges(
              template.props,
              body.propChanges,
            );
            if (result instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g009', {
                  msg: result.message,
                }),
              );
            }
            template.props = result;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('g003'),
            );
          }
          const hasInfiniteLoop = await propHandler.testInfiniteLoop(
            template.props,
          );
          if (hasInfiniteLoop instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g008', {
                msg: hasInfiniteLoop.message,
              }),
            );
          }
          const checkProps = await propHandler.propsChecker(
            template.props,
            template.props,
            'template.props',
            true,
          );
          if (checkProps instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g007', {
                msg: checkProps.message,
              }),
            );
          }
          const updatedTemplate = await tempRepo.update(template as never);
          if (!updatedTemplate) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tmp005'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            item: updatedTemplate,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler, logger, name }) {
          const id = request.params.id;
          const template = await tempRepo.findById(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tmp001', { id }),
            );
          }
          const deleteResult = await tempRepo.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tmp006'),
            );
          }
          await entryRepo.methods.deleteAllByTemplateId(id);
          const errors = await propHandler.removeEntryPointer({
            templateId: id,
          });
          if (errors) {
            logger.error(name, errors);
          }

          const keys = await apiKeyRepo.findAll();
          const updateKeys: BCMSApiKey[] = [];
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.access.templates.find((e) => e._id === `${template._id}`)) {
              key.access.templates = key.access.templates.filter(
                (e) => e._id !== template._id,
              );
              updateKeys.push(key);
            }
          }
          for (let i = 0; i < updateKeys.length; i++) {
            const key = updateKeys[i];
            await apiKeyRepo.update(key as never);

            // TODO: trigger socket event and event manager for API KEY update
          }
          // TODO: trigger socket event and event manager for Template update

          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
