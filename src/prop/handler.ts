import {
  Prop,
  PropType,
  PropEnum,
  PropGroupPointer,
  PropMedia,
  PropChange,
  PropEntryPointer,
  PropEntryPointerSchema,
  PropSchema,
  PropGroupPointerSchema,
} from './interfaces';
import { ObjectUtility, StringUtility } from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { PropFactory } from './factory';
import { General } from '../util';
import { PropQuill, PropQuillSchema } from './interfaces/quill';
import { PropWidget, PropWidgetSchema } from './interfaces/quill/widget';

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
  ): Promise<Error> {
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
          return Error(
            `[ ${level}.value._id ] --> Group with ID "${value._id}" does not exist.`,
          );
        }
        if (pointer.group.find((e) => e._id === value._id)) {
          return Error(
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
        const result = await this.testInfiniteLoop(
          group.props,
          pointer,
          `${level}[i].group.props`,
        );
        if (result instanceof Error) {
          return result;
        }
      }
    }
  }
  static async propsValidate(props: Prop[], level?: string) {
    if (!level) {
      level = 'root';
    }
    if (!(props instanceof Array)) {
      return Error(`[ ${level} ] --> "props" must be an array.`);
    }
    for (const i in props) {
      const prop = props[i];
      try {
        ObjectUtility.compareWithSchema(prop, PropSchema, `${level}[${i}]`);
      } catch (error) {
        return error;
      }
      if (!PropType[prop.type]) {
        return Error(
          `[ ${level}[${i}] ] --> Property type` +
            ` "${prop.type}" is not supported.`,
        );
      }
      switch (prop.type) {
        case PropType.STRING:
          {
            const value = prop.value as string[];
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
                `${level}[i].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.NUMBER:
          {
            const value = prop.value as number[];
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
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.BOOLEAN:
          {
            const value = prop.value as boolean[];
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
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.MEDIA:
          {
            const value = prop.value as PropMedia[];
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
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.DATE:
          {
            const value = prop.value as number[];
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
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.ENUMERATION:
          {
            const value = prop.value as PropEnum;
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
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
          }
          break;
        case PropType.GROUP_POINTER:
          {
            const value = prop.value as PropGroupPointer;
            try {
              ObjectUtility.compareWithSchema(
                { value },
                {
                  value: {
                    __type: 'object',
                    __required: true,
                    __child: PropGroupPointerSchema,
                  },
                },
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
            if (StringUtility.isIdValid(value._id) === false) {
              return Error(`[ ${level}[${i}].value._id ] --> invalid value.`);
            }
            const group = await CacheControl.group.findById(value._id);
            if (!group) {
              return Error(
                `[ ${level}[${i}].value._id ] --> Group with ID` +
                  ` "${value._id}" does not exist.`,
              );
            }
            if (value.items.length === 0 && prop.array === false) {
              return Error(
                `[ ${level}[${i}].value.items ] --> Must have` +
                  ` at least 1 item but got 0.`,
              );
            }
            for (const j in value.items) {
              const toCheckGroupProps = value.items[j].props;
              const result = await this.propsChecker(
                toCheckGroupProps,
                group.props,
                `${level}[${i}].value.items[${j}]`,
              );
              if (result instanceof Error) {
                return result;
              }
            }
          }
          break;
        case PropType.ENTRY_POINTER:
          {
            const value = prop.value as PropEntryPointer;
            try {
              ObjectUtility.compareWithSchema(
                { value },
                {
                  value: {
                    __type: 'object',
                    __required: true,
                    __child: PropEntryPointerSchema,
                  },
                },
                `${level}[${i}].value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
            for (const j in value.entryIds) {
              if (StringUtility.isIdValid(value.entryIds[j]) === false) {
                return Error(
                  `[ ${level}[${i}].value.entryIds[${j}] ] -->` +
                    ` invalid ID "${value.entryIds[j]}" was provided.`,
                );
              }
              const entry = await CacheControl.entry.findById(
                value.entryIds[j],
              );
              if (!entry) {
                return Error(
                  `[ ${level}[${i}].value.entryIds[${j}] ] -->` +
                    ` entry with ID "${value.entryIds[j]}" does not exist.`,
                );
              }
            }
            if (StringUtility.isIdValid(value.templateId) === false) {
              return Error(
                `[ ${level}[${i}].value.templateId ] -->` +
                  ` invalid ID "${value.templateId}" was provided.`,
              );
            }
            const template = await CacheControl.template.findById(
              value.templateId,
            );
            if (!template) {
              return Error(
                `[ ${level}[${i}].value.templateId ] -->` +
                  ` template with ID "${value.templateId}" does not exist.`,
              );
            }
            const displayPropChecker = template.props.find(
              (e) => e.name === value.displayProp && e.type === PropType.STRING,
            );
            if (!displayPropChecker) {
              return Error(
                `[ ${level}[${i}].value.displayProp ] -->` +
                  ` property with name "${value.displayProp}" does not exist` +
                  ` in template "${value.templateId}".`,
              );
            }
          }
          break;
        case PropType.WIDGET:
          {
            const value = prop.value as PropWidget;
            try {
              ObjectUtility.compareWithSchema(
                {
                  value,
                },
                {
                  value: {
                    __type: 'object',
                    __required: true,
                    __child: PropWidgetSchema,
                  },
                },
                `${level}.${prop.name}.value`,
              );
            } catch (e) {
              return Error(`[ ${level}[${i}] ] --> ${e.message}`);
            }
            if (StringUtility.isIdValid(value._id) === false) {
              return Error(
                `[ ${level}[${i}].value._id ] -->` +
                  ` invalid ID "${value._id}" was provided.`,
              );
            }
            const widget = await CacheControl.widget.findById(value._id);
            if (!widget) {
              return Error(
                `[ ${level}[${i}].value._id ] -->` +
                  ` widget with ID "${value._id}" does not exist.`,
              );
            }
            const result = this.propsChecker(
              value.props,
              widget.props,
              `${level}[${i}].value.props`,
            );
            if (result instanceof Error) {
              return result;
            }
          }
          break;
        default: {
          const value = prop.value as PropQuill;
          try {
            ObjectUtility.compareWithSchema(
              {
                value,
              },
              {
                value: {
                  __type: 'object',
                  __required: true,
                  __child: PropQuillSchema,
                },
              },
              `${level}[${i}].value`,
            );
          } catch (e) {
            return Error(`[ ${level}[${i}] ] --> ${e.message}`);
          }
        }
      }
    }
  }
  static async propsChecker(
    propsToCheck: Prop[],
    props: Prop[],
    level?: string,
  ): Promise<Error> {
    if (!level) {
      level = 'root';
    }
    if (!(propsToCheck instanceof Array)) {
      return Error(`[ ${level} ] --> "propsToCheck" must be an array.`);
    }
    if (!(props instanceof Array)) {
      return Error(`[ ${level} ] --> "props" must be an array.`);
    }
    for (const i in props) {
      const prop = props[i];
      const propToCheck = propsToCheck.find((e) => e.name === prop.name);
      if (!propToCheck && prop.required) {
        return Error(
          `[ ${level}.${prop.name} ] --> Property "${prop.name}" does not exist.`,
        );
      }
      if (prop.type !== propToCheck.type) {
        return Error(
          `[ ${level}.${prop.name} ] --> Type mismatch, expected` +
            ` "${prop.type}" but got "${propToCheck.type}".`,
        );
      }
      if (!PropType[prop.type]) {
        return Error(
          `[ ${level}.${prop.name} ] --> Property type` +
            ` "${prop.type}" is not supported.`,
        );
      }
      if (prop.required !== propToCheck.required) {
        return Error(
          `[ ${level}.${prop.name} ] --> expected required` +
            ` property to be "${prop.required}" but got` +
            ` "${propToCheck.required}".`,
        );
      }
      if (prop.array !== propToCheck.array) {
        return Error(
          `[ ${level}.${prop.name} ] --> expected array` +
            ` property to be "${prop.array}" but got` +
            ` "${propToCheck.array}".`,
        );
      }
      if (!prop.value) {
        return Error(
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
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
                        __type: 'string',
                      },
                    },
                  },
                  `${level}.${prop.name}`,
                );
              } catch (e) {
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
            }
            break;
          case PropType.GROUP_POINTER:
            {
              const valueToCheck = propToCheck.value as PropGroupPointer;
              try {
                ObjectUtility.compareWithSchema(
                  { value: valueToCheck },
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
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
              if (StringUtility.isIdValid(valueToCheck._id) === false) {
                return Error(
                  `[ ${level}.${prop.name}.value._id ] --> invalid value.`,
                );
              }
              const group = await CacheControl.group.findById(valueToCheck._id);
              if (!group) {
                return Error(
                  `[ ${level}.${prop.name}.value._id ] --> Group with ID` +
                    ` "${valueToCheck._id}" does not exist.`,
                );
              }
              if (valueToCheck.items.length === 0) {
                return Error(
                  `[ ${level}.${prop.name}.value.items ] --> Must have` +
                    ` at least 1 item but got 0.`,
                );
              }
              for (const j in valueToCheck.items) {
                const toCheckGroupProps = valueToCheck.items[j].props;
                const result = await this.propsChecker(
                  toCheckGroupProps,
                  group.props,
                  `${level}.${prop.name}.value.items[${j}]`,
                );
                if (result instanceof Error) {
                  return result;
                }
              }
            }
            break;
          case PropType.ENTRY_POINTER:
            {
              const value = prop.value as PropEntryPointer;
              try {
                ObjectUtility.compareWithSchema(
                  { value },
                  {
                    value: {
                      __type: 'object',
                      __required: true,
                      __child: PropEntryPointerSchema,
                    },
                  },
                  `${level}.${prop.name}.value`,
                );
              } catch (e) {
                return Error(`[ ${level}.${prop.name} ] --> ${e.message}`);
              }
              for (const j in value.entryIds) {
                if (StringUtility.isIdValid(value.entryIds[j]) === false) {
                  return Error(
                    `[ ${level}.${prop.name}.value.entryIds[${j}] ] -->` +
                      ` invalid ID "${value.entryIds[j]}" was provided.`,
                  );
                }
                const entry = await CacheControl.entry.findById(
                  value.entryIds[j],
                );
                if (!entry) {
                  return Error(
                    `[ ${level}.${prop.name}.value.entryIds[${j}] ] -->` +
                      ` entry with ID "${value.entryIds[j]}" does not exist.`,
                  );
                }
              }
              if (StringUtility.isIdValid(value.templateId) === false) {
                return Error(
                  `[ ${level}.${prop.name}.value.templateId ] -->` +
                    ` invalid ID "${value.templateId}" was provided.`,
                );
              }
              const template = await CacheControl.template.findById(
                value.templateId,
              );
              if (!template) {
                return Error(
                  `[ ${level}.${prop.name}.value.templateId ] -->` +
                    ` template with ID "${value.templateId}" does not exist.`,
                );
              }
              const displayPropChecker = template.props.find(
                (e) =>
                  e.name === value.displayProp && e.type === PropType.STRING,
              );
              if (!displayPropChecker) {
                return Error(
                  `[ ${level}.${prop.name}.value.displayProp ] -->` +
                    ` property with name "${value.displayProp}" does not exist` +
                    ` in template "${value.templateId}".`,
                );
              }
            }
            break;
          case PropType.WIDGET:
            {
              const value = prop.value as PropWidget;
              try {
                ObjectUtility.compareWithSchema(
                  {
                    value,
                  },
                  {
                    value: {
                      __type: 'object',
                      __required: true,
                      __child: PropWidgetSchema,
                    },
                  },
                  `${level}.${prop.name}.value`,
                );
              } catch (e) {
                return Error(`[ ${level}[${i}] ] --> ${e.message}`);
              }
              if (StringUtility.isIdValid(value._id) === false) {
                return Error(
                  `[ ${level}.${prop.name}.value._id ] -->` +
                    ` invalid ID "${value._id}" was provided.`,
                );
              }
              const widget = await CacheControl.widget.findById(value._id);
              if (!widget) {
                return Error(
                  `[ ${level}.${prop.name}.value._id ] -->` +
                    ` widget with ID "${value._id}" does not exist.`,
                );
              }
              const result = this.propsChecker(
                value.props,
                widget.props,
                `${level}.${prop.name}.value.props`,
              );
              if (result instanceof Error) {
                return result;
              }
            }
            break;
          default: {
            const value = prop.value as PropQuill;
            try {
              ObjectUtility.compareWithSchema(
                {
                  value,
                },
                {
                  value: {
                    __type: 'object',
                    __required: true,
                    __child: PropQuillSchema,
                  },
                },
                `${level}.${prop.name}.value`,
              );
            } catch (e) {
              return e;
            }
          }
        }
      }
    }
  }
  static async applyPropChanges(
    // tslint:disable-next-line: variable-name
    _props: Prop[],
    changes: PropChange[],
    level?: string,
  ): Promise<Prop[] | Error> {
    if (!level) {
      level = 'props';
    }
    let props: Prop[] = JSON.parse(JSON.stringify(_props));
    if (!(changes instanceof Array)) {
      return Error('Parameter "changes" must be an array.');
    }
    for (const i in changes) {
      const change = changes[i];
      if (typeof change.remove === 'string') {
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
                  const result = await this.applyPropChanges(
                    value.items[k].props,
                    [
                      {
                        remove: change.remove,
                      },
                    ],
                    `${level}[${j}].value.items[k].props`,
                  );
                  if (result instanceof Error) {
                    return Error(
                      `Error at "changes[${i}].remove, ${result.message}"`,
                    );
                  }
                  (props[j].value as PropGroupPointer).items[k].props = result;
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
      } else if (typeof change.add === 'object') {
        const prop: Prop = PropFactory.get(change.add.type, change.add.array);
        if (!prop) {
          return Error(
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
              return Error(
                `Specified in "changes[${i}]._id", invalid` +
                  ` ID "${change.add.value._id}" was provided.`,
              );
            }
            const group = await CacheControl.group.findById(
              change.add.value._id,
            );
            if (!group) {
              return Error(
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
          return Error(
            `Prop with name "${prop.name}" already exist at this level in "${level}"`,
          );
        }
        props.push(prop);
      } else if (typeof change.update === 'object') {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < props.length; j = j + 1) {
          if (props[j].label === change.update.label.old) {
            if (change.update.label.old !== change.update.label.new) {
              if (props.find((e) => e.label === change.update.label.new)) {
                return Error(
                  `Prop with name "${General.labelToName(
                    change.update.label.new,
                  )}" already exist at this level "${level}", error in "changes[${i}].update".`,
                );
              }
            }
            props[j].label = change.update.label.new;
            props[j].name = General.labelToName(change.update.label.new);
            props[j].required = change.update.required;
            if (change.update.move !== 0) {
              if (change.update.move > 0 && j < props.length - 1) {
                const propBuffer = JSON.parse(JSON.stringify(props[j + 1]));
                props[j + 1] = JSON.parse(JSON.stringify(props[j]));
                props[j] = propBuffer;
              } else if (change.update.move < 0 && j > 0) {
                if (props[0] && props[0].name === 'title') {
                  if (j > 2) {
                    const propBuffer = JSON.parse(JSON.stringify(props[j - 1]));
                    props[j - 1] = JSON.parse(JSON.stringify(props[j]));
                    props[j] = propBuffer;
                  }
                } else {
                  const propBuffer = JSON.parse(JSON.stringify(props[j - 1]));
                  props[j - 1] = JSON.parse(JSON.stringify(props[j]));
                  props[j] = propBuffer;
                }
              }
            }
            break;
          }
        }
      } else {
        return Error(`(${level}) --> changes[${i}]`);
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
  ): Promise<{ changesFound: boolean; props: Prop[] } | Error> {
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
              const result = await this.applyPropChanges(
                value.items[j].props,
                changes,
                `${level}[${i}].value.items[${j}].props`,
              );
              if (result instanceof Error) {
                return Error(
                  `Error at "props[${i}].value.items[j]" --> ${result.message}`,
                );
              }
              (props[i].value as PropGroupPointer).items[j].props = result;
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
            if (output instanceof Error) {
              return output;
            }
            if (!changesFound) {
              changesFound = output.changesFound;
            }
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
