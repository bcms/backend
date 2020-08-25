import {
  Prop,
  PropType,
  PropEntryPointer,
  PropEntryPointerSchema,
  PropEnum,
  PropEnumSchema,
  PropGroupPointer,
  PropGroupPointerSchema,
  PropMedia,
  PropMediaSchema,
} from './interfaces';
import {
  ObjectUtility,
  ObjectSchema,
  ObjectPropSchema,
} from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';

interface Pointer {
  group: Array<{
    _id: string;
    label: string;
  }>;
}

export class PropHandler {
  static async propToSchema(
    prop: Prop,
    level?: string,
  ): Promise<ObjectPropSchema> {
    if (!level) {
      level = 'prop';
    }
    switch (prop.type) {
      case PropType.STRING: {
        return {
          __type: 'array',
          __required: prop.required,
          __child: {
            __type: 'string',
          },
        };
      }
      case PropType.NUMBER: {
        return {
          __type: 'array',
          __required: prop.required,
          __child: {
            __type: 'number',
          },
        };
      }
      case PropType.BOOLEAN: {
        return {
          __type: 'array',
          __required: prop.required,
          __child: {
            __type: 'boolean',
          },
        };
      }
      case PropType.MEDIA: {
        return {
          __type: 'array',
          __required: prop.required,
          __child: {
            __type: 'string',
          },
        };
      }
      case PropType.DATE: {
        return {
          __type: 'array',
          __required: prop.required,
          __child: {
            __type: 'number',
          },
        };
      }
      case PropType.ENUMERATION: {
        return {
          __type: 'object',
          __required: prop.required,
          __child: PropEnumSchema,
        };
      }
      case PropType.GROUP_POINTER: {
        const value: PropGroupPointer = prop.value as PropGroupPointer;
        const group = await CacheControl.group.findById(value._id);
        if (!group) {
          throw new Error(
            `[ ${level}.value._id ] --> Group with ID "${value._id}" does not exist.`,
          );
        }
        return {
          __type: 'object',
          __required: prop.required,
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
                __content: group._schema,
              },
            },
          },
        };
      }
      case PropType.ENTRY_POINTER: {
        const value: PropEntryPointer = prop.value as PropEntryPointer;
        return {
          __type: 'object',
          __required: prop.required,
          __child: {
            templateId: {
              __type: 'string',
              __required: true,
            },
            displayProp: {
              __type: 'string',
              __required: true,
            },
            entryIds: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'string',
              },
            },
          },
        };
      }
    }
  }
  static async propsToSchema(
    props: Prop[],
    level?: string,
  ): Promise<ObjectSchema> {
    if (!level) {
      level = 'root';
    }
    const schema: ObjectSchema = {};
    for (const i in props) {
      const prop = props[i];
      schema[prop.name] = await this.propToSchema(prop, 'props[${i}]');
    }
    return schema;
  }
  static async testInfiniteLoop(
    props: Prop[],
    pointer?: Pointer,
    level?: string,
  ) {
    if (!level) {
      level = 'props';
    }
    if (!pointer) {
      pointer = {
        group: [],
      };
    }
    for (const i in props) {
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
              prop.label
            } ] this is forbidden since it will result in an infinite loop.`,
          );
        }
        pointer.group.push({
          _id: value._id,
          label: prop.label,
        });
        await this.testInfiniteLoop(
          group.props,
          pointer,
          `${level}[i].group.props`,
        );
      }
    }
  }
  static verifyValue(props: Prop[], pointer?: Pointer, level?: string) {
    if (!level) {
      level = 'props';
    }
    if (!pointer) {
      pointer = {
        group: [],
      };
    }
    for (const i in props) {
      const prop = props[i];
      if (typeof prop.type !== 'string') {
        throw new Error(
          `${level}[${i}].type --> Expected "string" but got "${typeof prop.type}".`,
        );
      }
      if (typeof prop.value === 'undefined') {
        throw new Error(`${level}[${i}].value --> Does not exist.`);
      }
      let schema: ObjectSchema;
      let data: any;
      let nextLevel: Array<{
        props: Prop[];
        name: string;
      }>;
      switch (prop.type) {
        case PropType.STRING:
          {
            const value = prop.value as string[];
            data = { value };
            schema = {
              value: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'string',
                },
              },
            };
          }
          break;
        case PropType.NUMBER:
          {
            const value = prop.value as number[];
            data = { value };
            schema = {
              value: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'number',
                },
              },
            };
          }
          break;
        case PropType.BOOLEAN:
          {
            data = {
              value: prop.value,
            };
            schema = {
              value: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'boolean',
                },
              },
            };
          }
          break;
        case PropType.DATE:
          {
            data = {
              value: prop.value,
            };
            schema = {
              value: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'number',
                },
              },
            };
          }
          break;
        case PropType.MEDIA:
          {
            const value = prop.value as PropMedia[];
            data = { value };
            schema = {
              value: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'object',
                  __content: PropMediaSchema,
                },
              },
            };
          }
          break;
        case PropType.ENUMERATION:
          {
            const value = prop.value as PropEnum;
            data = { value };
            schema = {
              value: {
                __type: 'object',
                __required: true,
                __child: PropEnumSchema,
              },
            };
          }
          break;
        case PropType.ENTRY_POINTER:
          {
            const value = prop.value as PropEntryPointer;
            data = { value };
            schema = {
              value: {
                __type: 'object',
                __required: true,
                __child: PropEntryPointerSchema,
              },
            };
          }
          break;
        case PropType.GROUP_POINTER:
          {
            const value = prop.value as PropGroupPointer;
            data = { value };
            schema = {
              value: {
                __type: 'object',
                __required: true,
                __child: PropGroupPointerSchema,
              },
            };
            nextLevel = value.items.map((e, j) => {
              return {
                name: `${level}[${i}].value.array[j].props`,
                props: e.props,
              };
            });
            if (value && value._id) {
              if (pointer.group.find((e) => e._id === value._id)) {
                throw new Error(
                  `Pointer loop detected: [ ${pointer.group
                    .map((e) => {
                      return e.label;
                    })
                    .join(' -> ')} -> ${
                    prop.label
                  } ] this is forbidden since it will result in an infinite loop.`,
                );
              }
              pointer.group.push({
                _id: value._id,
                label: prop.label,
              });
            }
          }
          break;
      }
      ObjectUtility.compareWithSchema(data, schema, `${level}[${i}]`);
      if (nextLevel) {
        nextLevel.forEach((e) => {
          this.verifyValue(e.props, pointer, e.name);
        });
      }
    }
  }
}
