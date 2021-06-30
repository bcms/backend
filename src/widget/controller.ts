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
import { useBcmsPropHandler } from '../prop/handler';
import { useResponseCode } from '../response-code';
import type {
  BCMSPropHandler,
  BCMSUserCustomPool,
  ResponseCode,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsWidgetFactory } from './factory';
import { useBcmsWidgetRepository } from './repository';
import {
  BCMSWidgetCreateData,
  BCMSWidgetCreateDataSchema,
  BCMSWidgetFactory,
  BCMSWidgetRepository,
  BCMSWidgetUpdateData,
  BCMSWidgetUpdateDataSchema,
} from './types';

interface Setup {
  widRepo: BCMSWidgetRepository;
  widFactory: BCMSWidgetFactory;
  resCode: ResponseCode;
  stringUtil: StringUtility;
  propHandler: BCMSPropHandler;
}

export const BCMSWidgetController = createController<Setup>({
  name: 'Widget controller',
  path: '/api/widget',
  setup() {
    return {
      widRepo: useBcmsWidgetRepository(),
      widFactory: useBcmsWidgetFactory(),
      resCode: useResponseCode(),
      stringUtil: useStringUtility(),
      propHandler: useBcmsPropHandler(),
    };
  },
  methods({ widRepo, widFactory, resCode, stringUtil, propHandler }) {
    return {
      whereIsItUsed: createControllerMethod({
        path: '/:id/where-is-it-used',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          // TODO: add logic

          return {
            entries: [],
          };
        },
      }),

      getAdd: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await widRepo.findAll(),
          };
        },
      }),

      getMany: createControllerMethod({
        path: '/many/:ids',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = request.params.ids.split('-');
          return {
            items: await widRepo.findAllById(ids),
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
            count: await widRepo.count(),
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
          const widget = await widRepo.findById(id);
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('wid001', { id }),
            );
          }

          return {
            item: widget,
          };
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSWidgetCreateData
        >({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSWidgetCreateDataSchema,
        }),
        async handler({ body, errorHandler }) {
          const widget = widFactory.create({
            desc: body.desc,
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            previewImage: body.previewImage,
            previewScript: body.previewScript,
            previewStyle: body.previewStyle,
          });
          if (await widRepo.methods.findByName(widget.name)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('wid002', { name: widget.name }),
            );
          }
          const addedWidget = await widRepo.add(widget as never);
          if (!addedWidget) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('wid003'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            item: widget,
          };
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSWidgetUpdateData
        >({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSWidgetUpdateDataSchema,
        }),
        async handler({ body, errorHandler }) {
          const id = body._id;
          const widget = await widRepo.findById(id);
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('wid001', { id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && body.label !== widget.label) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (widget.name !== name) {
              if (await widRepo.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('wid002', { name: widget.name }),
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
            const changes = await propHandler.applyPropChanges(
              widget.props,
              body.propChanges,
              'widget.props',
              true,
            );
            if (changes instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g009', {
                  msg: changes.message,
                }),
              );
            }
            widget.props = changes;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('g003'),
            );
          }
          const hasInfiniteLoop = await propHandler.testInfiniteLoop(
            widget.props,
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
            widget.props,
            widget.props,
            'widget.props',
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
          const updatedWidget = await widRepo.update(widget as never);
          if (!updatedWidget) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('wid005'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            item: widget,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const widget = await widRepo.findById(id);
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('wid001', { id }),
            );
          }
          const deleteResult = await widRepo.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('wid006'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
