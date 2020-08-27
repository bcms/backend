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
            }
            break;
          case PropType.NUMBER:
            {
              const value = propToCheck.value as number[];
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
            }
            break;
          case PropType.BOOLEAN:
            {
              const value = propToCheck.value as boolean[];
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
            }
            break;
          case PropType.MEDIA:
            {
              const value = propToCheck.value as PropMedia[];
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
            }
            break;
          case PropType.DATE:
            {
              const value = propToCheck.value as number[];
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
            }
            break;
          case PropType.ENUMERATION:
            {
              const value = propToCheck.value as PropEnum;
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
            }
            break;
          case PropType.GROUP_POINTER:
            {
              const value = propToCheck.value as PropGroupPointer;
              ObjectUtility.compareWithSchema(
                { value },
                {
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
                `${level}.${prop.name}`,
              );
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
              for (const j in value.items) {
                const toCheckGroupProps = value.items[i].props;
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
  // tslint:disable-next-line: variable-name
  static applyPropChanges(_props: Prop[], changes: PropChange[]): Prop[] {
    let props = JSON.parse(JSON.stringify(_props));
    for (const i in changes) {
      const change = changes[i];
      if (change.remove) {
        props = props.filter((e) => e.name !== change.remove);
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
          prop.value = change.add.value;
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
  static propsUpdateTargetGroup(
    targetGroupId: string,
    // tslint:disable-next-line: variable-name
    _props: Prop[],
    changes: PropChange[],
    level?: string,
  ): { changesFound: boolean; props: Prop[] } {
    if (!level) {
      level = 'props';
    }
    let changesFound = false;
    const props: Prop[] = JSON.parse(JSON.stringify(_props));
    for (const i in props) {
      const prop = props[i];
      if (prop.type === PropType.GROUP_POINTER) {
        const value = prop.value as PropGroupPointer;
        if (value._id === targetGroupId) {
          changesFound = true;
          for (const j in value.items) {
            try {
              (props[i].value as PropGroupPointer).items[
                j
              ].props = this.applyPropChanges(value.items[j].props, changes);
            } catch (e) {
              throw new Error(`Error at "props[${i}].value.items[j]" --> `);
            }
          }
        } else {
          for (const j in value.items) {
            const output = this.propsUpdateTargetGroup(
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
    return { changesFound, props };
  }
}
