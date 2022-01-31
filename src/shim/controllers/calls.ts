import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSCloudUser, BCMSSocketEventType } from '@bcms/types';
import {
  createController,
  createControllerMethod,
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { HTTPStatus, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSShimService } from '../service';

export const BCMSShimCallsController = createController({
  name: 'Shim calls controller',
  path: '/api/shim/calls',
  methods() {
    return {
      health: createControllerMethod<unknown, { ok: boolean }>({
        path: '/health',
        type: 'post',
        async handler() {
          BCMSShimService.refreshAvailable();
          return {
            ok: true,
          };
        },
      }),

      userUpdate: createControllerMethod<void, { ok: boolean }>({
        path: '/user/update',
        type: 'post',
        async handler({ request, errorHandler }) {
          const body: {
            _id: string;
          } = request.body;
          const bodyCheck = ObjectUtility.compareWithSchema(
            body,
            {
              _id: {
                __type: 'string',
                __required: true,
              },
            },
            'body',
          );
          if (bodyCheck instanceof ObjectUtilityError) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bodyCheck.message,
            );
          }
          const cloudUser = (
            await BCMSShimService.send<
              {
                user: BCMSCloudUser;
              },
              unknown
            >({
              uri: `/instance/user/${request.body._id}`,
              payload: {},
              errorHandler,
            })
          ).user;
          const user = await BCMSRepo.user.findById(body._id);
          if (user) {
            await BCMSRepo.user.update(
              BCMSFactory.user.cloudUserToUser(
                cloudUser,
                user.customPool.policy,
              ),
            );
          } else {
            await BCMSRepo.user.add(
              BCMSFactory.user.cloudUserToUser(cloudUser),
            );
          }
          BCMSSocketManager.emit.user({
            type: BCMSSocketEventType.UPDATE,
            userId: cloudUser._id,
            userIds: 'all',
          });

          return {
            ok: true,
          };
        },
      }),
    };
  },
});
