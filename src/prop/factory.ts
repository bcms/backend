import { v4 as uuidv4 } from 'uuid';
import { BCMSPropFactory, BCMSPropType } from '../types';

export function createBcmsPropFactory(): BCMSPropFactory {
  const self: BCMSPropFactory = {
    create(type, array) {
      switch (type) {
        case BCMSPropType.STRING: {
          return self.string(array);
        }
        case BCMSPropType.NUMBER: {
          return self.number(array);
        }
        case BCMSPropType.BOOLEAN: {
          return self.bool(array);
        }
        case BCMSPropType.DATE: {
          return self.date();
        }
        case BCMSPropType.ENUMERATION: {
          return self.enum();
        }
        case BCMSPropType.MEDIA: {
          return self.media(array);
        }
        case BCMSPropType.GROUP_POINTER: {
          return self.groupPointer(array);
        }
        case BCMSPropType.ENTRY_POINTER: {
          return self.entryPointer(array);
        }
        case BCMSPropType.RICH_TEXT: {
          return self.richText(array);
        }
        default: {
          return null;
        }
        // default: {
        //   return self.richText(array);
        // }
      }
    },
    string(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.STRING,
        defaultData: [],
      };
    },
    number(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.NUMBER,
        defaultData: [],
      };
    },
    bool(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.BOOLEAN,
        defaultData: [],
      };
    },
    date(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.DATE,
        defaultData: [],
      };
    },
    enum(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.ENUMERATION,
        defaultData: {
          items: [],
        },
      };
    },
    media(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.MEDIA,
        defaultData: [],
      };
    },
    groupPointer(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.GROUP_POINTER,
        defaultData: {
          _id: '',
          items: [],
        },
      };
    },
    entryPointer(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.ENTRY_POINTER,
        defaultData: {
          templateId: '',
          entryIds: [],
          displayProp: 'title',
        },
      };
    },
    richText(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.RICH_TEXT,
        defaultData: [],
      };
    },
  };
  return self;
}
