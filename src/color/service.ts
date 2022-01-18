import type { BCMSColorService as BCMSColorServiceType } from '@bcms/types';

export const BCMSColorService: BCMSColorServiceType = {
  async check(color) {
    const checkHex = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
    return color.match(checkHex) ? true : false;
  },
};
