import { CacheHandler } from '../handler';
import { FSTemplate, Template, ITemplate, TemplateRepo } from '../../template';

export class TemplateCacheHandler extends CacheHandler<
  FSTemplate,
  Template,
  ITemplate
> {
  constructor() {
    super(TemplateRepo, ['findByName', 'count']);
  }

  async findByName(name: string): Promise<Template | FSTemplate> {
    return (await this.queueable.exec(
      'findByName',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.name === name);
      },
    )) as Template | FSTemplate;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
