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
import { useBcmsPropHandler } from '../prop';
import { useResponseCode } from '../response-code';
import {
  BCMSProp,
  BCMSPropGroupPointerData,
  BCMSPropHandler,
  BCMSPropType,
  BCMSUserCustomPool,
  ResponseCode,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsGroupFactory } from './factory';
import { useBcmsGroupRepository } from './repository';
import {
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupFactory,
  BCMSGroupRepository,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
} from './types';

interface Setup {
  groupRepo: BCMSGroupRepository;
  groupFactory: BCMSGroupFactory;
  resCode: ResponseCode;
  stringUtil: StringUtility;
  propHandler: BCMSPropHandler;
  search(targetGroupId: string, props: BCMSProp[]): Promise<boolean>;
}

export const BCMSGroupController = createController<Setup>({
  name: 'Group controller',
  path: '/api/group',
  setup() {
    const groupRepo = useBcmsGroupRepository();
    return {
      groupRepo,
      groupFactory: useBcmsGroupFactory(),
      resCode: useResponseCode(),
      stringUtil: useStringUtility(),
      propHandler: useBcmsPropHandler(),
      async search(targetGroupId, props) {
        for (const i in props) {
          const prop = props[i];
          if (prop.type === BCMSPropType.GROUP_POINTER) {
            const data = prop.defaultData as BCMSPropGroupPointerData;
            if (data._id === targetGroupId) {
              return true;
            } else {
              const g = await groupRepo.findById(data._id);
              if (g) {
                return this.search(targetGroupId, g.props);
              }
            }
          }
        }
        return false;
      },
    };
  },
  methods({
    groupFactory,
    groupRepo,
    resCode,
    search,
    stringUtil,
    propHandler,
  }) {
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
          const output: {
            templateIds: string[];
            groupIds: string[];
            widgetIds: string[];
          } = {
            groupIds: [],
            templateIds: [],
            widgetIds: [],
          };
          const group = await groupRepo.findById(id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id }),
            );
          }

          const groups = await groupRepo.findAll();
          for (const i in groups) {
            const g = groups[i];
            if (await search(`${group._id}`, g.props)) {
              output.groupIds.push(`${g._id}`);
            }
          }
          // TODO: search Templates
          // TODO: search Widgets

          return output;
        },
      }),

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
            items: await groupRepo.findAll(),
          };
        },
      }),

      getAllLite: createControllerMethod({
        path: '/all/lite',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: (await groupRepo.findAll()).map((e) =>
              groupFactory.toLite(e),
            ),
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
            items: await groupRepo.findAllById(ids),
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
            count: await groupRepo.count(),
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
          const group = await groupRepo.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: request.params.id }),
            );
          }
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSGroupAddData
        >({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSGroupAddDataSchema,
        }),
        async handler({ errorHandler, body }) {
          const group = groupFactory.create({
            desc: body.desc,
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
          });
          if (await groupRepo.methods.findByName(group.name)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('grp002', { name: group.name }),
            );
          }
          const addedGroup = await groupRepo.add(group as never);
          if (!addedGroup) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('grp003'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            item: addedGroup,
          };
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSGroupUpdateData
        >({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSGroupUpdateDataSchema,
        }),
        async handler({ request, errorHandler, body }) {
          const group = await groupRepo.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: request.params.id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label !== 'undefined' && body.label !== group.label) {
            const name = stringUtil.toSlugUnderscore(body.label);
            if (group.name !== name) {
              if (await groupRepo.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('grp002', { name: group.name }),
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
            const updatedProps = await propHandler.applyPropChanges(
              group.props,
              body.propChanges,
              `(group: ${group.name}).props`,
              true,
            );
            if (updatedProps instanceof Error) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g009', {
                  msg: updatedProps.message,
                }),
              );
            }
            group.props = updatedProps;
          }

          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('g003'),
            );
          }

          const infiniteLoopResult = await propHandler.testInfiniteLoop(
            group.props,
            {
              group: [
                {
                  _id: `${group._id}`,
                  label: group.label,
                },
              ],
            },
          );
          if (infiniteLoopResult instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g008', {
                msg: infiniteLoopResult.message,
              }),
            );
          }
          const checkPropsResult = await propHandler.propsChecker(
            group.props,
            group.props,
            'group.props',
            true,
          );
          if (checkPropsResult instanceof Error) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g007', {
                msg: checkPropsResult.message,
              }),
            );
          }
          const updatedGroup = await groupRepo.update(group as never);
          if (!updatedGroup) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('grp005'),
            );
          }

          // TODO: Do props update?
          // TODO: trigger socket event and event manager

          return {
            item: updatedGroup,
          };
        },
      }),

      delete: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler }) {
          const group = await groupRepo.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: request.params.id }),
            );
          }
          const deleteResult = await groupRepo.deleteById(request.params.id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('grp006'),
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
