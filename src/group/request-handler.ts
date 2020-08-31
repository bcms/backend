import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  StringUtility,
  ObjectUtility,
  Queueable,
} from '@becomes/purple-cheetah';
import { FSGroup, Group } from './models';
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import { GroupFactory } from './factories';
import {
  AddGroupData,
  AddGroupDataSchema,
  UpdateGroupData,
  UpdateGroupDataSchema,
} from './interfaces';
import { PropHandler, PropChange } from '../prop';
import { General, SocketUtil, SocketEventName } from '../util';
import { Widget, FSWidget } from '../widget';
import { Template, FSTemplate } from '../template';
import { Entry, FSEntry } from '../entry';

export class GroupRequestHandler {
  @CreateLogger(GroupRequestHandler)
  private static logger: Logger;
  private static queueable = Queueable<Group | FSGroup | void>('update');

  static async getAll(authorization: string): Promise<Array<Group | FSGroup>> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const groups = await CacheControl.group.findAll();
    return groups;
  }

  static async getById(
    authorization: string,
    id: string,
  ): Promise<Group | FSGroup> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const group = await CacheControl.group.findById(id);
    if (!group) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('grp001', { id }),
      );
    }
    return group;
  }

  static async getMany(
    authorization: string,
    idsString: string,
  ): Promise<Array<Group | FSGroup>> {
    const error = HttpErrorFactory.instance('getMany', this.logger);
    if (!idsString) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g010', {
          param: 'ids',
        }),
      );
    }
    const ids: string[] = idsString.split('-').map((id, i) => {
      if (StringUtility.isIdValid(id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g004', { id: `ids[${i}]: ${id}` }),
        );
      }
      return id;
    });
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    return await CacheControl.group.findAllById(ids);
  }

  static async count(authorization: string): Promise<number> {
    const error = HttpErrorFactory.instance('count', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    return await CacheControl.group.count();
  }

  static async add(
    authorization: string,
    data: AddGroupData,
    sid: string,
  ): Promise<Group | FSGroup> {
    const error = HttpErrorFactory.instance('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddGroupDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.WRITE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const group = GroupFactory.instance();
    group.label = data.label;
    group.name = General.labelToName(data.label);
    group.desc = data.desc;
    if (await CacheControl.group.findByName(group.name)) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('grp002', { name: group.name }),
      );
    }
    const addGroupResult = await CacheControl.group.add(group);
    if (addGroupResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp003'),
      );
    }
    SocketUtil.emit(SocketEventName.GROUP, {
      entry: {
        _id: `${group._id}`,
      },
      message: 'Group has been added.',
      source: sid,
      type: 'add',
    });
    return group;
  }

  /**
   * This method will update specified Group and it have a lot
   * of side effect. This is done to remove complex and hard work
   * from the client and to ensure that data is consistent in the
   * database. After updating the Group, `propsUpdate` method
   * will be called and it will update all Entries, Templates,
   * Groups and Widgets which are using this group.
   */
  static async update(
    authorization: string,
    data: UpdateGroupData,
    sid: string,
  ): Promise<Group | FSGroup> {
    return (await this.queueable.exec('update', 'free_one_by_one', async () => {
      const error = HttpErrorFactory.instance('update', this.logger);
      try {
        ObjectUtility.compareWithSchema(data, UpdateGroupDataSchema, 'data');
      } catch (err) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g002', {
            msg: err.message,
          }),
        );
      }
      if (StringUtility.isIdValid(data._id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g004', { id: data._id }),
        );
      }
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN],
        permission: PermissionName.WRITE,
        JWTConfig: JWTConfigService.get('user-token-config'),
      });
      if (jwt instanceof Error) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('g001', {
            msg: jwt.message,
          }),
        );
      }
      let group: Group | FSGroup;
      {
        const g = await CacheControl.group.findById(data._id);
        if (!g) {
          throw error.occurred(
            HttpStatus.NOT_FOUNT,
            ResponseCode.get('grp001', { id: data._id }),
          );
        }
        group = JSON.parse(JSON.stringify(g));
      }
      let changeDetected = false;
      if (typeof data.label !== 'undefined') {
        const name = General.labelToName(data.label);
        if (group.name !== name) {
          changeDetected = true;
          group.label = data.label;
          group.name = name;
          if (await CacheControl.group.findByName(group.name)) {
            throw error.occurred(
              HttpStatus.FORBIDDEN,
              ResponseCode.get('grp002', { name: group.name }),
            );
          }
        }
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
        const result = await PropHandler.applyPropChanges(
          group.props,
          data.propChanges,
          `(group: ${group.name}).props`,
        );
        if (result instanceof Error) {
          throw error.occurred(
            HttpStatus.BAD_REQUEST,
            ResponseCode.get('g009', {
              msg: result.message,
            }),
          );
          throw result;
        }
        group.props = result;
      }
      if (!changeDetected) {
        throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
      }
      const result = await PropHandler.testInfiniteLoop(group.props, {
        group: [
          {
            _id: `${group._id}`,
            label: group.label,
          },
        ],
      });
      if (result instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g008', {
            msg: result.message,
          }),
        );
      }
      const output = await PropHandler.propsChecker(
        group.props,
        group.props,
        'group.props',
      );
      if (output instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g007', {
            msg: output.message,
          }),
        );
      }
      const updateResult = await CacheControl.group.update(group);
      if (updateResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('grp005'),
        );
      }
      let updated: any;
      if (updateEntries) {
        // TODO: It is a very big issue if this fails because
        //        there is no mechanism to reverse the state
        //        back to pre fail state.
        try {
          updated = await this.propsUpdate(`${group._id}`, data.propChanges);
        } catch (e) {
          this.logger.error('update', e);
          throw error.occurred(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ResponseCode.get('grp007', {
              msg: e.message,
            }),
          );
        }
      }
      SocketUtil.emit(SocketEventName.GROUP, {
        entry: {
          _id: `${group._id}`,
        },
        message: {
          updated,
        },
        source: sid,
        type: 'update',
      });
      return group;
    })) as Group | FSGroup;
  }

  static async deleteById(authorization: string, id: string, sid: string) {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.DELETE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const group = await CacheControl.group.findById(id);
    if (!group) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('grp001', { id }),
      );
    }
    const deleteResult = await CacheControl.group.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp006'),
      );
    }
    let updated: any;
    // TODO: It is a very big issue if this fails because
    //        there is no mechanism to reverse the state
    //        back to pre fail state.
    try {
      updated = await this.propsUpdate(`${group._id}`, [
        {
          remove: `${group._id}`,
        },
      ]);
    } catch (e) {
      this.logger.error('update', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp007', {
          msg: e.message,
        }),
      );
    }
    SocketUtil.emit(SocketEventName.GROUP, {
      entry: {
        _id: `${group._id}`,
      },
      message: {
        updated,
      },
      source: sid,
      type: 'remove',
    });
  }

  // tslint:disable-next-line: variable-name
  private static async propsUpdate(
    // tslint:disable-next-line: variable-name
    groupId: string,
    propChanges: PropChange[],
  ): Promise<
    Array<{
      name: string;
      ids: string[];
    }>
  > {
    const updated: {
      entries: string[];
      groups: string[];
      widgets: string[];
      templates: string[];
    } = {
      entries: [],
      groups: [],
      templates: [],
      widgets: [],
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
          updated.groups.push(`${group._id}`);
          group.props = output.props;
          await CacheControl.group.update(group);
        }
      }
    }
    // Update Widgets which are using this Group.
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
          updated.widgets.push(`${widget._id}`);
          widget.props = output.props;
          await CacheControl.widget.update(widget);
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
          updated.templates.push(`${template._id}`);
          template.props = output.props;
          await CacheControl.template.update(template);
        }
      }
    }
    // Update Entries which are using this Group.
    {
      for (const i in updated.templates) {
        const entries = await CacheControl.entry.findAllByTemplateId(
          updated.templates[i],
        );
        for (const j in entries) {
          const entry: Entry | FSEntry = JSON.parse(JSON.stringify(entries[j]));
          let changeInEntry = false;
          for (const k in entry.meta) {
            const meta = entry.meta[k];
            const output = await PropHandler.propsUpdateTargetGroup(
              groupId,
              meta.props,
              propChanges,
              `(entry: ${entry.slug}).meta[${k}].props`,
            );
            if (output instanceof Error) {
              throw output;
            }
            if (output.changesFound) {
              changeInEntry = true;
              entry.meta[k].props = output.props;
            }
          }
          if (changeInEntry) {
            updated.entries.push(`${entry._id}`);
            await CacheControl.entry.update(entry);
          }
        }
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
