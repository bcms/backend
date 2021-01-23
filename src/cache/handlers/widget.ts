import { CacheHandler } from '../handler';
import {
  FSWidget,
  Widget,
  IWidget,
  WidgetRepo,
  FSWidgetRepository,
  MongoWidgetRepository,
} from '../../widget';
import { Logger } from '@becomes/purple-cheetah';

export class WidgetCacheHandler extends CacheHandler<
  FSWidget,
  Widget,
  IWidget,
  FSWidgetRepository,
  MongoWidgetRepository
> {
  constructor() {
    super(
      WidgetRepo,
      ['findByName', 'count'],
      new Logger('WidgetCacheHandler'),
    );
  }

  async findByName(name: string): Promise<Widget | FSWidget> {
    return (await this.queueable.exec(
      'findByName',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.name === name);
      },
    )) as Widget | FSWidget;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
