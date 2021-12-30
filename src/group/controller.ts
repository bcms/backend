import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
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
  methods() {
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
            items: await BCMSGroupRequestHandler.getAllLite(),
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
          return {
            items: await BCMSGroupRequestHandler.getMany(ids),
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
            count: await BCMSGroupRequestHandler.count(),
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
          const group = await BCMSGroupRequestHandler.getById({
            id: request.params.id,
            errorHandler,
          });
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
          return {
            item: await BCMSGroupRequestHandler.update({
              accessToken,
              errorHandler,
              body,
            }),
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
          await BCMSGroupRequestHandler.delete({
            accessToken,
            errorHandler,
            id: request.params._id,
            logger,
            name,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
