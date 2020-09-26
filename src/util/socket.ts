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
}

export interface SocketEventData {
  type: 'add' | 'update' | 'remove';
  message: any;
  source: string;
  entry: {
    _id: string;
  };
}

export class SocketUtil {
  static emit(name: SocketEventName, data: SocketEventData) {
    SocketConnectionService.emitToGroup('global', name, data);
  }
}
