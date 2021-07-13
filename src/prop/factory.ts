import { v4 as uuidv4 } from 'uuid';
import { BCMSPropFactory, BCMSPropType } from '../types';

let propFactory: BCMSPropFactory;

export function useBcmsPropFactory(): BCMSPropFactory {
  if (!propFactory) {
    propFactory = {
      create(type, array) {
        switch (type) {
          case BCMSPropType.STRING: {
            return propFactory.string(array);
          }
          case BCMSPropType.NUMBER: {
            return propFactory.number(array);
          }
          case BCMSPropType.BOOLEAN: {
            return propFactory.bool(array);
          }
          case BCMSPropType.DATE: {
            return propFactory.date();
          }
          case BCMSPropType.ENUMERATION: {
            return propFactory.enum();
          }
          case BCMSPropType.MEDIA: {
            return propFactory.media(array);
          }
          case BCMSPropType.GROUP_POINTER: {
            return propFactory.groupPointer(array);
          }
          case BCMSPropType.ENTRY_POINTER: {
            return propFactory.entryPointer(array);
          }
          default: {
            return null;
          }
          // default: {
          //   return propFactory.richText(array);
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
    };
  }
  return propFactory;
}
