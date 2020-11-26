import { SocketEventHandler } from '@becomes/purple-cheetah';
import { SocketEventName, SocketUtil } from '../../util';

export class EntryChangeSocketHandler implements SocketEventHandler {
  name = SocketEventName.ENTRY_CHANGE;
  async handler(
    data: {
      tree: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
      source?: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket: any,
  ): Promise<void> {
    data.source = socket.id;
    SocketUtil.entryChangeEmit(data);
  }
}
