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
import { ObjectUtility, ObjectSchema } from '@becomes/purple-cheetah';

export class PropHandler {
  static verifyValue(props: Prop[], level?: string) {
    if (!level) {
      level = 'props';
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
                __type: 'number',
                __required: true,
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
      }
      ObjectUtility.compareWithSchema(data, schema, `${level}[${i}]`);
      if (nextLevel) {
        nextLevel.forEach((e) => {
          this.verifyValue(e.props, e.name);
        });
      }
    }
  }
}
