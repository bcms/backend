import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueRichTextInput = createGraphqlInput({
  name: 'BCMSPropRichTextInput',
  fields: {
    value: '[BCMSPropRichTextData!]!',
  },
});
