import {
  BCMSSocketEventName,
  BCMSSocketSyncChangeEvent,
  BCMSSocketSyncEvent,
  BCMSSocketUnsyncEvent,
} from '@bcms/types';
import type {
  SocketConnection,
  SocketEventHandler,
} from '@becomes/purple-cheetah-mod-socket/types';
import { BCMSSocketEntrySyncManager } from './entry-sync-manager';

interface Handler<Data = unknown, K = unknown>
  extends Omit<SocketEventHandler, 'name' | 'handler'> {
  name: BCMSSocketEventName;
  handler(data: Data, connection: SocketConnection<K>): Promise<void>;
}

export function bcmsCreateSocketEventHandlers(): Handler[] {
  function emit(
    conn: SocketConnection<unknown>,
    eventName: BCMSSocketEventName,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) {
    if (BCMSSocketEntrySyncManager.groups[path]) {
      for (const connId in BCMSSocketEntrySyncManager.groups[path]) {
        if (connId !== conn.id) {
          const info = BCMSSocketEntrySyncManager.groups[path][connId];
          info.conn.socket.emit(eventName, {
            ...data,
            connId: conn.id,
          });
        }
      }
    }
  }

  return [
    {
      name: BCMSSocketEventName.SYNC_TSERV,
      handler: async (data, conn) => {
        BCMSSocketEntrySyncManager.sync(conn, data);
        emit(conn, BCMSSocketEventName.SYNC_FSERV, data.p, data);
      },
    } as Handler<BCMSSocketSyncEvent>,

    {
      name: BCMSSocketEventName.UNSYNC_TSERV,
      handler: async (data, conn) => {
        console.log('WTF')
        BCMSSocketEntrySyncManager.unsync(conn, data);
      },
    } as Handler<BCMSSocketUnsyncEvent>,

    {
      name: BCMSSocketEventName.SYNC_CHANGE_TSERV,
      handler: async (data, conn) => {
        emit(conn, BCMSSocketEventName.SYNC_CHANGE_FSERV, data.p, data);
        // if (BCMSSocketEntrySyncManager.groups[data.p]) {
        //   for (const connId in BCMSSocketEntrySyncManager.groups[data.p]) {
        //     if (connId !== conn.id) {
        //       const info = BCMSSocketEntrySyncManager.groups[data.p][connId];
        //       info.conn.socket.emit(BCMSSocketEventName.SYNC_CHANGE_FSERV, {
        //         ...data,
        //         connId: conn.id,
        //       });
        //     }
        //   }
        // }
      },
    } as Handler<BCMSSocketSyncChangeEvent>,
  ];
}
