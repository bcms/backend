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
import { PropFactory, Prop, PropHandler } from '../prop';
import { General } from '../util';

export class GroupRequestHandler {
  @CreateLogger(GroupRequestHandler)
  private static logger: Logger;

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
    return group;
  }

  static async update(
    authorization: string,
    data: UpdateGroupData,
  ): Promise<Group | FSGroup> {
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
    if (typeof data.propChanges !== 'undefined') {
      for (const i in data.propChanges) {
        const propChange = data.propChanges[i];
        if (propChange.remove) {
          updateEntries = true;
          changeDetected = true;
          group.props = group.props.filter((e) => e.name !== propChange.remove);
        } else if (propChange.add) {
          updateEntries = true;
          changeDetected = true;
          const prop: Prop = PropFactory.get(
            propChange.add.type,
            propChange.add.array,
          );
          if (!prop) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('g005', {
                type: propChange.add.type,
              }),
            );
          }
          prop.label = propChange.add.label;
          prop.name = General.labelToName(prop.label);
          prop.required = propChange.add.required;
          if (typeof propChange.add.value !== 'undefined') {
            prop.value = propChange.add.value;
          }
          if (group.props.find((e) => e.name === prop.name)) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('grp004', {
                prop: `data.propChanges[${i}]`,
                msg: `Prop with name "${prop.name}" already exist at this level.`,
              }),
            );
          }
          try {
            PropHandler.verifyValue([prop], {
              group: [
                {
                  _id:
                    typeof group._id === 'string'
                      ? group._id
                      : group._id.toHexString(),
                  label: group.name,
                },
              ],
            });
          } catch (err) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('grp004', {
                prop: `data.propChanges[${i}]`,
                msg: err.message,
              }),
            );
          }
          group.props.push(prop);
        } else if (propChange.update) {
          updateEntries = true;
          changeDetected = true;
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < group.props.length; j = j + 1) {
            if (group.props[j].label === propChange.update.label.old) {
              group.props[j].label = propChange.update.label.new;
              group.props[j].name = General.labelToName(
                propChange.update.label.new,
              );
              group.props[j].required = propChange.update.required;
              break;
            }
          }
        }
      }
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    try {
      await PropHandler.testInfiniteLoop(group.props, {
        group: [
          {
            _id:
              typeof group._id === 'string'
                ? group._id
                : group._id.toHexString(),
            label: group.name,
          },
        ],
      });
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('grp004', {
          prop: `group.props`,
          msg: e.message,
        }),
      );
    }
    try {
      group._schema = await PropHandler.propsToSchema(group.props, 'group');
    } catch (e) {
      this.logger.error('update', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('g006', {
          error: e.message,
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
    if (updateEntries) {
      // TODO: Update group in Entries.
    }
    return group;
  }

  static async deleteById(authorization: string, id: string) {
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
    // TODO: Remove group from the Entries.
  }
}
