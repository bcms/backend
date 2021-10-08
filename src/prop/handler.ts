import { BCMSFactory } from '@bcms/factory';
import { BCMSMediaService } from '@bcms/media';
import { BCMSRepo } from '@bcms/repo';
import { BCMSSocketManager } from '@bcms/socket';
import { useObjectUtility, useStringUtility } from '@becomes/purple-cheetah';
import {
  Module,
  ObjectUtility,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import {
  BCMSProp,
  BCMSPropChangeUpdate,
  BCMSPropDataParsed,
  BCMSPropEntryPointerData,
  BCMSPropEntryPointerDataParsed,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropHandler as BCMSPropHandlerType,
  BCMSPropHandlerPointer,
  BCMSPropMediaData,
  BCMSPropMediaDataParsed,
  BCMSPropParsed,
  BCMSPropType,
  BCMSPropValueGroupPointerData,
  BCMSSocketEventType,
  BCMSWidgetCross,
  BCMSGroupCross,
  BCMSTemplateCross,
} from '../types';

let objectUtil: ObjectUtility;
let stringUtil: StringUtility;

export const BCMSPropHandler: BCMSPropHandlerType = {
  async checkPropValues({ props, values, level }) {
    if (props.length !== values.length) {
      return Error(`[${level}] -> props and values are not the same length.`);
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
                    __type: 'string',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
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
            const group = await BCMSRepo.group.findById(propData._id);
            if (!group) {
              return Error(
                `[${level}.${prop.name}._id] -> ` +
                  `Group with ID ${propData._id} does not exist.`,
              );
            }
            for (let j = 0; j < valueData.items.length; j++) {
              const item = valueData.items[j];
              const groupCheckPropValuesResult =
                await BCMSPropHandler.checkPropValues({
                  level: `${level}.${prop.name}.items.${j}.props`,
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
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
            const propData = prop.defaultData as BCMSPropEntryPointerData;
            const valueData = value.data as string[];
            for (let j = 0; j < valueData.length; j++) {
              const entryId = valueData[j];
              if (entryId) {
                const entry = await BCMSRepo.entry.findById(entryId);
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
          }
          break;
        case BCMSPropType.RICH_TEXT: {
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
                  __content: {
                    nodes: {
                      __type: "array",
                      __required: true,
                      __child: {
                        __type: 'object',
                        __content: {}
                      }
                    }
                  }
                },
              },
            },
            `${level}.${prop.name}`,
          );
          if (checkData instanceof ObjectUtilityError) {
            return Error(`[${level}.${prop.name}] -> ` + checkData.message);
          }
        } break;
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
        const group = await BCMSRepo.group.findById(data._id);
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
        const result = await BCMSPropHandler.testInfiniteLoop(
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
  async propsChecker(_propsToCheck, _props, _level, _inTemplate) {
    // TODO: Implement logic
    return;
  },
  async applyPropChanges(_props, changes, level) {
    if (!level) {
      level = 'props';
    }
    const props: BCMSProp[] = JSON.parse(JSON.stringify(_props));
    if (!(changes instanceof Array)) {
      return Error('Parameter "changes" must be an array.');
    }
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (typeof change.remove === 'string') {
        const propToRemoveIndex = props.findIndex(
          (e) => e.id === change.remove,
        );
        if (props[0].name === 'title') {
          if (propToRemoveIndex > 1) {
            props.splice(propToRemoveIndex, 1);
          }
        } else {
          props.splice(propToRemoveIndex, 1);
        }
      } else if (typeof change.add === 'object') {
        const prop = BCMSFactory.prop.create(change.add.type, change.add.array);
        if (!prop) {
          return Error(
            `Invalid property type "${change.add.type}"` +
              ` was provided as "changes[${i}].add.type".`,
          );
        }
        prop.label = change.add.label;
        prop.name = stringUtil.toSlugUnderscore(prop.label);
        prop.required = change.add.required;
        if (props.find((e) => e.name === prop.name)) {
          return Error(
            `[${level}] -> Prop with name "${prop.name}" already exists.`,
          );
        }
        if (prop.type === BCMSPropType.GROUP_POINTER) {
          const changeData = change.add.defaultData as BCMSPropGroupPointerData;
          if (!changeData || !changeData._id) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop "_id".`,
            );
          }
          const group = await BCMSRepo.group.findById(changeData._id);
          if (!group) {
            return Error(
              `[${level}.change.${i}.add.defaultData._id] ->` +
                ` Group with ID "${changeData._id}" does not exist.`,
            );
          }
          (prop.defaultData as BCMSPropGroupPointerData) = {
            _id: changeData._id,
          };
        } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
          const changeData = change.add.defaultData as BCMSPropEntryPointerData;
          if (!changeData || !changeData.templateId) {
            return Error(
              `[${level}.change.${i}.add.defaultData] ->` +
                ` Missing prop "templateId".`,
            );
          }
          const template = await BCMSRepo.template.findById(
            changeData.templateId,
          );
          if (!template) {
            return Error(
              `[${level}.change.${i}.add.defaultData.templateId] ->` +
                ` Template with ID "${changeData.templateId}" does not exist.`,
            );
          }
          (prop.defaultData as BCMSPropEntryPointerData) = {
            displayProp: 'title',
            entryIds: [],
            templateId: changeData.templateId,
          };
        }
        props.push(prop);
      } else if (typeof change.update === 'object') {
        const update = change.update as BCMSPropChangeUpdate;
        const propToUpdateIndex = props.findIndex((e) => e.id === update.id);
        if (propToUpdateIndex > 1) {
          const propBuffer = props[propToUpdateIndex];
          if (propBuffer.label !== update.label) {
            const newName = stringUtil.toSlugUnderscore(update.label);
            if (props.find((e) => e.name === newName)) {
              return Error(
                `[${level}] -> Prop with name "${newName}" already exists.`,
              );
            }
            propBuffer.label = update.label;
            propBuffer.name = newName;
          }
          propBuffer.required = update.required;
          if (update.enumItems) {
            (propBuffer.defaultData as BCMSPropEnumData).items =
              update.enumItems;
          }
          if (update.move) {
            if (update.move > 0 && propToUpdateIndex < props.length - 1) {
              const temp = JSON.parse(
                JSON.stringify(props[propToUpdateIndex + 1]),
              );
              props[propToUpdateIndex + 1] = propBuffer;
              props[propToUpdateIndex] = temp;
            } else if (update.move < 0 && propToUpdateIndex > 0) {
              if (propToUpdateIndex < 3) {
                if (props[0].name !== 'title') {
                  const temp = JSON.parse(
                    JSON.stringify(props[propToUpdateIndex - 1]),
                  );
                  props[propToUpdateIndex - 1] = propBuffer;
                  props[propToUpdateIndex] = temp;
                }
              } else {
                const temp = JSON.parse(
                  JSON.stringify(props[propToUpdateIndex - 1]),
                );
                props[propToUpdateIndex - 1] = propBuffer;
                props[propToUpdateIndex] = temp;
              }
            }
          } else {
            props[propToUpdateIndex] = propBuffer;
          }
        }
      } else {
        return Error(`(${level}) --> changes[${i}] in of unknown type.`);
      }
    }
    return props;
  },
  async parse({ maxDepth, depth, meta, values, level, onlyLng }) {
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
                const media = await BCMSRepo.media.findById(singleValueData);
                if (media) {
                  (parsed[prop.name] as BCMSPropMediaDataParsed) = {
                    src: await BCMSMediaService.getPath(media),
                    _id: singleValueData,
                  };
                }
              }
            }
          } else {
            if (typeof valueData[0] === 'object') {
              const media = await BCMSRepo.media.findById(valueData[0]);
              if (media) {
                (parsed[prop.name] as BCMSPropMediaDataParsed) = {
                  src: await BCMSMediaService.getPath(media),
                  _id: valueData[0],
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
          const group = await BCMSRepo.group.findById(data._id);
          if (group) {
            if (prop.array) {
              parsed[prop.name] = [];
              for (let j = 0; j < valueData.items.length; j++) {
                const valueDataItem = valueData.items[j];
                (parsed[prop.name] as BCMSPropDataParsed[]).push(
                  await BCMSPropHandler.parse({
                    maxDepth,
                    meta: group.props,
                    values: valueDataItem.props,
                    depth,
                    level: `${level}.${prop.name}.${j}`,
                  }),
                );
              }
            } else {
              parsed[prop.name] = await BCMSPropHandler.parse({
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
              const template = await BCMSRepo.template.findById(
                data.templateId,
              );
              if (template) {
                if (prop.array) {
                  (parsed[prop.name] as BCMSPropEntryPointerDataParsed[]) = [];
                  for (let j = 0; j < valueData.length; j++) {
                    const entryId = valueData[j];
                    const entry = await BCMSRepo.entry.findById(entryId);
                    if (entry) {
                      const parsedIndex = (
                        parsed[prop.name] as BCMSPropEntryPointerDataParsed[]
                      ).push({});
                      for (let k = 0; k < entry.meta.length; k++) {
                        const entryMeta = entry.meta[k];
                        const lng = await BCMSRepo.language.methods.findByCode(
                          entryMeta.lng,
                        );
                        if (lng && (!onlyLng || onlyLng === lng.code)) {
                          (
                            parsed[
                              prop.name
                            ] as BCMSPropEntryPointerDataParsed[]
                          )[parsedIndex][lng.code] =
                            await BCMSPropHandler.parse({
                              maxDepth,
                              meta: template.props,
                              values: entryMeta.props,
                              depth: depth + 1,
                              level: `${level}.${prop.name}.${k}`,
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
                } else {
                  (parsed[prop.name] as BCMSPropEntryPointerDataParsed) = {};
                  const entryId = valueData[0];
                  const entry = await BCMSRepo.entry.findById(entryId);
                  if (entry) {
                    for (let k = 0; k < entry.meta.length; k++) {
                      const entryMeta = entry.meta[k];
                      const lng = await BCMSRepo.language.methods.findByCode(
                        entryMeta.lng,
                      );
                      if (lng && (!onlyLng || onlyLng === lng.code)) {
                        (parsed[prop.name] as BCMSPropEntryPointerDataParsed)[
                          lng.code
                        ] = await BCMSPropHandler.parse({
                          maxDepth,
                          meta: template.props,
                          values: entryMeta.props,
                          depth: depth + 1,
                          level: `${level}.${prop.name}.0`,
                        });
                        (parsed[prop.name] as BCMSPropEntryPointerDataParsed)[
                          lng.code
                        ]._id = entryId;
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
              const entry = await BCMSRepo.entry.findById(valueData[0]);
              if (entry) {
                const template = await BCMSRepo.template.findById(
                  data.templateId,
                );
                if (template) {
                  (parsed[prop.name] as BCMSPropEntryPointerDataParsed) = {};
                  for (let j = 0; j < entry.meta.length; j++) {
                    const entryMeta = entry.meta[j];
                    const lng = await BCMSRepo.language.methods.findByCode(
                      entryMeta.lng,
                    );
                    if (lng) {
                      (parsed[prop.name] as BCMSPropEntryPointerDataParsed)[
                        lng.code
                      ] = await BCMSPropHandler.parse({
                        maxDepth,
                        meta: template.props,
                        values: entryMeta.props,
                        depth: depth + 1,
                        level: `${level}.${prop.name}`,
                      });
                      (parsed[prop.name] as BCMSPropEntryPointerDataParsed)[
                        lng.code
                      ]._id = valueData[0];
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
  async removeGroupPointer({ groupId }) {
    function filterGroupPointer(data: { props: BCMSProp[] }) {
      return data.props.filter(
        (prop) =>
          !(
            prop.type === BCMSPropType.GROUP_POINTER &&
            (prop.defaultData as BCMSPropGroupPointerData)._id === groupId
          ),
      );
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterGroupPointer({
        props: group.props,
      });
      const updatedGroup = await BCMSRepo.group.update(group as BCMSGroupCross);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: `${group._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterGroupPointer({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(
        widget as BCMSWidgetCross,
      );
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: `${widget._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    const templates = await BCMSRepo.template.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterGroupPointer({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(
        template as BCMSTemplateCross,
      );
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: `${template._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (errors.length > 0) {
      return errors;
    }
  },
  async removeEntryPointer({ templateId }) {
    function filterGroupPointer(data: { props: BCMSProp[] }) {
      return data.props.filter(
        (prop) =>
          !(
            prop.type === BCMSPropType.ENTRY_POINTER &&
            (prop.defaultData as BCMSPropEntryPointerData).templateId ===
              templateId
          ),
      );
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterGroupPointer({
        props: group.props,
      });
      const updatedGroup = await BCMSRepo.group.update(group as BCMSGroupCross);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: `${group._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterGroupPointer({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(
        widget as BCMSWidgetCross,
      );
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: `${widget._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    const templates = await BCMSRepo.template.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterGroupPointer({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(
        template as BCMSTemplateCross,
      );
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: `${template._id}`,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (errors.length > 0) {
      return errors;
    }
  },
};

export function createBcmsPropHandler(): Module {
  return {
    name: 'Prop handler',
    initialize(moduleConfig) {
      objectUtil = useObjectUtility();
      stringUtil = useStringUtility();

      moduleConfig.next();
    },
  };
}
