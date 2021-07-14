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
  checkPropValues(data: {
    props: BCMSProp[];
    values: BCMSPropValue[];
    level: string;
  }): Promise<Error | void>;
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
  ): Promise<BCMSProp[] | Error>;
  parse(data: {
    meta: BCMSProp[];
    values: BCMSPropValue[];
    level?: string;
    depth?: number;
    maxDepth: number;
    onlyLng?: string;
  }): Promise<BCMSPropParsed>;
  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified group will be removed from
   * other groups, templates and widgets and updated in the
   * database.
   */
  removeGroupPointer(data: { groupId: string }): Promise<void | Error[]>;
  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified template will be removed from
   * other templates, groups and widgets and updated in the
   * database.
   */
   removeEntryPointer(data: { templateId: string }): Promise<void | Error[]>;
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
