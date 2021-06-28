import type { Module } from "@becomes/purple-cheetah/types";
import type { BCMSPropHandler, BCMSPropHandlerPointer } from "./types";

let propHandler: BCMSPropHandler;

export function useBcmsPropHandler(): BCMSPropHandler {
  return propHandler;
}

export function createBcmsPropHandler(): Module {
  return {
    name: 'Prop handler',
    initialize(moduleConfig) {
      propHandler = {
        async testInfiniteLoop(props, _pointer, level) {
          if (!level) {
            level = 'props';
          }
          for (const i in props) {
            let pointer: BCMSPropHandlerPointer;
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
      }
      moduleConfig.next();
    }
  }
}