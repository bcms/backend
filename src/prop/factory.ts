import { BCMSPropFactory, BCMSPropType } from './types';

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
          default: {
            return propFactory.entryPointer(array);
          }
          // default: {
          //   return propFactory.richText(array);
          // }
        }
      },
      string(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.STRING,
          value: [],
        };
      },
      number(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.NUMBER,
          value: [],
        };
      },
      bool(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.BOOLEAN,
          value: [],
        };
      },
      date(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.DATE,
          value: [],
        };
      },
      enum(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.ENUMERATION,
          value: {
            items: [],
          },
        };
      },
      media(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.MEDIA,
          value: [],
        };
      },
      groupPointer(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.GROUP_POINTER,
          value: {
            _id: '',
            items: [],
          },
        };
      },
      entryPointer(array) {
        return {
          name: '',
          label: '',
          array: array ? array : false,
          required: true,
          type: BCMSPropType.ENTRY_POINTER,
          value: {
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
