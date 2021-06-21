import {
  createController,
  createControllerMethod,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  BCMSGroup,
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupFactory,
  BCMSGroupLite,
  BCMSGroupRepository,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
  JWTProtectionType,
  ResponseCode,
} from '../types';
import { useBcmsGroupRepository } from './repository';
import { useBcmsGroupFactory } from './factory';
import { useResponseCode } from '../response-code';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

interface Setup {
  repo: BCMSGroupRepository;
  groupFactory: BCMSGroupFactory;
  resCode: ResponseCode;
  objectUtil: ObjectUtility;
  stringUtil: StringUtility;
}

export const BCMSGroupController = createController<Setup>({
  name: 'Group controller',
  path: '/api/group',
  setup() {
    return {
      repo: useBcmsGroupRepository(),
      groupFactory: useBcmsGroupFactory(),
      resCode: useResponseCode(),
      objectUtil: useObjectUtility(),
      stringUtil: useStringUtility(),
    };
  },
  methods({ repo, groupFactory, resCode, objectUtil, stringUtil }) {
    return {
      whereIsItUsed: createControllerMethod<
        JWTProtectionType,
        unknown
        // {
        //   templateIds: string[];
        //   groupIds: string[];
        //   widgetIds: string[];
        // }
      >({
        path: '/:id/where-is-it-used',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          // TODO
        },
      }),

      getAllLite: createControllerMethod<
        JWTProtectionType,
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
            items: (await repo.findAll()).map((e) => groupFactory.toLite(e)),
          };
        },
      }),

      getAll: createControllerMethod<JWTProtectionType, { items: BCMSGroup[] }>(
        {
          path: '/all',
          type: 'get',
          preRequestHandler: createJwtProtectionPreRequestHandler(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
          async handler() {
            return {
              items: await repo.findAll(),
            };
          },
        },
      ),

      getMany: createControllerMethod<
        JWTProtectionType,
        { items: BCMSGroup[] }
      >({
        path: '/many/:ids',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          return {
            items: await repo.findAllById(request.params.ids.split('-')),
          };
        },
      }),

      count: createControllerMethod<JWTProtectionType, { count: number }>({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return { count: await repo.count() };
        },
      }),

      getById: createControllerMethod<JWTProtectionType, { item: BCMSGroup }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler, request }) {
          const group = await repo.findById(request.params.id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: request.params.id }),
            );
          }
          return {
            item: group,
          };
        },
      }),

      add: createControllerMethod<JWTProtectionType, { item: BCMSGroup }>({
        path: '',
        type: 'post',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.WRITE,
        ),
        async handler({ request, errorHandler }) {
          const data: BCMSGroupAddData = request.body;
          {
            const checkBody = objectUtil.compareWithSchema(
              data,
              BCMSGroupAddDataSchema,
              'body',
            );
            if (checkBody instanceof ObjectUtilityError) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g002', { msg: checkBody.message }),
              );
            }
          }
          const group = groupFactory.create();
          group.label = data.label;
          group.name = stringUtil.toSlugUnderscore(data.label);
          group.desc = data.desc;
          if (await repo.methods.findByName(group.name)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('grp002', { name: group.name }),
            );
          }
          const addedGroup = await repo.add(group as never);
          // TODO: Push socket event
          return {
            item: addedGroup,
          };
        },
      }),

      update: createControllerMethod<JWTProtectionType, { item: BCMSGroup }>({
        path: '',
        type: 'put',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.USER, JWTRoleName.ADMIN],
          JWTPermissionName.WRITE,
        ),
        async handler({ request, errorHandler }) {
          const data: BCMSGroupUpdateData = request.body;
          {
            const checkData = objectUtil.compareWithSchema(
              data,
              BCMSGroupUpdateDataSchema,
              'body',
            );
            if (checkData instanceof ObjectUtilityError) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g002', { msg: checkData.message }),
              );
            }
          }
          const group = await repo.findById(data._id);
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('grp001', { id: data._id }),
            );
          }
          let changeDetected = false;
          if (typeof data.label !== 'undefined' && data.label !== group.label) {
            const name = stringUtil.toSlugUnderscore(data.label);
            if (group.name !== name) {
              if (await repo.methods.findByName(name)) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('grp002', { name: group.name }),
                );
              }
            }
            changeDetected = true;
            group.label = data.label;
            group.name = name;
          }
          if (typeof data.desc === 'string' && data.desc !== group.desc) {
            changeDetected = true;
            group.desc = data.desc;
          }
        },
      }),
    };
  },
});
