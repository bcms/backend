import { BCMSEntryContentNodeType, BCMSEntryContentUtility } from '../types';

let contentUtil: BCMSEntryContentUtility;

export function useBcmsEntryContentUtility(): BCMSEntryContentUtility {
  return contentUtil;
}

export function createBcmsEntryContentUtility(): void {
  contentUtil = {
    async check({ content }) {
      for (let i = 0; i < content.nodes.length; i++) {
        const node = content.nodes[i];
        if (node.type === BCMSEntryContentNodeType.paragraph) {
          // TODO: Implement checkers
        }
      }
    },
  };
}
