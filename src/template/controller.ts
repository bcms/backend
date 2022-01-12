import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import {
  BCMSApiKey,
  BCMSUserCustomPool,
  BCMSTemplateCreateData,
  BCMSTemplateCreateDataSchema,
  BCMSTemplateUpdateData,
  BCMSTemplateUpdateDataSchema,
  BCMSSocketEventType,
  BCMSTemplate,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSFactory } from '@bcms/factory';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSTemplateRequestHandler } from './request-handler';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSTemplateController = createController<Setup>({
  name: 'Template controller',
  path: '/api/template',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods({ stringUtil }) {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplate[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTemplateRequestHandler.getAll(),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplate[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSTemplateRequestHandler.getMany(ids),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSRepo.template.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTemplate }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const template =
            id.length === 24
              ? await BCMSRepo.template.findById(id)
              : await BCMSRepo.template.methods.findByCid(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id }),
            );
          }
          return {
            item: template,
          };
        },
      }),

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateCreateData>,
        { item: BCMSTemplate }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTemplateCreateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          let idc = await BCMSRepo.idc.methods.findAndIncByForId('templates');
          if (!idc) {
            const templateIdc = BCMSFactory.idc.create({
              count: 2,
              forId: 'templates',
              name: 'Templates',
            });
            const addIdcResult = await BCMSRepo.idc.add(templateIdc);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const template = BCMSFactory.template.create({
            cid: idc.toString(16),
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            desc: body.desc,
            singleEntry: body.singleEntry,
            userId: accessToken.payload.userId,
          });
          const templateWithSameName =
            await BCMSRepo.template.methods.findByName(template.name);
          if (templateWithSameName) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('tmp002', { name: template.name }),
            );
          }
          const addedTemplate = await BCMSRepo.template.add(template);
          if (!addedTemplate) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tmp003'),
            );
          }
          await BCMSSocketManager.emit.template({
            templateId: addedTemplate._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('templates');
          return {
            item: addedTemplate,
          };
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateUpdateData>,
        { item: BCMSTemplate }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTemplateUpdateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          const id = body._id;
          const template = await BCMSRepo.template.findById(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id }),
            );
          }
          let changeDetected = false;
          if (
            typeof body.label !== 'undefined' &&
            body.label !== template.label
          ) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (template.name !== name) {
              if (await BCMSRepo.template.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  bcmsResCode('tmp002', { name: template.name }),
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
                    bcmsResCode('tmp009', {
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
                    bcmsResCode('tmp009', {
                      name: change.update.label,
                    }),
                  );
                }
              } else if (change.remove) {
                if (change.remove === 'title' || change.remove === 'slug') {
                  throw errorHandler.occurred(
                    HTTPStatus.FORBIDDEN,
                    bcmsResCode('tmp009', {
                      name: change.remove,
                    }),
                  );
                }
              }
            }
            changeDetected = true;
            const result = await BCMSPropHandler.applyPropChanges(
              template.props,
              body.propChanges,
            );
            if (result instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('g009', {
                  msg: result.message,
                }),
              );
            }
            template.props = result;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          const hasInfiniteLoop = await BCMSPropHandler.testInfiniteLoop(
            template.props,
          );
          if (hasInfiniteLoop instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g008', {
                msg: hasInfiniteLoop.message,
              }),
            );
          }
          const checkProps = await BCMSPropHandler.propsChecker(
            template.props,
            template.props,
            'template.props',
            true,
          );
          if (checkProps instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g007', {
                msg: checkProps.message,
              }),
            );
          }
          const updatedTemplate = await BCMSRepo.template.update(template);
          if (!updatedTemplate) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tmp005'),
            );
          }
          await BCMSSocketManager.emit.template({
            templateId: updatedTemplate._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('templates');
          return {
            item: updatedTemplate,
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, logger, name, accessToken }) {
          const id = request.params.id;
          const template = await BCMSRepo.template.findById(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id }),
            );
          }
          const deleteResult = await BCMSRepo.template.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tmp006'),
            );
          }
          await BCMSRepo.entry.methods.deleteAllByTemplateId(id);
          const errors = await BCMSPropHandler.removeEntryPointer({
            templateId: id,
          });
          if (errors) {
            logger.error(name, errors);
          }

          const keys = await BCMSRepo.apiKey.findAll();
          const updateKeys: BCMSApiKey[] = [];
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.access.templates.find((e) => e._id === template._id)) {
              key.access.templates = key.access.templates.filter(
                (e) => e._id !== template._id,
              );
              updateKeys.push(key);
            }
          }
          for (let i = 0; i < updateKeys.length; i++) {
            const key = updateKeys[i];
            await BCMSRepo.apiKey.update(key);
            await BCMSSocketManager.emit.apiKey({
              apiKeyId: key._id,
              type: BCMSSocketEventType.UPDATE,
              userIds: 'all',
            });
          }
          await BCMSSocketManager.emit.template({
            templateId: template._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('templates');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
