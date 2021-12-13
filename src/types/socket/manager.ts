import type { BCMSSocketEventType } from './models';

export interface BCMSSocketManager {
  emit: {
    apiKey(data: {
      type: BCMSSocketEventType;
      apiKeyId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
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
    }): Promise<void>;
    group(data: {
      type: BCMSSocketEventType;
      groupId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    language(data: {
      type: BCMSSocketEventType;
      languageId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    media(data: {
      type: BCMSSocketEventType;
      mediaId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    status(data: {
      type: BCMSSocketEventType;
      statusId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    template(data: {
      type: BCMSSocketEventType;
      templateId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    templateOrganizer(data: {
      type: BCMSSocketEventType;
      templateOrganizerId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    user(data: {
      type: BCMSSocketEventType;
      userId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    widget(data: {
      type: BCMSSocketEventType;
      widgetId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    color(data: {
      type: BCMSSocketEventType;
      colorId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    tag(data: {
      type: BCMSSocketEventType;
      tagId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
    change(data: {
      type: BCMSSocketEventType;
      changeId: string;
      /**
       * Who will receive this event.
       */
      userIds: string[] | 'all';
      excludeUserId?: string[];
    }): Promise<void>;
  };
}
