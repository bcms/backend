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
  BCMSSocketManagerScope,
  BCMSSocketMediaEvent,
  BCMSSocketStatusEvent,
  BCMSSocketTagEvent,
  BCMSSocketTemplateEvent,
  BCMSSocketTemplateOrganizerEvent,
  BCMSSocketUserEvent,
  BCMSSocketWidgetEvent,
} from '../types';

let soc: Socket;

async function emit<Data>({
  socket,
  name,
  data,
  userIds,
  excludeUserId,
  scopes,
}: {
  socket: Socket;
  name: BCMSSocketEventName;
  data: Data;
  userIds: string[] | 'all';
  excludeUserId?: string[];
  scopes?: BCMSSocketManagerScope[];
}): Promise<void> {
  if (userIds === 'all') {
    let toScopes: BCMSSocketManagerScope[];
    if (scopes) {
      toScopes = scopes;
    } else {
      toScopes = ['global', 'client'];
    }
    for (let i = 0; i < toScopes.length; i++) {
      const scope = toScopes[i];
      socket.emitToScope<Data>({
        eventName: name,
        eventData: data,
        scope: scope,
      });
    }
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
      await emit<BCMSSocketApiKeyEvent>({
        socket: soc,
        name: BCMSSocketEventName.API_KEY,
        data: {
          a: data.apiKeyId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async entry(data) {
      await emit<BCMSSocketEntryEvent>({
        socket: soc,
        name: BCMSSocketEventName.ENTRY,
        data: {
          e: data.entryId,
          tm: data.templateId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async group(data) {
      await emit<BCMSSocketGroupEvent>({
        socket: soc,
        name: BCMSSocketEventName.GROUP,
        data: {
          g: data.groupId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async language(data) {
      await emit<BCMSSocketLanguageEvent>({
        socket: soc,
        name: BCMSSocketEventName.LANGUAGE,
        data: {
          l: data.languageId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async media(data) {
      await emit<BCMSSocketMediaEvent>({
        socket: soc,
        name: BCMSSocketEventName.MEDIA,
        data: {
          m: data.mediaId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async status(data) {
      await emit<BCMSSocketStatusEvent>({
        socket: soc,
        name: BCMSSocketEventName.STATUS,
        data: {
          s: data.statusId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async template(data) {
      await emit<BCMSSocketTemplateEvent>({
        socket: soc,
        name: BCMSSocketEventName.TEMPLATE,
        data: {
          tm: data.templateId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async templateOrganizer(data) {
      await emit<BCMSSocketTemplateOrganizerEvent>({
        socket: soc,
        name: BCMSSocketEventName.TEMPLATE_ORGANIZER,
        data: {
          to: data.templateOrganizerId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async user(data) {
      await emit<BCMSSocketUserEvent>({
        socket: soc,
        name: BCMSSocketEventName.USER,
        data: {
          u: data.userId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async widget(data) {
      await emit<BCMSSocketWidgetEvent>({
        socket: soc,
        name: BCMSSocketEventName.WIDGET,
        data: {
          w: data.widgetId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async color(data) {
      await emit<BCMSSocketColorEvent>({
        socket: soc,
        name: BCMSSocketEventName.COLOR,
        data: {
          c: data.colorId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
    },
    async tag(data) {
      await emit<BCMSSocketTagEvent>({
        socket: soc,
        name: BCMSSocketEventName.TAG,
        data: {
          tg: data.tagId,
          t: data.type,
        },
        userIds: data.userIds,
        scopes: data.scopes,
      });
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
