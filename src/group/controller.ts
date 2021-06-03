import {
  createController,
  createControllerMethod,
  createJwtProtectionPreRequestHandler,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  BCMSGroup,
  BCMSGroupAddData,
  BCMSGroupFactory,
  BCMSGroupLite,
  BCMSGroupRepository,
  JWTProtectionType,
  ResponseCode,
  BCMSGroupAddDataSchema,
} from '../types';
import { useBcmsGroupRepository } from './repository';
import {
  HTTPStatus,
  JWTPermissionName,
  JWTRoleName,
  ObjectUtility,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import { useBcmsGroupFactory } from './factory';
import { useResponseCode } from '../response-code';

export const BCMSGroupController = createController<{
  repo: BCMSGroupRepository;
  groupFactory: BCMSGroupFactory;
  resCode: ResponseCode;
  objectUtil: ObjectUtility;
  stringUtil: StringUtility;
}>({
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
        {
          templateIds: string[];
          groupIds: string[];
          widgetIds: string[];
        }
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
        {
          items: BCMSGroupLite[];
        }
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

      getAll: createControllerMethod<
        JWTProtectionType,
        {
          items: BCMSGroup[];
        }
      >({
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
      }),

      getMany: createControllerMethod<
        JWTProtectionType,
        {
          items: BCMSGroup[];
        }
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

      count: createControllerMethod<
        JWTProtectionType,
        {
          count: number;
        }
      >({
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

      getById: createControllerMethod<
        JWTProtectionType,
        {
          item: BCMSGroup;
        }
      >({
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

      add: createControllerMethod<
        JWTProtectionType,
        {
          item: BCMSGroup;
        }
      >({
        path: '',
        type: 'post',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
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
          group.name = stringUtil.toSlugUnderScore(data.label);
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
    };
  },
});
