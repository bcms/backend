import {
  Prop,
  PropType,
  PropEnum,
  PropGroupPointer,
  PropMedia,
  PropChange,
} from './interfaces';
import { ObjectUtility, StringUtility } from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { PropFactory } from './factory';
import { General } from '../util';

interface Pointer {
  group: Array<{
    _id: string;
    label: string;
  }>;
}

export class PropHandler {
  static async testInfiniteLoop(
    props: Prop[],
    // tslint:disable-next-line: variable-name
    _pointer?: Pointer,
    level?: string,
  ) {
    if (!level) {
      level = 'props';
    }
    for (const i in props) {
      let pointer: Pointer;
      if (!_pointer) {
        pointer = {
          group: [],
        };
      } else {
        pointer = JSON.parse(JSON.stringify(_pointer));
      }
      const prop = props[i];
      if (prop.type === PropType.GROUP_POINTER) {
        const value = prop.value as PropGroupPointer;
        const group = await CacheControl.group.findById(value._id);
        if (!group) {
          throw new Error(
            `[ ${level}.value._id ] --> Group with ID "${value._id}" does not exist.`,
          );
        }
        if (pointer.group.find((e) => e._id === value._id)) {
          throw new Error(
            `Pointer loop detected: [ ${pointer.group
              .map((e) => {
                return e.label;
              })
              .join(' -> ')} -> ${
              group.label
            } ] this is forbidden since it will result in an infinite loop.`,
          );
        }
        pointer.group.push({
          _id: value._id,
          label: group.label,
        });
        await this.testInfiniteLoop(
          group.props,
          pointer,
          `${level}[i].group.props`,
        );
      }
    }
  }
  static async propsChecker(
    propsToCheck: Prop[],
    props: Prop[],
    level?: string,
  ) {
    if (!level) {
      level = 'root';
    }
    if (!(propsToCheck instanceof Array)) {
      throw new Error(`[ ${level}] --> "propsToCheck" must be an array.`);
    }
    if (!(props instanceof Array)) {
      throw new Error(`[ ${level}] --> "props" must be an array.`);
    }
    for (const i in props) {
      const prop = props[i];
      const propToCheck = propsToCheck.find((e) => e.name === prop.name);
      if (!propToCheck && prop.required) {
        throw new Error(
          `[ ${level}.${prop.name} ] --> Property "${prop.name}" does not exist.`,
        );
      }
      if (prop.type !== propToCheck.type) {
        throw new Error(
          `[ ${level}.${prop.name} ] --> Type mismatch, expected` +
            ` "${prop.type}" but got "${propToCheck.type}".`,
        );
      }
      if (prop.required !== propToCheck.required) {
        throw new Error(
          `[ ${level}.${prop.name} ] --> expected required` +
            ` property to be "${prop.required}" but got` +
            ` "${propToCheck.required}".`,
        );
      }
      if (prop.array !== propToCheck.array) {
        throw new Error(
          `[ ${level}.${prop.name} ] --> expected array` +
            ` property to be "${prop.array}" but got` +
            ` "${propToCheck.array}".`,
        );
      }
      if (!prop.value) {
        throw new Error(
          `[ ${level}.${prop.name} ] --> value property does not exist.`,
        );
      }
      if (prop.required) {
        switch (prop.type) {
          case PropType.STRING:
            {
              const value = propToCheck.value as string[];
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'array',
                      __required: true,
                      __child: {
                        __type: 'string',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.NUMBER:
            {
              const value = propToCheck.value as number[];
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'array',
                      __required: true,
                      __child: {
                        __type: 'number',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.BOOLEAN:
            {
              const value = propToCheck.value as boolean[];
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'array',
                      __required: true,
                      __child: {
                        __type: 'boolean',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.MEDIA:
            {
              const value = propToCheck.value as PropMedia[];
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'array',
                      __required: true,
                      __child: {
                        __type: 'number',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.DATE:
            {
              const value = propToCheck.value as number[];
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'array',
                      __required: true,
                      __child: {
                        __type: 'number',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.ENUMERATION:
            {
              const value = propToCheck.value as PropEnum;
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'object',
                      __required: true,
                      __child: {
                        items: {
                          __type: 'array',
                          __required: true,
                          __child: {
                            __type: 'string',
                          },
                        },
                        selected: {
                          __type: 'string',
                          __required: false,
                        },
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.GROUP_POINTER:
            {
              const value = propToCheck.value as PropGroupPointer;
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'object',
                      __required: true,
                      __child: {
                        _id: {
                          __type: 'string',
                          __required: true,
                        },
                        items: {
                          __type: 'array',
                          __required: true,
                          __child: {
                            __type: 'object',
                            __content: {},
                          },
                        },
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                throw new Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
              if (StringUtility.isIdValid(value._id) === false) {
                throw new Error(
                  `[ ${level}.${prop.name}.value._id ] --> invalid value.`,
                );
              }
              const group = await CacheControl.group.findById(value._id);
              if (!group) {
                throw new Error(
                  `[ ${level}.${prop.name}.value._id ] --> Group with ID` +
                    ` "${value._id}" does not exist.`,
                );
              }
              if (value.items.length === 0) {
                throw new Error(
                  `[ ${level}.${prop.name}.value.items ] --> Must have` +
                    ` at least 1 item but got 0.`,
                );
              }
              for (const j in value.items) {
                const toCheckGroupProps = value.items[j].props;
                await this.propsChecker(
                  toCheckGroupProps,
                  group.props,
                  `${level}.${prop.name}.value.items[${j}]`,
                );
              }
            }
            break;
          case PropType.ENTRY_POINTER:
            {
            }
            break;
        }
      }
    }
  }
  static async applyPropChanges(
    // tslint:disable-next-line: variable-name
    _props: Prop[],
    changes: PropChange[],
  ): Promise<Prop[]> {
    let props: Prop[] = JSON.parse(JSON.stringify(_props));
    if (!(changes instanceof Array)) {
      throw new Error('Parameter "changes" must be an array.');
    }
    for (const i in changes) {
      const change = changes[i];
      if (change.remove) {
        // Check if Group is removed
        if (StringUtility.isIdValid(change.remove)) {
          const removeProps: string[] = [];
          for (const j in props) {
            const prop = props[j];
            if (prop.type === PropType.GROUP_POINTER) {
              const value = prop.value as PropGroupPointer;
              if (value._id === change.remove) {
                removeProps.push(value._id);
              } else {
                for (const k in value.items) {
                  try {
                    (props[j].value as PropGroupPointer).items[
                      k
                    ].props = await this.applyPropChanges(
                      value.items[k].props,
                      [
                        {
                          remove: change.remove,
                        },
                      ],
                    );
                  } catch (e) {
                    throw new Error(
                      `Error at "changes[${i}].remove, ${e.message}"`,
                    );
                  }
                }
              }
            }
          }
          props = props.filter((e) =>
            removeProps.includes((e.value as PropGroupPointer)._id),
          );
        } else {
          props = props.filter((e) => e.name !== change.remove);
        }
      } else if (change.add) {
        const prop: Prop = PropFactory.get(change.add.type, change.add.array);
        if (!prop) {
          throw new Error(
            `Invalid property type "${change.add.type}"` +
              ` was provided as "changes[${i}].add.type".`,
          );
        }
        prop.label = change.add.label;
        prop.name = General.labelToName(prop.label);
        prop.required = change.add.required;
        if (typeof change.add.value !== 'undefined') {
          if (prop.type === PropType.GROUP_POINTER) {
            if (StringUtility.isIdValid(change.add.value._id) === false) {
              throw new Error(
                `Specified in "changes[${i}]._id", invalid` +
                  ` ID "${change.add.value._id}" was provided.`,
              );
            }
            const group = await CacheControl.group.findById(
              change.add.value._id,
            );
            if (!group) {
              throw new Error(
                `Specified in "changes[${i}]._id", invalid` +
                  ` ID "${change.add.value._id}" was provided.`,
              );
            }
            const value: PropGroupPointer = {
              _id: change.add.value._id,
              items: [
                {
                  props: group.props,
                },
              ],
            };
            prop.value = value;
          } else {
            prop.value = change.add.value;
          }
        }
        if (props.find((e) => e.name === prop.name)) {
          throw new Error(
            `Error at "changes[${i}].add".` +
              ` Prop with name "${prop.name}" already exist at this level.`,
          );
        }
        props.push(prop);
      } else if (change.update) {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < props.length; j = j + 1) {
          if (props[j].label === change.update.label.old) {
            props[j].label = change.update.label.new;
            props[j].name = General.labelToName(change.update.label.new);
            props[j].required = change.update.required;

            break;
          }
        }
      } else {
        throw new Error(`changes[${i}]`);
      }
    }
    return props;
  }
  /**
   * Update properties `_props` with changes due to
   * Group change.
   */
  static async propsUpdateTargetGroup(
    targetGroupId: string,
    // tslint:disable-next-line: variable-name
    _props: Prop[],
    changes: PropChange[],
    level?: string,
  ): Promise<{ changesFound: boolean; props: Prop[] }> {
    if (!level) {
      level = 'props';
    }
    let changesFound = false;
    let props: Prop[] = JSON.parse(JSON.stringify(_props));
    const removeGroupProps: string[] = [];
    for (const i in props) {
      const prop = props[i];
      if (prop.type === PropType.GROUP_POINTER) {
        const value = prop.value as PropGroupPointer;
        if (value._id === targetGroupId) {
          changesFound = true;
          let removeGroup = false;
          for (const j in changes) {
            const change = changes[j];
            if (change.remove && StringUtility.isIdValid(change.remove)) {
              if (change.remove === value._id) {
                removeGroup = true;
                removeGroupProps.push(value._id);
              }
            }
          }
          if (!removeGroup) {
            for (const j in value.items) {
              try {
                (props[i].value as PropGroupPointer).items[
                  j
                ].props = await this.applyPropChanges(
                  value.items[j].props,
                  changes,
                );
              } catch (e) {
                throw new Error(`Error at "props[${i}].value.items[j]" --> `);
              }
            }
          }
        } else {
          for (const j in value.items) {
            const output = await this.propsUpdateTargetGroup(
              targetGroupId,
              value.items[j].props,
              changes,
              `props[${i}].value.items[j]`,
            );
            changesFound = output.changesFound;
            (props[i].value as PropGroupPointer).items[j].props = output.props;
          }
        }
      }
    }
    if (removeGroupProps.length > 0) {
      const buffer: Prop[] = [];
      for (const i in props) {
        const prop = props[i];
        if (
          prop.type !== PropType.GROUP_POINTER ||
          !removeGroupProps.includes((prop.value as PropGroupPointer)._id)
        ) {
          buffer.push(prop);
        }
      }
      props = buffer;
    }
    return { changesFound, props };
  }
}
