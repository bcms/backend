import { Prop, PropType } from './interfaces';

export class PropFactory {
  static get(type: PropType, array?: boolean): Prop {
    switch (type) {
      case PropType.STRING: {
        return this.string(array);
      }
      case PropType.NUMBER: {
        return this.number(array);
      }
      case PropType.BOOLEAN: {
        return this.bool(array);
      }
      case PropType.DATE: {
        return this.date();
      }
      case PropType.ENUMERATION: {
        return this.enum();
      }
      case PropType.MEDIA: {
        return this.media(array);
      }
      case PropType.GROUP_POINTER: {
        return this.groupPointer(array);
      }
      case PropType.ENTRY_POINTER: {
        return this.entryPointer(array);
      }
      case PropType.RICH_TEXT: {
        return this.richText(array);
      }
    }
  }
  static string(array?: boolean): Prop {
    return {
      name: 'string',
      label: 'String',
      array: array ? array : false,
      required: true,
      type: PropType.STRING,
      value: [],
    };
  }
  static number(array?: boolean): Prop {
    return {
      name: 'number',
      label: 'Number',
      array: array ? array : false,
      required: true,
      type: PropType.NUMBER,
      value: [],
    };
  }
  static bool(array?: boolean): Prop {
    return {
      name: 'boolean',
      label: 'Boolean',
      array: array ? array : false,
      required: true,
      type: PropType.BOOLEAN,
      value: [],
    };
  }
  static date(): Prop {
    return {
      name: 'date',
      label: 'Date',
      array: false,
      required: true,
      type: PropType.DATE,
      value: [],
    };
  }
  static enum(): Prop {
    return {
      name: 'enumeration',
      label: 'Enumeration',
      array: false,
      required: true,
      type: PropType.ENUMERATION,
      value: {
        items: [],
      },
    };
  }
  static media(array?: boolean): Prop {
    return {
      name: 'media',
      label: 'Media',
      array: array ? array : false,
      required: true,
      type: PropType.MEDIA,
      value: [],
    };
  }
  static groupPointer(array?: boolean): Prop {
    return {
      name: 'group-pointer',
      label: 'Group Pointer',
      array: array ? array : false,
      required: true,
      type: PropType.GROUP_POINTER,
      value: {
        _id: '',
        items: [],
      },
    };
  }
  static entryPointer(array?: boolean): Prop {
    return {
      name: 'entry-pointer',
      label: 'Entry Pointer',
      array: array ? array : false,
      required: true,
      type: PropType.ENTRY_POINTER,
      value: {
        templateId: '',
        entryIds: [],
        displayProp: 'title',
      },
    };
  }
  static richText(array?: boolean): Prop {
    return {
      name: 'rich-text',
      label: 'Rich Text',
      array: array ? array : false,
      required: true,
      type: PropType.RICH_TEXT,
      value: {
        ops: [],
        text: '',
      },
    };
  }
}
