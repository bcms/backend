import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsEntryRepository } from '../entry';
import { useBcmsGroupRepository } from '../group';
import { useBcmsLanguageRepository } from '../language';
import { useBcmsTemplateRepository } from '../template';
import {
  BCMSPropDataParsed,
  BCMSPropEntryPointerData,
  BCMSPropEntryPointerDataParsed,
  BCMSPropGroupPointerData,
  BCMSPropHandler,
  BCMSPropHandlerPointer,
  BCMSPropParsed,
  BCMSPropType,
  BCMSPropValueGroupPointerData,
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
      const entryRepo = useBcmsEntryRepository();
      const tempRepo = useBcmsTemplateRepository();
      const lngRepo = useBcmsLanguageRepository();

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
        async parse({ maxDepth, depth, meta, values, level }) {
          if (!level) {
            level = 'props';
          }
          if (!depth) {
            depth = 0;
          }
          const parsed: BCMSPropParsed = {};
          for (let i = 0; i < meta.length; i++) {
            const prop = meta[i];
            const value = values.find((e) => e.id === prop.id);
            if (value) {
              if (
                prop.type === BCMSPropType.STRING ||
                prop.type === BCMSPropType.NUMBER ||
                prop.type === BCMSPropType.BOOLEAN ||
                prop.type === BCMSPropType.DATE ||
                prop.type === BCMSPropType.ENUMERATION ||
                prop.type === BCMSPropType.MEDIA
              ) {
                if (prop.array) {
                  parsed[prop.name] = value.data as string[];
                } else {
                  parsed[prop.name] = (value.data as string[])[0];
                }
              } else if (prop.type === BCMSPropType.GROUP_POINTER) {
                const data = prop.defaultData as BCMSPropGroupPointerData;
                const valueData = value.data as BCMSPropValueGroupPointerData;
                const group = await groupRepo.findById(data._id);
                if (group) {
                  if (prop.array) {
                    parsed[prop.name] = [];
                    for (let j = 0; j < valueData.items.length; j++) {
                      const valueDataItem = valueData.items[j];
                      (parsed[prop.name] as BCMSPropDataParsed[]).push(
                        await propHandler.parse({
                          maxDepth,
                          meta: group.props,
                          values: valueDataItem.props,
                          depth,
                          level: `${level}.${prop.name}.${j}`,
                        }),
                      );
                    }
                  } else {
                    parsed[prop.name] = await propHandler.parse({
                      maxDepth,
                      meta: group.props,
                      values: valueData.items[0].props,
                      depth,
                      level: `${level}.${prop.name}`,
                    });
                  }
                }
              } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
                const data = prop.defaultData as BCMSPropEntryPointerData;
                const valueData = value.data as string[];
                if (prop.array) {
                  if (depth === maxDepth) {
                    parsed[prop.name] = valueData;
                  } else {
                    (parsed[prop.name] as BCMSPropEntryPointerDataParsed[]) =
                      [];
                    for (let j = 0; j < valueData.length; j++) {
                      const entryId = valueData[j];
                      const entry = await entryRepo.findById(entryId);
                      if (entry) {
                        const template = await tempRepo.findById(
                          data.templateId,
                        );
                        if (template) {
                          const parsedIndex = (
                            parsed[
                              prop.name
                            ] as BCMSPropEntryPointerDataParsed[]
                          ).push({});
                          for (let k = 0; k < entry.meta.length; k++) {
                            const entryMeta = entry.meta[k];
                            const lng = await lngRepo.methods.findByCode(
                              entryMeta.lng,
                            );
                            if (lng) {
                              (
                                parsed[
                                  prop.name
                                ] as BCMSPropEntryPointerDataParsed[]
                              )[parsedIndex][lng.code] =
                                await propHandler.parse({
                                  maxDepth,
                                  meta: template.props,
                                  values: entryMeta.props,
                                  depth: depth + 1,
                                  level: `${level}.${prop.name}`,
                                });
                              (
                                parsed[
                                  prop.name
                                ] as BCMSPropEntryPointerDataParsed[]
                              )[parsedIndex][lng.code]._id = entryId;
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  if (depth === maxDepth) {
                    parsed[prop.name] = valueData[0];
                  } else {
                    const entry = await entryRepo.findById(valueData[0]);
                    if (entry) {
                      const template = await tempRepo.findById(data.templateId);
                      if (template) {
                        (parsed[prop.name] as BCMSPropEntryPointerDataParsed) =
                          {};
                        for (let j = 0; j < entry.meta.length; j++) {
                          const entryMeta = entry.meta[j];
                          const lng = await lngRepo.methods.findByCode(
                            entryMeta.lng,
                          );
                          if (lng) {
                            (
                              parsed[
                                prop.name
                              ] as BCMSPropEntryPointerDataParsed
                            )[lng.code] = await propHandler.parse({
                              maxDepth,
                              meta: template.props,
                              values: entryMeta.props,
                              depth: depth + 1,
                              level: `${level}.${prop.name}`,
                            });
                            (
                              parsed[
                                prop.name
                              ] as BCMSPropEntryPointerDataParsed
                            )[lng.code]._id = valueData[0];
                          }
                        }
                      }
                    }
                  }
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
