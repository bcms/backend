import { CacheHandler } from '../handler';
import { FSWidget, Widget, IWidget, WidgetRepo } from '../../widget';

export class WidgetCacheHandler extends CacheHandler<
  FSWidget,
  Widget,
  IWidget
> {
  constructor() {
    super(WidgetRepo, ['findByName', 'count']);
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
