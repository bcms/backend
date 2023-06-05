import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
  BCMSGroup,
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSGroupLite,
  BCMSRouteProtectionJwtResult,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { BCMSGroupRequestHandler } from './request-handler';
import { bcmsCreateDocObject } from '@bcms/doc';

export interface BCMSGroupWhereIsItUsedResponse {
  groupIds: Array<{ _id: string; cid: string }>;
  templateIds: Array<{ _id: string; cid: string }>;
  widgetIds: Array<{ _id: string; cid: string }>;
}
export const BCMSGroupWhereIsItUsedResponseSchema: ObjectSchema = {
  groupIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        _id: {
          __type: 'string',
          __required: true,
        },
        cid: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
  templateIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        _id: {
          __type: 'string',
          __required: true,
        },
        cid: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
  widgetIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        _id: {
          __type: 'string',
          __required: true,
        },
        cid: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};

export const BCMSGroupController = createController({
  name: 'Group controller',
  path: '/api/group',
  methods() {
    return {
      whereIsItUsed: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        BCMSGroupWhereIsItUsedResponse
      >({
        path: '/:id/where-is-it-used',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get information where specified group is used.',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              type: 'path',
              required: true,
              description: 'Group ID',
            },
          ],
          response: {
            json: 'BCMSGroupWhereIsItUsedResponse',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { items: BCMSGroup[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all groups',
          security: ['AccessToken'],
          response: {
            json: 'BCMSGroupItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { items: BCMSGroupLite[] }
      >({
        path: '/all/lite',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all lite model groups',
          security: ['AccessToken'],
          response: {
            json: 'BCMSGroupLiteItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { items: BCMSGroup[] }
      >({
        path: '/many',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get specified groups',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Ids',
              type: 'header',
              required: true,
            },
          ],
          response: {
            json: 'BCMSGroupItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get group number',
          security: ['AccessToken'],
          response: {
            jsonSchema: {
              count: {
                __type: 'number',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { item: BCMSGroup }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get group by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'Group ID',
            },
          ],
          response: {
            json: 'BCMSGroupItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSGroupAddData>,
        { item: BCMSGroup }
      >({
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Create a group',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Connection socket ID',
            },
          ],
          response: {
            json: 'BCMSGroupItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupAddDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSGroupRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSGroupUpdateData>,
        { item: BCMSGroup }
      >({
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Update an existing group',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Connection socket ID',
            },
          ],
          response: {
            json: 'BCMSGroupItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSGroupRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      delete: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        doc: bcmsCreateDocObject({
          summary: 'Delete an existing group',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'Group ID',
            },
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Connection socket ID',
            },
          ],
          response: {
            jsonSchema: {
              message: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, logger, name, accessToken }) {
          await BCMSGroupRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            accessToken,
            errorHandler,
            id: request.params.id,
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
