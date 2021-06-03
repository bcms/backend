import type { BCMSProp, BCMSPropType } from './models';

export interface BCMSPropFactory {
  get(type: BCMSPropType, array?: boolean): BCMSProp;
  string(array?: boolean): BCMSProp;
  number(array?: boolean): BCMSProp;
  bool(array?: boolean): BCMSProp;
  date(array?: boolean): BCMSProp;
  enum(array?: boolean): BCMSProp;
  media(array?: boolean): BCMSProp;
  groupPointer(array?: boolean): BCMSProp;
  entryPointer(array?: boolean): BCMSProp;
  richText(array?: boolean): BCMSProp;
}
