import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSSocketApiKeyEvent,
  BCMSSocketColorEvent,
  BCMSSocketEntryEvent,
  BCMSSocketEventName,
  BCMSSocketGroupEvent,
  BCMSSocketLanguageEvent,
  BCMSSocketManager as BCMSSocketManagerType,
  BCMSSocketMediaEvent,
  BCMSSocketStatusEvent,
  BCMSSocketTemplateEvent,
  BCMSSocketTemplateOrganizerEvent,
  BCMSSocketUserEvent,
  BCMSSocketWidgetEvent,
} from '../types';

let soc: Socket;

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

export const BCMSSocketManager: BCMSSocketManagerType = {
  emit: {
    async apiKey(data) {
      await emit<BCMSSocketApiKeyEvent>(
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
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
        soc,
        BCMSSocketEventName.WIDGET,
        {
          w: data.widgetId,
          t: data.type,
        },
        data.userIds,
      );
    },
    async color(data) {
      await emit<BCMSSocketColorEvent>(
        soc,
        BCMSSocketEventName.COLOR,
        {
          c: data.colorId,
          t: data.type,
        },
        data.userIds,
      );
    },
  },
};

export function createBcmsSocketManager(): Module {
  return {
    name: 'Socket manager',
    initialize(moduleConfig) {
      soc = useSocket();

      moduleConfig.next();
    },
  };
}
