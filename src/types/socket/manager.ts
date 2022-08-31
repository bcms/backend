import type { BCMSSocketEventType } from './models';

export type BCMSSocketManagerScope = 'global' | 'client';

export interface BCMSSocketManager {
  emit: {
    backup(data: {
      type: BCMSSocketEventType;
      userIds: string[] | 'all';
      fileName: string;
      size: number;
    }): Promise<void>;
    apiKey(data: {
      type: BCMSSocketEventType;
      apiKeyId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    entry(data: {
      type: BCMSSocketEventType;
      templateId: string;
      entryId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    group(data: {
      type: BCMSSocketEventType;
      groupId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    language(data: {
      type: BCMSSocketEventType;
      languageId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    media(data: {
      type: BCMSSocketEventType;
      mediaId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    status(data: {
      type: BCMSSocketEventType;
      statusId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    template(data: {
      type: BCMSSocketEventType;
      templateId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    templateOrganizer(data: {
      type: BCMSSocketEventType;
      templateOrganizerId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    user(data: {
      type: BCMSSocketEventType;
      userId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    widget(data: {
      type: BCMSSocketEventType;
      widgetId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    color(data: {
      type: BCMSSocketEventType;
      colorId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    tag(data: {
      type: BCMSSocketEventType;
      tagId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
      scopes?: BCMSSocketManagerScope[];
    }): Promise<void>;
    refresh(data: { userId: string }): Promise<void>;
    signOut(data: { userId: string }): Promise<void>;
    sync: {
      entry(data: { channel: string, connId: string }): Promise<void>;
    };
  };
}
