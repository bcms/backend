import { useObjectUtility } from '@becomes/purple-cheetah';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { useBcmsEntryRepository } from '../entry';
import { useBcmsGroupRepository } from '../group';
import { useBcmsLanguageRepository } from '../language';
import { useBcmsMediaRepository, useBcmsMediaService } from '../media';
import { useBcmsTemplateRepository } from '../template';
import {
  BCMSPropDataParsed,
  BCMSPropEntryPointerData,
  BCMSPropEntryPointerDataParsed,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropHandler,
  BCMSPropHandlerPointer,
  BCMSPropMediaData,
  BCMSPropMediaDataParsed,
  BCMSPropMediaDataSchema,
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
      const objectUtil = useObjectUtility();
      const mediaService = useBcmsMediaService();
      const mediaRepo = useBcmsMediaRepository();

      propHandler = {
        async checkPropValues({ props, values, level }) {
          if (props.length !== values.length) {
            return Error(
              `[${level}] -> props and values are not the same length.`,
            );
          }
          for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const value = values.find((e) => e.id === prop.id);
            if (!value) {
              return Error(`[${level}.${prop.name}] -> No value found.`);
            }
            switch (prop.type) {
              case BCMSPropType.STRING:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'string',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.NUMBER:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'number',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.BOOLEAN:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'boolean',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.DATE:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'number',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.ENUMERATION:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'string',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.MEDIA:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'object',
                          __content: BCMSPropMediaDataSchema,
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                }
                break;
              case BCMSPropType.GROUP_POINTER:
                {
                  const propData = prop.defaultData as BCMSPropGroupPointerData;
                  const valueData = value.data as BCMSPropValueGroupPointerData;
                  if (propData._id !== valueData._id) {
                    return Error(
                      `[${level}.${prop.name}._id] -> ` +
                        'Prop and value group pointer IDs do not match.',
                    );
                  }
                  const group = await groupRepo.findById(propData._id);
                  if (!group) {
                    return Error(
                      `[${level}.${prop.name}._id] -> ` +
                        `Group with ID ${propData._id} does not exist.`,
                    );
                  }
                  for (let j = 0; j < valueData.items.length; j++) {
                    const item = valueData.items[j];
                    const groupCheckPropValuesResult =
                      await propHandler.checkPropValues({
                        level: `${level}.${prop.name}.items.${j}`,
                        props: group.props,
                        values: item.props,
                      });
                    if (groupCheckPropValuesResult instanceof Error) {
                      return groupCheckPropValuesResult;
                    }
                  }
                }
                break;
              case BCMSPropType.ENTRY_POINTER:
                {
                  const checkData = objectUtil.compareWithSchema(
                    {
                      data: value.data,
                    },
                    {
                      data: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'string',
                        },
                      },
                    },
                    `${level}.${prop.name}`,
                  );
                  if (checkData instanceof ObjectUtilityError) {
                    return Error(
                      `[${level}.${prop.name}] -> ` + checkData.message,
                    );
                  }
                  const propData = prop.defaultData as BCMSPropEntryPointerData;
                  const valueData = value.data as string[];
                  for (let j = 0; j < valueData.length; j++) {
                    const entryId = valueData[j];
                    const entry = await entryRepo.findById(entryId);
                    if (!entry) {
                      return Error(
                        `[${level}.${prop.name}.${j}] -> ` +
                          `Entry with ID ${entryId} does not exist.`,
                      );
                    }
                    if (entry.templateId !== propData.templateId) {
                      return Error(
                        `[${level}.${prop.name}.${j}] -> ` +
                          `Entry with ID ${entryId} does not belong` +
                          ` to template "${propData.templateId}" but to` +
                          ` template "${entry.templateId}".`,
                      );
                    }
                  }
                }
                break;
              default: {
                return Error(
                  `[${level}.${prop.name}] -> Unknown prop type "${prop.type}"`,
                );
              }
            }
          }
        },
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
                prop.type === BCMSPropType.DATE
              ) {
                if (prop.array) {
                  parsed[prop.name] = value.data as string[];
                } else {
                  parsed[prop.name] = (value.data as string[])[0];
                }
              } else if (prop.type === BCMSPropType.MEDIA) {
                const valueData = value.data as BCMSPropMediaData[];
                if (prop.array) {
                  for (let j = 0; j < valueData.length; j++) {
                    const singleValueData = valueData[j];
                    if (typeof singleValueData === 'object') {
                      const media = await mediaRepo.findById(
                        singleValueData.id,
                      );
                      if (media) {
                        (parsed[prop.name] as BCMSPropMediaDataParsed) = {
                          src: await mediaService.getPath(media),
                          altText: singleValueData.altText,
                        };
                      }
                    }
                  }
                } else {
                  if (typeof valueData[0] === 'object') {
                    const media = await mediaRepo.findById(valueData[0].id);
                    if (media) {
                      (parsed[prop.name] as BCMSPropMediaDataParsed) = {
                        src: await mediaService.getPath(media),
                        altText: valueData[0].altText,
                      };
                    }
                  }
                }
              } else if (prop.type === BCMSPropType.ENUMERATION) {
                (parsed[prop.name] as BCMSPropEnumData) = {
                  items: (prop.defaultData as BCMSPropEnumData).items,
                  selected: (value.data as string[])[0],
                };
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
