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
  PropParsed,
  PropGroupPointerParsed,
} from './interfaces';
import { ObjectUtility, StringUtility } from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { PropFactory } from './factory';
import { General } from '../util';
import {
  PropQuill,
  PropQuillOption,
  PropQuillSchema,
  PropWidget,
  PropWidgetParsed,
  PropWidgetSchema,
} from './interfaces';
import { EntryParsed, EntryParser } from '../entry';

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
        case PropType.STRING: {
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
        case PropType.NUMBER: {
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
        case PropType.BOOLEAN: {
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
        case PropType.MEDIA: {
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
        case PropType.DATE: {
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
        case PropType.ENUMERATION: {
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
        case PropType.GROUP_POINTER: {
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
        case PropType.ENTRY_POINTER: {
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
        case PropType.WIDGET: {
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
    inTemplate?: boolean,
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
      if (!prop) {
        return Error(
          `[ ${level}.${i} ] --> Property is undefined.`,
        );

      }
      const propToCheck = propsToCheck.find((e) => e.name === prop.name);
      if (!propToCheck && prop.required) {
        return Error(
          `[ ${level}.${prop.name} ] --> Property "${prop.name}" does not exist.`,
        );
      }
      if (propToCheck && prop.type !== propToCheck.type) {
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
      if (propToCheck && prop.required !== propToCheck.required) {
        return Error(
          `[ ${level}.${prop.name} ] --> expected required` +
          ` property to be "${prop.required}" but got` +
          ` "${propToCheck.required}".`,
        );
      }
      if (propToCheck && prop.array !== propToCheck.array) {
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
      if (prop.required && propToCheck) {
        switch (prop.type) {
          case PropType.STRING: {
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
          case PropType.NUMBER: {
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
          case PropType.BOOLEAN: {
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
          case PropType.MEDIA: {
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
          case PropType.DATE: {
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
          case PropType.ENUMERATION: {
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
          case PropType.GROUP_POINTER: {
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
          case PropType.ENTRY_POINTER: {
            const value = propToCheck.value as PropEntryPointer;
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
            if (!inTemplate) {
              if (
                !prop.array &&
                prop.required &&
                value.entryIds.length === 0
              ) {
                return Error(
                  `[ ${level}.${prop.name}.value.entryIds ] -->` +
                  ` Property is required but ID was no0t provided.`,
                );
              }
              for (const j in value.entryIds) {
                if (StringUtility.isIdValid(value.entryIds[j]) === false) {
                  return Error(
                    `[ ${level}.${prop.name}.value.entryIds[${j}] ] -->` +
                    ` Invalid ID "${value.entryIds[j]}" was provided.`,
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
            }
            if (StringUtility.isIdValid(value.templateId) === false) {
              return Error(
                `[ ${level}.${prop.name}.value.templateId ] -->` +
                ` Invalid ID "${value.templateId}" was provided.`,
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
          case PropType.WIDGET: {
            const value = propToCheck.value as PropWidget;
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
    groupPropsChanges?: boolean,
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
            const valueChange = change.add.value as PropGroupPointer;
            if (StringUtility.isIdValid(valueChange._id) === false) {
              return Error(
                `Specified in "changes[${i}]._id", invalid` +
                ` ID "${valueChange._id}" was provided.`,
              );
            }
            const group = await CacheControl.group.findById(valueChange._id);
            if (!group) {
              return Error(
                `Specified in "changes[${i}]._id", invalid` +
                ` ID "${valueChange._id}" was provided.`,
              );
            }
            const value: PropGroupPointer = {
              _id: valueChange._id,
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
            if (change.update.enumItems) {
              (props[j].value as PropEnum).items = change.update.enumItems;
            }
            if (change.update.move !== 0) {
              if (change.update.move > 0 && j < props.length - 1) {
                const propBuffer = JSON.parse(JSON.stringify(props[j + 1]));
                props[j + 1] = JSON.parse(JSON.stringify(props[j]));
                props[j] = propBuffer;
              } else if (change.update.move < 0 && j > 0) {
                if (
                  props[0] &&
                  props[0].name === 'title' &&
                  !groupPropsChanges
                ) {
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
                true,
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

  static async parseProps(
    props: Prop[],
    lng: string,
    level?: string,
    entryPointerDepth?: number,
  ): Promise<Array<{
    quill: boolean;
    key: string;
    name: string;
    value: PropParsed;
  }>> {
    if (!level) {
      level = 'root';
    }
    if (!entryPointerDepth) {
      entryPointerDepth = 0;
    }
    const output: Array<{
      quill: boolean;
      key: string;
      name: string;
      value: PropParsed;
    }> = [];
    for (const i in props) {
      const prop = props[i];
      switch (prop.type) {
        case PropType.STRING: {
          if (prop.array) {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value as string[],
            });
          } else {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value[0],
            });
          }
        }
          break;
        case PropType.MEDIA: {
          if (prop.array) {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: (prop.value as string[]).map((e) =>
                e === '' ? '' : '/media' + e,
              ),
            });
          } else {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value:
                (prop.value[0] as string) === ''
                  ? ''
                  : (('/media' + prop.value[0]) as string),
            });
          }
        }
          break;
        case PropType.NUMBER: {
          if (prop.array) {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value as number[],
            });
          } else {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value[0],
            });
          }
        }
          break;
        case PropType.DATE: {
          if (prop.array) {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value as number[],
            });
          } else {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value[0],
            });
          }
        }
          break;
        case PropType.BOOLEAN: {
          if (prop.array) {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value as boolean[],
            });
          } else {
            output.push({
              quill: false,
              key: prop.name,
              name: prop.name,
              value: prop.value[0],
            });
          }
        }
          break;
        case PropType.ENUMERATION: {
          output.push({
            quill: false,
            key: prop.name,
            name: prop.name,
            value: prop.value as PropEnum,
          });
        }
          break;
        case PropType.GROUP_POINTER: {
          const value = prop.value as PropGroupPointer;
          const group = await CacheControl.group.findById(value._id);
          if (!group) {
            throw Error(
              `[ ${level}[${i}].value._id ] --->` +
              ` Group with ID "${value._id}" does not exist.`,
            );
          }
          const groupPointerOutput: {
            quill: boolean;
            key: string;
            name: string;
            value: PropGroupPointerParsed | PropGroupPointerParsed[];
          } = {
            quill: false,
            key: prop.name,
            name: prop.name,
            value: [],
          };
          for (const j in value.items) {
            const children = await this.parseProps(
              value.items[j].props,
              lng,
              `${level}[${i}].value.items[${j}].props`,
              entryPointerDepth,
            );
            const insert: PropGroupPointerParsed = {};
            children.forEach((child) => {
              insert[child.key] = child.value;
            });
            if (prop.array) {
              (groupPointerOutput.value as PropGroupPointerParsed[]).push(
                insert,
              );
            } else {
              groupPointerOutput.value = insert;
              break;
            }
          }
          output.push(groupPointerOutput);
        }
          break;
        case PropType.ENTRY_POINTER: {
          const value = prop.value as PropEntryPointer;
          const entryPointerOutput: {
            quill: boolean;
            key: string;
            name: string;
            value: EntryParsed | EntryParsed[] | PropEntryPointer;
          } = {
            quill: false,
            key: prop.name,
            name: prop.name,
            value: [],
          };
          if (entryPointerDepth < 1) {
            for (const j in value.entryIds) {
              if (value.entryIds[j] !== '') {
                const entry = await CacheControl.entry.findById(
                  value.entryIds[j],
                );
                // if (!entry) {
                //   throw Error(
                //     `[ ${level}[${i}].value.entryIds[${j}] ] --->` +
                //       ` Entry with ID "${value.entryIds[j]}" does not exist.`,
                //   );
                // }
                if (entry) {
                  if (!prop.array) {
                    entryPointerOutput.value = await EntryParser.parse(
                      entry,
                      lng,
                      `${level}[${i}].value.entry[${j}]`,
                      entryPointerDepth + 1,
                    );
                    break;
                  } else {
                    (entryPointerOutput.value as EntryParsed[]).push(
                      await EntryParser.parse(
                        entry,
                        lng,
                        `${level}[${i}].value.entry[${j}]`,
                        entryPointerDepth + 1,
                      ),
                    );
                  }
                }
              }
            }
          } else {
            entryPointerOutput.value = value;
          }
          output.push(entryPointerOutput);
        }
          break;
        case PropType.WIDGET: {
          const value = prop.value as PropWidget;
          const widget = await CacheControl.widget.findById(value._id);
          if (!widget) {
            throw Error(
              `[ ${level}[${i}].value._id ] --->` +
              ` Widget with ID "${value._id}" does not exist.`,
            );
          }
          const widgetPointerOutput: {
            quill: boolean;
            key: string;
            name: string;
            value: PropWidgetParsed;
          } = {
            quill: true,
            key: prop.name,
            name: General.labelToName(prop.label),
            value: {
              type: prop.type,
              value: {},
            },
          };
          const children = await this.parseProps(
            value.props,
            lng,
            `${level}[${i}].value.props`,
            entryPointerDepth,
          );
          children.forEach((child) => {
            widgetPointerOutput.value.value[child.key] = child.value;
          });
          output.push(widgetPointerOutput);
        }
          break;
        case PropType.HEADING_1: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<h1>${
                value.ops[0].insert.endsWith('\n')
                  ? value.ops[0].insert.substring(0, value.ops[0].insert.length - 1).replace(/\n/g, '<br />')
                  : value.ops[0].insert.replace(/\n/g, '<br />')
              }</h1>`,
            },
          });
        }
          break;
        case PropType.HEADING_2: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<h2>${
                value.ops[0].insert.endsWith('\n')
                  ? value.ops[0].insert.substring(0, value.ops[0].insert.length - 1).replace(/\n/g, '<br />')
                  : value.ops[0].insert.replace(/\n/g, '<br />')
              }</h2>`,
            },
          });
        }
          break;
        case PropType.HEADING_3: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<h3>${
                value.ops[0].insert.endsWith('\n')
                  ? value.ops[0].insert.substring(0, value.ops[0].insert.length - 1).replace(/\n/g, '<br />')
                  : value.ops[0].insert.replace(/\n/g, '<br />')
              }</h3>`,
            },
          });
        }
          break;
        case PropType.HEADING_4: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<h4>${
                value.ops[0].insert.endsWith('\n')
                  ? value.ops[0].insert.substring(0, value.ops[0].insert.length - 1).replace(/\n/g, '<br />')
                  : value.ops[0].insert.replace(/\n/g, '<br />')
              }</h4>`,
            },
          });
        }
          break;
        case PropType.HEADING_5: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<h5>${
                value.ops[0].insert.endsWith('\n')
                  ? value.ops[0].insert.substring(0, value.ops[0].insert.length - 1).replace(/\n/g, '<br />')
                  : value.ops[0].insert.replace(/\n/g, '<br />')
              }</h5>`,
            },
          });
        }
          break;
        case PropType.CODE: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<code>${
                value.text.endsWith('\n')
                  ? value.text.substring(0, value.text.length - 1)
                  : value.text
              }</code>`,
            },
          });
        }
          break;
        case PropType.PARAGRAPH: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<p>${this.quillOpsToValue(value.ops).replace(
                /\n/g,
                '<br></br>',
              )}</p>`,
            },
          });
        }
          break;
        case PropType.LIST: {
          const value = prop.value as PropQuill;
          output.push({
            quill: true,
            key: prop.name,
            name: prop.name,
            value: {
              type: prop.type,
              value: `<ul>${this.quillOpsListToValue(value.ops, true)}</ul>`,
            },
          });
        }
          break;
        case PropType.RICH_TEXT: {
          const value = prop.value as PropQuill;
          output.push({
            quill: false,
            key: prop.name,
            name: prop.name,
            value: `<div class="prop--${prop.name}">${value.text}</div>`,
          });
        }
          break;
      }
    }
    return output;
  }

  static quillOpsToValue(ops: PropQuillOption[]): string {
    const checker = {
      link: false,
      bold: false,
      italic: false,
      underline: false,
      list: {
        in: false,
        level: 0,
      },
      header: false,
    };
    let value = '';
    let opPointer = 0;
    while (opPointer < ops.length) {
      const op = ops[opPointer];
      if (!op.attributes) {
        if (checker.link === true) {
          checker.link = false;
          value += '</a>';
        }
        if (checker.underline === true) {
          checker.underline = false;
          value += '</u>';
        }
        if (checker.italic === true) {
          checker.italic = false;
          value += '</i>';
        }
        if (checker.bold === true) {
          checker.bold = false;
          value += '</strong>';
        }
        if (checker.list.in === true) {
          checker.list.in = false;
          value += '</ul>';
          for (let k = 0; k < checker.list.level; k = k + 1) {
            value += '</ul>';
          }
          checker.list.level = 0;
        }
      } else {
        if (op.attributes.bold) {
          if (checker.bold === false) {
            checker.bold = true;
            value += '<strong>';
          }
        } else {
          if (checker.bold === true) {
            checker.bold = false;
            value += '</strong>';
          }
        }
        if (op.attributes.italic) {
          if (checker.italic === false) {
            checker.italic = true;
            value += '<i>';
          }
        } else {
          if (checker.italic === true) {
            checker.italic = false;
            value += '</i>';
          }
        }
        if (op.attributes.underline) {
          if (checker.underline === false) {
            checker.underline = true;
            value += '<u>';
          }
        } else {
          if (checker.underline === true) {
            checker.underline = false;
            value += '</u>';
          }
        }
        if (op.attributes.link) {
          if (checker.link === false) {
            checker.link = true;
            value += `<a href="${op.attributes.link}">`;
          }
        } else {
          if (checker.link === true) {
            checker.link = false;
            value += '</a>';
          }
        }
      }
      if (op.insert.endsWith('\n')) {
        value += op.insert.substring(0, op.insert.length - 1);
      } else {
        value += op.insert;
      }
      opPointer = opPointer + 1;
    }
    if (checker.bold === true) {
      checker.bold = false;
      value += '</strong>';
    }
    if (checker.italic === true) {
      checker.italic = false;
      value += '</i>';
    }
    if (checker.underline === true) {
      checker.underline = false;
      value += '</u>';
    }
    if (checker.link === true) {
      checker.link = false;
      value += '</a>';
    }
    return value;
  }

  static quillOpsListToValue(
    ops: PropQuillOption[],
    unordered?: boolean,
  ): string {
    const topLevelTag = unordered === true ? 'ul' : 'ol';
    let value = '';
    let opPointer = 0;
    const checker = {
      atIndent: 0,
    };
    while (opPointer < ops.length) {
      const opsChunk: PropQuillOption[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (opPointer > ops.length - 1) {
          break;
        }
        const op = ops[opPointer];
        if (op.attributes && op.attributes.list) {
          if (op.attributes.indent) {
            if (op.attributes.indent > checker.atIndent) {
              checker.atIndent = op.attributes.indent;
              value += `<li><${topLevelTag}>`;
            }
          } else {
            if (checker.atIndent !== 0) {
              for (let i = 0; i < checker.atIndent; i = i + 1) {
                value += `</${topLevelTag}></li>`;
              }
              checker.atIndent = 0;
            }
          }
          value += '<li>' + this.quillOpsToValue(opsChunk) + '</li>';
          if (op.attributes.indent) {
            if (op.attributes.indent - 1 === checker.atIndent) {
              checker.atIndent = op.attributes.indent;
              value += `</${topLevelTag}></li>`;
            } else {
              for (
                let i = op.attributes.indent;
                i < checker.atIndent;
                i = i + 1
              ) {
                value += `</${topLevelTag}></li>`;
              }
              checker.atIndent = op.attributes.indent;
            }
          } else {
            for (let i = 0; i < checker.atIndent; i = i + 1) {
              value += `</${topLevelTag}></li>`;
            }
            checker.atIndent = 0;
          }
          opPointer = opPointer + 1;
          break;
        } else {
          opsChunk.push(op);
          opPointer = opPointer + 1;
        }
      }
    }
    if (checker.atIndent !== 0) {
      for (let i = 0; i < checker.atIndent; i = i + 1) {
        value += `</${topLevelTag}></li>`;
      }
      checker.atIndent = 0;
    }
    return value.replace(/<\/li><li><ul>/g, '<ul>');
  }
}
