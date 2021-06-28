import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  HttpStatus,
  StringUtility,
  ObjectUtility,
  Queueable,
} from '@becomes/purple-cheetah';
import { FSGroup, Group } from './models';
import { ResponseCode } from '../_response-code';
import { CacheControl } from '../_cache';
import { GroupFactory } from './factories';
import {
  AddGroupData,
  AddGroupDataSchema,
  UpdateGroupData,
  UpdateGroupDataSchema,
} from './interfaces';
import {
  PropHandler,
  PropChange,
  Prop,
  PropType,
  PropGroupPointer,
  PropWidget,
} from '../_prop';
import { General, SocketUtil, SocketEventName } from '../util';
import { Widget, FSWidget } from '../widget';
import { Template, FSTemplate } from '../template';
import { Entry, FSEntry } from '../entry';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';

export class GroupRequestHandler {
  @CreateLogger(GroupRequestHandler)
  private static logger: Logger;
  private static queueable = Queueable<Group | FSGroup | void>('update');

  static async whereIsItUsed(
    id: string,
  ): Promise<{
    templateIds: string[];
    groupIds: string[];
    widgetIds: string[];
  }> {
    const error = HttpErrorFactory.instance(
      'whereIsItUsed',
      this.logger,
    );
    const output: {
      templateIds: string[];
      groupIds: string[];
      widgetIds: string[];
    } = {
      groupIds: [],
      templateIds: [],
      widgetIds: [],
    };
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const group = await CacheControl.group.findById(id);
    if (!group) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'grp001',
          { id },
        ),
      );
    }
    const search = async (
      targetGroupId: string,
      props: Prop[],
    ): Promise<boolean> => {
      for (const i in props) {
        const prop = props[i];
        if (prop.type === PropType.GROUP_POINTER) {
          const value = prop.value as PropGroupPointer;
          if (value._id === targetGroupId) {
            return true;
          } else {
            const g = await CacheControl.group.findById(value._id);
            return search(
              targetGroupId,
              g.props,
            );
          }
        }
      }
      return false;
    };
    {
      const templates = await CacheControl.template.findAll();
      for (const i in templates) {
        const template = templates[i];
        if (await search(
          `${group._id}`,
          template.props,
        )) {
          output.templateIds.push(`${template._id}`);
        }
      }
    }
    {
      const groups = await CacheControl.group.findAll();
      for (const i in groups) {
        const g = groups[i];
        if (await search(
          `${group._id}`,
          g.props,
        )) {
          output.groupIds.push(`${g._id}`);
        }
      }
    }
    {
      const widgets = await CacheControl.widget.findAll();
      for (const i in widgets) {
        const widget = widgets[i];
        if (await search(
          `${group._id}`,
          widget.props,
        )) {
          output.widgetIds.push(`${widget._id}`);
        }
      }
    }
    return output;
  }

  static async getAll(): Promise<Array<Group | FSGroup>> {
    return await CacheControl.group.findAll();
  }

  static async getById(id: string): Promise<Group | FSGroup> {
    const error = HttpErrorFactory.instance(
      'getById',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const group = await CacheControl.group.findById(id);
    if (!group) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'grp001',
          { id },
        ),
      );
    }
    return group;
  }

  static async getMany(idsString: string): Promise<Array<Group | FSGroup>> {
    const error = HttpErrorFactory.instance(
      'getMany',
      this.logger,
    );
    if (!idsString) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g010',
          {
            param: 'ids',
          },
        ),
      );
    }
    const ids: string[] = idsString.split('-').map((id, i) => {
      if (StringUtility.isIdValid(id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'g004',
            { id: `ids[${i}]: ${id}` },
          ),
        );
      }
      return id;
    });
    return await CacheControl.group.findAllById(ids);
  }

  static async count(): Promise<number> {
    return await CacheControl.group.count();
  }

  static async add(data: AddGroupData, sid: string): Promise<Group | FSGroup> {
    const error = HttpErrorFactory.instance(
      'add',
      this.logger,
    );
    try {
      ObjectUtility.compareWithSchema(
        data,
        AddGroupDataSchema,
        'data',
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g002',
          {
            msg: e.message,
          },
        ),
      );
    }
    const group = GroupFactory.instance();
    group.label = data.label;
    group.name = General.labelToName(data.label);
    group.desc = data.desc;
    if (await CacheControl.group.findByName(group.name)) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get(
          'grp002',
          { name: group.name },
        ),
      );
    }
    const addGroupResult = await CacheControl.group.add(
      group,
      async () => {
        SocketUtil.emit(
          SocketEventName.GROUP,
          {
            entry: {
              _id: `${group._id}`,
            },
            message: 'Unsuccessful group add.',
            source: '',
            type: 'remove',
          },
        );
      },
    );
    if (addGroupResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp003'),
      );
    }
    SocketUtil.emit(
      SocketEventName.GROUP,
      {
        entry: {
          _id: `${group._id}`,
        },
        message: 'Group has been added.',
        source: sid,
        type: 'add',
      },
    );
    await EventManager.emit(
      BCMSEventConfigScope.GROUP,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(group)),
    );
    return group;
  }

  /**
   * This method will update specified Group and it has a lot
   * of side effect. This is done to remove complex and hard work
   * from the client and to ensure that data is consistent in the
   * database. After updating the Group, `propsUpdate` method
   * will be called and it will update all Entries, Templates,
   * Groups and Widgets which are using this group.
   */
  static async update(
    data: UpdateGroupData,
    sid: string,
  ): Promise<Group | FSGroup> {
    return (
      await this.queueable.exec(
        'update',
        'free_one_by_one',
        async () => {
          const error = HttpErrorFactory.instance(
            'update',
            this.logger,
          );
          try {
            ObjectUtility.compareWithSchema(
              data,
              UpdateGroupDataSchema,
              'data',
            );
          } catch (err) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get(
                'g002',
                {
                  msg: err.message,
                },
              ),
            );
          }
          if (StringUtility.isIdValid(data._id) === false) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get(
                'g004',
                { id: data._id },
              ),
            );
          }
          let group: Group | FSGroup;
          {
            const g = await CacheControl.group.findById(data._id);
            if (!g) {
              throw error.occurred(
                HttpStatus.NOT_FOUNT,
                ResponseCode.get(
                  'grp001',
                  { id: data._id },
                ),
              );
            }
            group = JSON.parse(JSON.stringify(g));
          }
          let changeDetected = false;
          if (typeof data.label !== 'undefined' && data.label !== group.label) {
            const name = General.labelToName(data.label);
            if (group.name !== name) {
              if (await CacheControl.group.findByName(name)) {
                throw error.occurred(
                  HttpStatus.FORBIDDEN,
                  ResponseCode.get(
                    'grp002',
                    { name: group.name },
                  ),
                );
              }
            }
            changeDetected = true;
            group.label = data.label;
            group.name = name;
          }
          if (typeof data.desc === 'string' && data.desc !== group.desc) {
            changeDetected = true;
            group.desc = data.desc;
          }
          let updateEntries = false;
          if (
            typeof data.propChanges !== 'undefined' &&
            data.propChanges.length > 0
          ) {
            updateEntries = true;
            changeDetected = true;
            const o = await PropHandler.applyPropChanges(
              group.props,
              data.propChanges,
              `(group: ${group.name}).props`,
              true,
            );
            if (o instanceof Error) {
              throw error.occurred(
                HttpStatus.BAD_REQUEST,
                ResponseCode.get(
                  'g009',
                  {
                    msg: o.message,
                  },
                ),
              );
            }
            group.props = o;
          }
          if (!changeDetected) {
            throw error.occurred(
              HttpStatus.FORBIDDEN,
              ResponseCode.get('g003'),
            );
          }
          const result = await PropHandler.testInfiniteLoop(
            group.props,
            {
              group: [
                {
                  _id: `${group._id}`,
                  label: group.label,
                },
              ],
            },
          );
          if (result instanceof Error) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get(
                'g008',
                {
                  msg: result.message,
                },
              ),
            );
          }
          const output = await PropHandler.propsChecker(
            group.props,
            group.props,
            'group.props',
            true,
          );
          if (output instanceof Error) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get(
                'g007',
                {
                  msg: output.message,
                },
              ),
            );
          }
          const updateResult = await CacheControl.group.update(
            group,
            async (type) => {
              SocketUtil.emit(
                SocketEventName.GROUP,
                {
                  entry: {
                    _id: `${group._id}`,
                  },
                  message: '',
                  source: '',
                  type,
                },
              );
            },
          );
          if (updateResult === false) {
            throw error.occurred(
              HttpStatus.INTERNAL_SERVER_ERROR,
              ResponseCode.get('grp005'),
            );
          }
          let updated: Array<{
            name: string;
            ids: string[];
          }>;
          if (updateEntries) {
            // TODO: It is a very big issue if this fails because
            //        there is no mechanism to reverse the state
            //        back to pre fail state.
            try {
              updated = await this.propsUpdate(
                `${group._id}`,
                data.propChanges,
              );
            } catch (e) {
              this.logger.error(
                'update',
                e,
              );
              throw error.occurred(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ResponseCode.get(
                  'grp007',
                  {
                    msg: e.message,
                  },
                ),
              );
            }
          }
          SocketUtil.emit(
            SocketEventName.GROUP,
            {
              entry: {
                _id: `${group._id}`,
              },
              message: {
                updated,
              },
              source: '',
              type: 'update',
            },
          );
          await EventManager.emit(
            BCMSEventConfigScope.GROUP,
            BCMSEventConfigMethod.UPDATE,
            JSON.parse(JSON.stringify(group)),
          );
          return group;
        },
      )
    ) as Group | FSGroup;
  }

  static async deleteById(id: string, sid: string) {
    const error = HttpErrorFactory.instance(
      'deleteById',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const group = await CacheControl.group.findById(id);
    if (!group) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'grp001',
          { id },
        ),
      );
    }
    const deleteResult = await CacheControl.group.deleteById(
      id,
      async () => {
        SocketUtil.emit(
          SocketEventName.GROUP,
          {
            entry: {
              _id: `${group._id}`,
            },
            message: '',
            source: '',
            type: 'add',
          },
        );
      },
    );
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp006'),
      );
    }
    let updated: Array<{
      name: string;
      ids: string[];
    }>;
    // TODO: It is a very big issue if this fails because
    //        there is no mechanism to reverse the state
    //        back to pre fail state.
    try {
      updated = await this.propsUpdate(
        `${group._id}`,
        [
          {
            remove: `${group._id}`,
          },
        ],
      );
    } catch (e) {
      this.logger.error(
        'update',
        e,
      );
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get(
          'grp007',
          {
            msg: e.message,
          },
        ),
      );
    }
    SocketUtil.emit(
      SocketEventName.GROUP,
      {
        entry: {
          _id: `${group._id}`,
        },
        message: {
          updated,
        },
        source: '',
        type: 'remove',
      },
    );
    await EventManager.emit(
      BCMSEventConfigScope.GROUP,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(group)),
    );
  }

  private static async propsUpdate(
    groupId: string,
    propChanges: PropChange[],
  ): Promise<Array<{
    name: string;
    ids: string[];
  }>> {
    const updated: {
      entry: string[];
      group: string[];
      widget: string[];
      template: string[];
    } = {
      entry: [],
      group: [],
      template: [],
      widget: [],
    };
    // Update Groups which are using this Group.
    {
      const groups = await CacheControl.group.findAll();
      for (const i in groups) {
        const group: Group | FSGroup = JSON.parse(JSON.stringify(groups[i]));
        const output = await PropHandler.propsUpdateTargetGroup(
          groupId,
          group.props,
          propChanges,
          `(group: ${group.name}).props`,
        );
        if (output instanceof Error) {
          throw output;
        }
        if (output.changesFound) {
          updated.group.push(`${group._id}`);
          group.props = output.props;
          await CacheControl.group.update(
            group,
            async (type) => {
              SocketUtil.emit(
                SocketEventName.GROUP,
                {
                  entry: {
                    _id: `${group._id}`,
                  },
                  message: '',
                  source: '',
                  type,
                },
              );
            },
          );
        }
      }
    }
    // Update Widgets which are using this Group.
    const updatedWidgets: Array<Widget | FSWidget> = [];
    {
      const widgets = await CacheControl.widget.findAll();
      for (const i in widgets) {
        const widget: Widget | FSWidget = JSON.parse(
          JSON.stringify(widgets[i]),
        );
        const output = await PropHandler.propsUpdateTargetGroup(
          groupId,
          widget.props,
          propChanges,
          `(widget: ${widget.name}).props`,
        );
        if (output instanceof Error) {
          throw output;
        }
        if (output.changesFound) {
          updated.widget.push(`${widget._id}`);
          widget.props = output.props;
          updatedWidgets.push(widget);
          await CacheControl.widget.update(
            widget,
            async (type) => {
              SocketUtil.emit(
                SocketEventName.WIDGET,
                {
                  entry: {
                    _id: `${widget._id}`,
                  },
                  message: '',
                  source: '',
                  type,
                },
              );
            },
          );
        }
      }
    }
    // Update Templates which are using this Group.
    {
      const templates = await CacheControl.template.findAll();
      for (const i in templates) {
        const template: Template | FSTemplate = JSON.parse(
          JSON.stringify(templates[i]),
        );
        const output = await PropHandler.propsUpdateTargetGroup(
          groupId,
          template.props,
          propChanges,
          `(template: ${template.name}).props`,
        );
        if (output instanceof Error) {
          throw output;
        }
        if (output.changesFound) {
          updated.template.push(`${template._id}`);
          template.props = output.props;
          await CacheControl.template.update(
            template,
            async (type) => {
              SocketUtil.emit(
                SocketEventName.TEMPLATE,
                {
                  entry: {
                    _id: `${template._id}`,
                  },
                  message: '',
                  source: '',
                  type,
                },
              );
            },
          );
        }
      }
    }
    // Update Entries which are using this Group.
    {
      const entries: Array<Entry | FSEntry> = JSON.parse(
        JSON.stringify(await CacheControl.entry.findAll()),
      );
      const updateEntries: {
        [id: string]: boolean;
      } = {};
      for (const i in entries) {
        const entry = entries[i];
        for (const j in updated.template) {
          // const entries = await CacheControl.entry.findAllByTemplateId(
          //   updated.template[i],
          // );
          // const entries = _entries.filter(
          //   (e) => e.templateId === updated.template[i],
          // );
          if (entry.templateId === updated.template[j]) {
            let changeInEntry = false;
            for (const k in entry.meta) {
              const meta = entry.meta[k];
              const output = await PropHandler.propsUpdateTargetGroup(
                groupId,
                meta.props,
                propChanges,
                `(entry: ${entry._id}).meta[${k}].props`,
              );
              if (output instanceof Error) {
                throw output;
              }
              if (output.changesFound) {
                changeInEntry = true;
                entries[i].meta[k].props = output.props;
                // entry.meta[k].props = output.props;
              }
            }
            if (changeInEntry) {
              // updated.entry.push(`${entry._id}`);
              updateEntries[`${entry._id}`] = true;
              // await CacheControl.entry.update(entry, async (type) => {
              //   SocketUtil.emit(SocketEventName.ENTRY, {
              //     entry: {
              //       _id: `${entry._id}`,
              //     },
              //     message: '',
              //     source: '',
              //     type,
              //   });
              // });
            }
          }
        }
        for (const j in entry.content) {
          const content = entry.content[j];
          for (const k in content.props) {
            const prop = content.props[k];
            if (prop.type === PropType.WIDGET) {
              const value = prop.value as PropWidget;
              for (const n in updatedWidgets) {
                if (value._id === `${updatedWidgets[n]._id}`) {
                  const output = await PropHandler.propsUpdateTargetGroup(
                    groupId,
                    value.props,
                    propChanges,
                    `(entry: ${entry._id}).meta[${k}].props`,
                  );
                  if (output instanceof Error) {
                    throw output;
                  }
                  if (output.changesFound) {
                    (
                      entries[i].content[j].props[k].value as PropWidget
                    ).props =
                      output.props;
                    updateEntries[`${entry._id}`] = true;
                  }
                }
              }
            }
          }
        }
      }
      for (const i in updateEntries) {
        updated.entry.push(i);
        const entry = entries.find((e) => `${e._id}` === i);
        await CacheControl.entry.update(
          entry,
          async (type) => {
            SocketUtil.emit(
              SocketEventName.ENTRY,
              {
                entry: {
                  _id: `${entry._id}`,
                },
                message: '',
                source: '',
                type,
              },
            );
          },
        );
      }
    }
    return Object.keys(updated).map((key) => {
      return {
        name: key,
        ids: updated[key],
      };
    });
  }
}
