import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSPropTypeEnum } from './enums';
import {
  BCMSPropDataValueColorPickerInput,
  BCMSPropDataValueEntryPointerInput,
  BCMSPropDataValueEnumInput,
  BCMSPropDataValueWidgetInput,
  BCMSPropDataInput,
  BCMSPropDataValueGroupPointerInput,
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
  BCMSPropDataValueDateObject,
  BCMSPropDataValueMediaObject,
  BCMSPropDataValueTagObject,
} from './objects';
import { BCMSPropDataUnion } from './unions';

export const BCMSPropCollection = createGraphqlCollection({
  name: 'prop',
  enums: [BCMSPropTypeEnum],
  inputs: [
    BCMSPropDataValueColorPickerInput,
    BCMSPropDataInput,
    BCMSPropDataValueEntryPointerInput,
    BCMSPropDataValueEnumInput,
    BCMSPropDataValueGroupPointerInput,
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
    BCMSPropDataValueDateObject,
    BCMSPropDataValueMediaObject,
    BCMSPropDataValueTagObject,
  ],
});
