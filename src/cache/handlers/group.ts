import { CacheHandler } from '../handler';
import {
  FSGroup,
  Group,
  IGroup,
  GroupRepo,
  FSGroupRepository,
  MongoGroupRepository,
} from '../../group';
import { PropType, PropGroupPointer } from '../../prop';
import { Logger } from '@becomes/purple-cheetah';

export class GroupCacheHandler extends CacheHandler<FSGroup,
  Group,
  IGroup,
  FSGroupRepository,
  MongoGroupRepository> {
  constructor() {
    super(
      GroupRepo,
      ['findByName', 'count', 'findAllByPropsGroupId'],
      new Logger('GroupCacheHandler'),
    );
  }

  async findByName(name: string): Promise<Group | FSGroup> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name);
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }

  async findAllByPropsGroupId(
    groupId: string,
  ): Promise<Array<Group | FSGroup>> {
    return (await this.queueable.exec(
      'count',
      'first_done_free_all',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) =>
          e.props.find(
            (prop) =>
              prop.type === PropType.GROUP_POINTER &&
              (prop.value as PropGroupPointer)._id === groupId,
          ),
        );
      },
    )) as Array<Group | FSGroup>;
  }
}
