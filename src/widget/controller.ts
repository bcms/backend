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
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSSocketEventType,
  BCMSUserCustomPool,
  BCMSWidget,
  BCMSWidgetCreateData,
  BCMSWidgetCreateDataSchema,
  BCMSWidgetUpdateData,
  BCMSWidgetUpdateDataSchema,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSFactory } from '@bcms/factory';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSTypeConverter } from '@bcms/util/type-converter';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSWidgetController = createController<Setup>({
  name: 'Widget controller',
  path: '/api/widget',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods({ stringUtil }) {
    return {
      whereIsItUsed: createControllerMethod({
        path: '/:id/where-is-it-used',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          let widget: BCMSWidget | null = null;
          if (id.length === 24) {
            widget = await BCMSRepo.widget.findById(id);
          } else {
            widget = await BCMSRepo.widget.methods.findByCid(id);
          }
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('wid001', { id }),
            );
          }
          const entries = await BCMSRepo.entry.methods.findAllByWidgetId(
            widget._id,
          );

          return {
            entryIds: entries.map((e) => {
              return { _id: e._id, cid: e.cid, tid: e.templateId };
            }),
          };
        },
      }),

      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSWidget[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSRepo.widget.findAll(),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSWidget[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          if (ids[0] && ids[0].length === 24) {
            return {
              items: await BCMSRepo.widget.findAllById(ids),
            };
          } else {
            return {
              items: await BCMSRepo.widget.methods.findAllByCid(ids),
            };
          }
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
            count: await BCMSRepo.widget.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSWidget }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          let widget: BCMSWidget | null = null;
          if (id.length === 24) {
            widget = await BCMSRepo.widget.findById(id);
          } else {
            widget = await BCMSRepo.widget.methods.findByCid(id);
          }
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('wid001', { id }),
            );
          }
          return {
            item: widget,
          };
        },
      }),

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSWidgetCreateData>,
        { item: BCMSWidget }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSWidgetCreateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          let idc = await BCMSRepo.idc.methods.findAndIncByForId('widgets');
          if (!idc) {
            const widgetIdc = BCMSFactory.idc.create({
              count: 2,
              forId: 'widgets',
              name: 'Widgets',
            });
            const addIdcResult = await BCMSRepo.idc.add(widgetIdc);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const widget = BCMSFactory.widget.create({
            cid: idc.toString(16),
            desc: body.desc,
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            previewImage: body.previewImage,
            previewScript: body.previewScript,
            previewStyle: body.previewStyle,
          });
          if (await BCMSRepo.widget.methods.findByName(widget.name)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('wid002', { name: widget.name }),
            );
          }
          const addedWidget = await BCMSRepo.widget.add(widget);
          if (!addedWidget) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('wid003'),
            );
          }
          await BCMSSocketManager.emit.widget({
            widgetId: addedWidget._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: widget,
          };
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSWidgetUpdateData>,
        { item: BCMSWidget }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSWidgetUpdateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          const id = body._id;
          const widget = await BCMSRepo.widget.findById(id);
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('wid001', { id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && body.label !== widget.label) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (widget.name !== name) {
              if (await BCMSRepo.widget.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  bcmsResCode('wid002', { name: widget.name }),
                );
              }
            }
            changeDetected = true;
            widget.label = body.label;
            widget.name = name;
          }
          if (typeof body.desc !== 'undefined' && body.desc !== widget.desc) {
            changeDetected = true;
            widget.desc = body.desc;
          }
          if (
            typeof body.previewImage === 'string' &&
            body.previewImage !== widget.previewImage
          ) {
            changeDetected = true;
            widget.previewImage = body.previewImage;
          }
          if (
            typeof body.previewScript === 'string' &&
            body.previewScript !== widget.previewScript
          ) {
            changeDetected = true;
            widget.previewScript = body.previewScript;
          }
          if (
            typeof body.previewStyle === 'string' &&
            body.previewStyle !== widget.previewStyle
          ) {
            changeDetected = true;
            widget.previewStyle = body.previewStyle;
          }
          if (
            typeof body.propChanges !== 'undefined' &&
            body.propChanges.length > 0
          ) {
            changeDetected = true;
            const changes = await BCMSPropHandler.applyPropChanges(
              widget.props,
              body.propChanges,
              'widget.props',
            );
            if (changes instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('g009', {
                  msg: changes.message,
                }),
              );
            }
            widget.props = changes;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          const hasInfiniteLoop = await BCMSPropHandler.testInfiniteLoop(
            widget.props,
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
            widget.props,
            widget.props,
            'widget.props',
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
          const updatedWidget = await BCMSRepo.widget.update(widget);
          if (!updatedWidget) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('wid005'),
            );
          }
          await BCMSSocketManager.emit.widget({
            widgetId: updatedWidget._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: widget,
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
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          const id = request.params.id;
          const widget = await BCMSRepo.widget.findById(id);
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('wid001', { id }),
            );
          }
          const deleteResult = await BCMSRepo.widget.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('wid006'),
            );
          }
          const errors = await BCMSPropHandler.removeWidget({
            widgetId: widget._id,
          });
          if (errors) {
            logger.error(name, errors);
          }
          await BCMSSocketManager.emit.widget({
            widgetId: widget._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
