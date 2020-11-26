import { SocketConnectionService } from '@becomes/purple-cheetah';

export enum SocketEventName {
  USER = 'user',
  TEMPLATE = 'template',
  LANGUAGE = 'language',
  GROUP = 'group',
  WIDGET = 'widget',
  ENTRY = 'entry',
  MEDIA = 'media',
  API_KEY = 'apiKey',
  PLUGIN = 'plugin',
  ENTRY_CHANGE = 'entryChange',
}

export interface SocketEventData {
  type: 'add' | 'update' | 'remove';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  source: string;
  entry: {
    _id: string;
    additional?: {
      templateId?: string;
    };
  };
}

export class SocketUtil {
  static emit(name: SocketEventName, data: SocketEventData) {
    SocketConnectionService.emitToGroup('global', name, data);
  }
  static entryChangeEmit<T>(data: T) {
    SocketConnectionService.emitToGroup(
      'global',
      SocketEventName.ENTRY_CHANGE,
      data,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static pluginEmit(name: string, payload: any) {
    SocketConnectionService.emitToGroup('global', SocketEventName.PLUGIN, {
      name,
      payload,
    });
  }
}
