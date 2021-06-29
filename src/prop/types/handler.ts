import type { BCMSPropChange } from './changes';
import type { BCMSProp } from './main';

export interface BCMSPropHandlerPointer {
  group: Array<{
    _id: string;
    label: string;
  }>;
}

export interface BCMSPropHandler {
  testInfiniteLoop(
    props: BCMSProp[],
    pointer?: BCMSPropHandlerPointer,
    level?: string,
  ): Promise<Error | void>;
  propsValidate(props: BCMSProp[], level?: string): Promise<Error | void>;
  propsChecker(
    propsToCheck: BCMSProp[],
    props: BCMSProp[],
    level?: string,
    inTemplate?: boolean,
  ): Promise<Error | void>;
  applyPropChanges(
    props: BCMSProp[],
    changes: BCMSPropChange[],
    level?: string,
    groupPropChanges?: boolean,
  ): Promise<BCMSProp[] | Error>;
  // parseProps(
  //   props: BCMSProp[],
  //   lng: string,
  //   level?: string,
  //   entryPointerDepth?: number,
  // ): Promise<{
  //   quill: boolean;
  //   key: string;
  //   name: string;
  //   value: BCMSPropParsed;
  // }>;
}
