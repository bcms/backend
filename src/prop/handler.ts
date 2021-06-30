// import { useObjectUtility, useStringUtility } from '@becomes/purple-cheetah';
import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsGroupRepository } from '../group';
// import { useBcmsTemplateRepository } from '../template';
// import { useBcmsWidgetRepository } from '../widget';
// import { useBcmsPropFactory } from './factory';
import {
  BCMSPropGroupPointerData,
  BCMSPropHandler,
  BCMSPropHandlerPointer,
  BCMSPropMediaData,
  BCMSPropParsed,
  BCMSPropType,
  BCMSPropValue,
} from './types';

let propHandler: BCMSPropHandler;

export function useBcmsPropHandler(): BCMSPropHandler {
  return propHandler;
}

export function createBcmsPropHandler(): Module {
  return {
    name: 'Prop handler',
    initialize(moduleConfig) {
      const groupRepo = useBcmsGroupRepository();
      // const widRepo = useBcmsWidgetRepository();
      // const tempRepo = useBcmsTemplateRepository();
      // const objectUtil = useObjectUtility();
      // const stringUtil = useStringUtility();
      // const propFactory = useBcmsPropFactory();

      propHandler = {
        async testInfiniteLoop(props, _pointer, level) {
          if (!level) {
            level = 'props';
          }
          for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            let pointer: BCMSPropHandlerPointer;
            if (!_pointer) {
              pointer = {
                group: [],
              };
            } else {
              pointer = JSON.parse(JSON.stringify(_pointer));
            }
            if (prop.type === BCMSPropType.GROUP_POINTER) {
              const data = prop.defaultData as BCMSPropGroupPointerData;
              const group = await groupRepo.findById(data._id);
              if (!group) {
                return Error(
                  `[ ${level}.value._id ] --> ` +
                    `Group with ID "${data._id}" does not exist.`,
                );
              }
              if (pointer.group.find((e) => e._id === data._id)) {
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
                _id: data._id,
                label: group.label,
              });
              const result = await propHandler.testInfiniteLoop(
                group.props,
                pointer,
                `${level}[i].group.props`,
              );
              if (result instanceof Error) {
                return result;
              }
            }
          }
        },
        async propsValidate(_props, _level) {
          return;
        },
        async propsChecker(_propsToCheck, _props, _level, _inTemplate) {
          return;
        },
        async applyPropChanges(props, _changes, _level, _groupPropsChanges) {
          return props;
        },
        async parse(props) {
          const parsed: BCMSPropParsed = {};
          for (let i = 0; i < props.length; i++) {
            const prop = props[i];
          }
          return parsed;
        },
        async parseValues({ maxDepth, depth, meta, values, level }) {
          if (!level) {
            level = 'props';
          }
          if (!depth) {
            depth = 0;
          }
          const parsed: BCMSPropParsed = {};
          for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const prop = meta.find((e) => e.id === value.id);
            if (prop) {
              if (
                prop.type === BCMSPropType.STRING ||
                prop.type === BCMSPropType.NUMBER ||
                prop.type === BCMSPropType.BOOLEAN ||
                prop.type === BCMSPropType.DATE ||
                prop.type === BCMSPropType.MEDIA
              ) {
                if (prop.array) {
                  parsed[prop.name] = value.data as string[];
                } else {
                  parsed[prop.name] = (value.data as string[])[0];
                }
              }
            }
          }
          return parsed;
        },
      };

      moduleConfig.next();
    },
  };
}
