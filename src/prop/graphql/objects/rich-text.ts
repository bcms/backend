import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueRichTextObject = createGraphqlObject({
  name: 'BCMSPropDataValueRichText',
  fields: {
    value: '[BCMSPropRichTextData!]!',
  },
});

export const BCMSPropDataValueRichTextDataObject = createGraphqlObject({
  name: 'BCMSPropDataValueRichTextData',
  fields: {
    nodes: '[BCMSEntryContentNode!]!'
  },
});
