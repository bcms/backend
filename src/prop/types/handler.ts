import type {
  BCMSProp,
  BCMSPropChange,
  BCMSPropParsed,
  BCMSPropValue,
} from './models';

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
  parse(data: {
    meta: BCMSProp[];
    values: BCMSPropValue[];
    level?: string;
    depth?: number;
    maxDepth: number;
  }): Promise<BCMSPropParsed>;
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
