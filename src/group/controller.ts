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
import {
  useBcmsIdCounterFactory,
  useBcmsIdCounterRepository,
} from '../id-counter';
import { useBcmsPropHandler } from '../prop';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsTemplateRepository } from '../template';
import {
  BCMSPropHandler,
  BCMSUserCustomPool,
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupFactory,
  BCMSGroupRepository,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
  BCMSResponseCode,
  BCMSIdCounterRepository,
  BCMSIdCounterFactory,
  BCMSTemplateRepository,
  BCMSWidgetRepository,
  BCMSGroup,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsWidgetRepository } from '../widget';
import { useBcmsGroupFactory } from './factory';
import { useBcmsGroupRepository } from './repository';

interface Setup {
  groupRepo: BCMSGroupRepository;
  tempRepo: BCMSTemplateRepository;
  widRepo: BCMSWidgetRepository;
  groupFactory: BCMSGroupFactory;
  resCode: BCMSResponseCode;
  stringUtil: StringUtility;
  propHandler: BCMSPropHandler;
  idcRepo: BCMSIdCounterRepository;
  idcFactory: BCMSIdCounterFactory;
}

export const BCMSGroupController = createController<Setup>({
  name: 'Group controller',
  path: '/api/group',
  setup() {
    const groupRepo = useBcmsGroupRepository();
    return {
      groupRepo,
      tempRepo: useBcmsTemplateRepository(),
      widRepo: useBcmsWidgetRepository(),
      groupFactory: useBcmsGroupFactory(),
      resCode: useBcmsResponseCode(),
      stringUtil: useStringUtility(),
      propHandler: useBcmsPropHandler(),
      idcRepo: useBcmsIdCounterRepository(),
      idcFactory: useBcmsIdCounterFactory(),
    };
  },
  methods({
    groupFactory,
    tempRepo,
    widRepo,
    groupRepo,
    resCode,
    idcRepo,
    idcFactory,
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
          let group: BCMSGroup | null;
          if (id.length === 24) {
            group = await groupRepo.findById(id);
          } else {
            group = await groupRepo.methods.findByCid(id);
          }
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id }),
            );
          }

          const groups = await groupRepo.methods.findAllByPropGroupPointer(
            `${group._id}`,
          );
          const templates = await tempRepo.methods.findAllByPropGroupPointer(
            `${group._id}`,
          );
          const widgets = await widRepo.methods.findAllByPropGroupPointer(
            `${group._id}`,
          );

          return {
            groupIds: groups.map((e) => {
              return { cid: e.cid, _id: `${e._id}` };
            }),
            templateIds: templates.map((e) => {
              return { cid: e.cid, _id: `${e._id}` };
            }),
            widgetIds: widgets.map((e) => {
              return { cid: e.cid, _id: `${e._id}` };
            }),
          };
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
        path: '/many',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          if (ids[0] && ids[0].length === 24) {
            return {
              items: await groupRepo.findAllById(ids),
            };
          } else {
            return {
              items: await groupRepo.methods.findAllByCid(ids),
            };
          }
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
          return { item: group };
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSGroupAddData>({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupAddDataSchema,
          }),
        async handler({ errorHandler, body }) {
          let idc = await idcRepo.methods.findAndIncByForId('groups');
          if (!idc) {
            const groupIdc = idcFactory.create({
              count: 2,
              forId: 'groups',
              name: 'Groups',
            });
            const addIdcResult = await idcRepo.add(groupIdc as never);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          const group = groupFactory.create({
            cid: idc.toString(16),
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
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSGroupUpdateData>({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupUpdateDataSchema,
          }),
        async handler({ errorHandler, body }) {
          const group = await groupRepo.findById(body._id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: body._id }),
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
        async handler({ request, errorHandler, logger, name }) {
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
          const errors = await propHandler.removeGroupPointer({
            groupId: `${group._id}`,
          });
          if (errors) {
            logger.error(name, errors);
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
