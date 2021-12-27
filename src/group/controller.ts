import { BCMSFactory } from '@bcms/factory';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
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
import {
  BCMSUserCustomPool,
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
  BCMSGroup,
  BCMSSocketEventType,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSGroupLite,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { BCMSGroupRequestHandler } from './request-handler';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSGroupController = createController<Setup>({
  name: 'Group controller',
  path: '/api/group',
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
          let group: BCMSGroup | null;
          if (id.length === 24) {
            group = await BCMSRepo.group.findById(id);
          } else {
            group = await BCMSRepo.group.methods.findByCid(id);
          }
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('grp001', { id }),
            );
          }

          const groups = await BCMSRepo.group.methods.findAllByPropGroupPointer(
            group._id,
          );
          const templates =
            await BCMSRepo.template.methods.findAllByPropGroupPointer(
              group._id,
            );
          const widgets =
            await BCMSRepo.widget.methods.findAllByPropGroupPointer(group._id);

          return {
            groupIds: groups.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
            templateIds: templates.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
            widgetIds: widgets.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
          };
        },
      }),

      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroup[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSGroupRequestHandler.getAll(),
          };
        },
      }),

      getAllLite: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroupLite[] }
      >({
        path: '/all/lite',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: (await BCMSRepo.group.findAll()).map((e) =>
              BCMSFactory.group.toLite(e),
            ),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroup[] }
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
              items: await BCMSRepo.group.findAllById(ids),
            };
          } else {
            return {
              items: await BCMSRepo.group.methods.findAllByCid(ids),
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
            count: await BCMSRepo.group.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSGroup }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const group = await BCMSRepo.group.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('grp001', { id: request.params.id }),
            );
          }
          return { item: group };
        },
      }),

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSGroupAddData>,
        { item: BCMSGroup }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSGroupAddDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSGroupRequestHandler.create({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSGroupUpdateData>,
        { item: BCMSGroup }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSGroupUpdateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          const group = await BCMSRepo.group.findById(body._id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('grp001', { id: body._id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label !== 'undefined' && body.label !== group.label) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (group.name !== name) {
              if (await BCMSRepo.group.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  bcmsResCode('grp002', { name: group.name }),
                );
              }
            }
            changeDetected = true;
            group.label = body.label;
            group.name = name;
          }
          if (typeof body.desc === 'string' && body.desc !== group.desc) {
            changeDetected = true;
            group.desc = body.desc;
          }
          if (
            typeof body.propChanges !== 'undefined' &&
            body.propChanges.length > 0
          ) {
            changeDetected = true;
            const updatedProps = await BCMSPropHandler.applyPropChanges(
              group.props,
              body.propChanges,
              `(group: ${group.name}).props`,
            );
            if (updatedProps instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('g009', {
                  msg: updatedProps.message,
                }),
              );
            }
            group.props = updatedProps;
          }

          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }

          const infiniteLoopResult = await BCMSPropHandler.testInfiniteLoop(
            group.props,
            {
              group: [
                {
                  _id: group._id,
                  label: group.label,
                },
              ],
            },
          );
          if (infiniteLoopResult instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g008', {
                msg: infiniteLoopResult.message,
              }),
            );
          }
          const checkPropsResult = await BCMSPropHandler.propsChecker(
            group.props,
            group.props,
            'group.props',
            true,
          );
          if (checkPropsResult instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g007', {
                msg: checkPropsResult.message,
              }),
            );
          }
          const updatedGroup = await BCMSRepo.group.update(group);
          if (!updatedGroup) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('grp005'),
            );
          }
          await BCMSSocketManager.emit.group({
            groupId: updatedGroup._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('group');
          return {
            item: updatedGroup,
          };
        },
      }),

      delete: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, logger, name, accessToken }) {
          const group = await BCMSRepo.group.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('grp001', { id: request.params.id }),
            );
          }
          const deleteResult = await BCMSRepo.group.deleteById(
            request.params.id,
          );
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('grp006'),
            );
          }
          const errors = await BCMSPropHandler.removeGroupPointer({
            groupId: group._id,
          });
          if (errors) {
            logger.error(name, errors);
          }
          await BCMSSocketManager.emit.group({
            groupId: group._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('group');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
