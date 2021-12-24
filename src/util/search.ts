import {
  BCMSEntryContentNodeType,
  BCMSSearch as BCMSSearchType,
} from '@bcms/types';

export const BCMSSearch: BCMSSearchType = {
  searchText({ node }) {
    let output = '';
    if (node.type !== 'widget') {
      if (node.type === BCMSEntryContentNodeType.text && node.text) {
        output += node.text;
      } else if (
        node.type === BCMSEntryContentNodeType.paragraph &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.heading &&
        node.attrs &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.bulletList &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.listItem &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.orderedList &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.codeBlock &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) => BCMSSearch.searchText({ node: childNode }))
          .join('')}`;
      }
    } else {
      throw Error('Node of type widget cannot be converted to text');
    }
    return output;
  },
};
