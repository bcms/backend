import type { BCMSHtml as BCMSHtmlType } from '../types';

export const BCMSHtml: BCMSHtmlType = {
  nodeToHtml({ node }) {
    const output = '';
    if (node.type !== 'widget') {
      // TODO: Add logic
    } else {
      throw Error('Node of type widget cannot be converted to HTML.');
    }
    return output;
  },
};
