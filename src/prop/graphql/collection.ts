import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSPropTypeEnum } from './enums';
import {
  BCMSPropDataValueBooleanInput,
  BCMSPropDataValueColorPickerInput,
  BCMSPropDataValueEntryPointerInput,
  BCMSPropDataValueEnumInput,
  BCMSPropDataValueStringInput,
  BCMSPropDataValueWidgetInput,
  BCMSPropDataInput,
  BCMSPropDataValueGroupPointerInput,
  BCMSPropDataValueNumberInput,
} from './inputs';
import {
  BCMSPropObject,
  BCMSPropDataValueStringObject,
  BCMSPropDataValueNumberObject,
  BCMSPropDataValueBooleanObject,
  // BCMSPropDataValueRichTextObject,
  BCMSPropDataValueEntryPointerObject,
  BCMSPropDataValueGroupPointerObject,
  BCMSPropDataValueWidgetObject,
  BCMSPropDataValueColorPickerObject,
  BCMSPropDataValueEnumObject,
} from './objects';
import { BCMSPropDataUnion } from './unions';

export const BCMSPropCollection = createGraphqlCollection({
  name: 'prop',
  enums: [BCMSPropTypeEnum],
  inputs: [
    BCMSPropDataValueColorPickerInput,
    BCMSPropDataInput,
    BCMSPropDataValueBooleanInput,
    BCMSPropDataValueEntryPointerInput,
    BCMSPropDataValueEnumInput,
    BCMSPropDataValueGroupPointerInput,
    BCMSPropDataValueNumberInput,
    BCMSPropDataValueStringInput,
    BCMSPropDataValueWidgetInput,
  ],
  unions: [BCMSPropDataUnion],
  objects: [
    BCMSPropDataValueStringObject,
    BCMSPropDataValueNumberObject,
    BCMSPropDataValueBooleanObject,
    // BCMSPropDataValueRichTextObject,
    BCMSPropDataValueEntryPointerObject,
    BCMSPropDataValueEnumObject,
    BCMSPropDataValueGroupPointerObject,
    BCMSPropDataValueWidgetObject,
    BCMSPropObject,
    BCMSPropDataValueColorPickerObject,
  ],
});
