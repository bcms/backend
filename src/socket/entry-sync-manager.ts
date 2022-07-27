import {
  BCMSSocketEventName,
  BCMSSocketSyncEvent,
  BCMSSocketUnsyncEvent,
} from '@bcms/types';
import type { SocketConnection } from '@becomes/purple-cheetah-mod-socket/types';

interface Groups {
  [path: string]: {
    [connId: string]: {
      sid: string;
      uid: string;
      conn: SocketConnection<unknown>;
    };
  };
}

export class BCMSSocketEntrySyncManager {
  static groups: Groups = {};

  static sync(
    conn: SocketConnection<unknown>,
    data: BCMSSocketSyncEvent,
  ): void {
    if (!BCMSSocketEntrySyncManager.groups[data.p]) {
      BCMSSocketEntrySyncManager.groups[data.p] = {};
    }
    const uid = conn.id.split('_')[0];
    BCMSSocketEntrySyncManager.groups[data.p][conn.id] = {
      sid: conn.socket.id,
      uid,
      conn,
    };
  }

  static unsync(
    conn: SocketConnection<unknown>,
    data?: BCMSSocketUnsyncEvent,
  ): void {
    console.log({ data });
    if (data) {
      if (
        BCMSSocketEntrySyncManager.groups[data.p] &&
        BCMSSocketEntrySyncManager.groups[data.p][conn.id]
      ) {
        for (const connId in BCMSSocketEntrySyncManager.groups[data.p]) {
          if (connId !== conn.id) {
            const info = BCMSSocketEntrySyncManager.groups[data.p][connId];
            info.conn.socket.emit(BCMSSocketEventName.UNSYNC_FSERV, {
              p: data.p,
              connId: conn.id,
            });
          }
        }
        delete BCMSSocketEntrySyncManager.groups[data.p][conn.id];
      }
    } else {
      for (const path in BCMSSocketEntrySyncManager.groups) {
        if (BCMSSocketEntrySyncManager.groups[path][conn.id]) {
          for (const connId in BCMSSocketEntrySyncManager.groups[path]) {
            if (connId !== conn.id) {
              const info = BCMSSocketEntrySyncManager.groups[path][connId];
              info.conn.socket.emit(BCMSSocketEventName.UNSYNC_FSERV, {
                p: path,
                connId: conn.id,
              });
            }
          }
          delete BCMSSocketEntrySyncManager.groups[path][conn.id];
        }
      }
    }
  }
}
