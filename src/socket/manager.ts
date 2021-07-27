import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSSocketApiKeyEvent,
  BCMSSocketEntryEvent,
  BCMSSocketEventName,
  BCMSSocketGroupEvent,
  BCMSSocketLanguageEvent,
  BCMSSocketManager,
  BCMSSocketMediaEvent,
  BCMSSocketStatusEvent,
  BCMSSocketTemplateEvent,
  BCMSSocketTemplateOrganizerEvent,
  BCMSSocketUserEvent,
  BCMSSocketWidgetEvent,
} from '../types';

let manager: BCMSSocketManager;

export function useBcmsSocketManager(): BCMSSocketManager {
  return manager;
}

export function createBcmsSocketManager(): Module {
  async function emit<Data>(
    socket: Socket,
    name: BCMSSocketEventName,
    data: Data,
    userIds: string[] | 'all',
    excludeUserId?: string[],
  ): Promise<void> {
    if (userIds === 'all') {
      socket.emitToScope<Data>({
        eventName: name,
        eventData: data,
        scope: 'global',
      });
    } else {
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const connection = socket.findConnectionById(userId);
        if (connection && (!excludeUserId || !excludeUserId.includes(userId))) {
          socket.emit<Data>({
            eventName: name,
            eventData: data,
            connectionId: userId,
          });
        }
      }
    }
  }
  return {
    name: 'Socket manager',
    initialize(moduleConfig) {
      const socket = useSocket();
      manager = {
        emit: {
          async apiKey(data) {
            await emit<BCMSSocketApiKeyEvent>(
              socket,
              BCMSSocketEventName.API_KEY,
              {
                a: data.apiKeyId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async entry(data) {
            await emit<BCMSSocketEntryEvent>(
              socket,
              BCMSSocketEventName.ENTRY,
              {
                e: data.entryId,
                tm: data.templateId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async group(data) {
            await emit<BCMSSocketGroupEvent>(
              socket,
              BCMSSocketEventName.GROUP,
              {
                g: data.groupId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async language(data) {
            await emit<BCMSSocketLanguageEvent>(
              socket,
              BCMSSocketEventName.LANGUAGE,
              {
                l: data.languageId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async media(data) {
            await emit<BCMSSocketMediaEvent>(
              socket,
              BCMSSocketEventName.MEDIA,
              {
                m: data.mediaId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async status(data) {
            await emit<BCMSSocketStatusEvent>(
              socket,
              BCMSSocketEventName.STATUS,
              {
                s: data.statusId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async template(data) {
            await emit<BCMSSocketTemplateEvent>(
              socket,
              BCMSSocketEventName.TEMPLATE,
              {
                tm: data.templateId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async templateOrganizer(data) {
            await emit<BCMSSocketTemplateOrganizerEvent>(
              socket,
              BCMSSocketEventName.TEMPLATE_ORGANIZER,
              {
                to: data.templateOrganizerId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async user(data) {
            await emit<BCMSSocketUserEvent>(
              socket,
              BCMSSocketEventName.USER,
              {
                u: data.userId,
                t: data.type,
              },
              data.userIds,
            );
          },
          async widget(data) {
            await emit<BCMSSocketWidgetEvent>(
              socket,
              BCMSSocketEventName.WIDGET,
              {
                w: data.widgetId,
                t: data.type,
              },
              data.userIds,
            );
          },
        },
      };
      moduleConfig.next();
    },
  };
}
