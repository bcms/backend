import type { SocketEventHandler } from '@becomes/purple-cheetah-mod-socket/types';
import { SocketEventName, SocketUtil } from '../../_util';

export function createEntryChangeSocketHandler(): SocketEventHandler<
  {
    tree: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    source?: string;
  },
  unknown
> {
  return {
    name: SocketEventName.ENTRY_CHANGE,
    async handler(data, connection) {
      data.source = connection.id;
      SocketUtil.entryChangeEmit(data);
    },
  };
}
