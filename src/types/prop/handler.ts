import type { BCMSProp, BCMSPropParsed } from './models-bak';
import type { BCMSPropChange } from './change';

interface Pointer {
  group: Array<{
    _id: string;
    label: string;
  }>;
}

export interface BCMSPropHandler {
  testInfiniteLoop(
    props: BCMSProp[],
    pointer?: Pointer,
    level?: string,
  ): Promise<void | Error>;
  validate(props: BCMSProp[], level?: string): Promise<void | Error>;
  check(
    propsToCheck: BCMSProp[],
    props: BCMSProp[],
    level?: string,
    isTemplate?: boolean,
  ): Promise<void | Error>;
  applyChanges(
    props: BCMSProp[],
    changes: BCMSPropChange[],
    level?: string,
    groupPropChanges?: boolean,
  ): Promise<BCMSProp[] | Error>;
  updateTargetGroup(
    targetGroupId: string,
    props: BCMSProp[],
    changes: BCMSPropChange[],
    level?: string,
  ): Promise<{ changesFound: boolean; props: BCMSProp[] } | Error>;
  parse(
    props: BCMSProp[],
    lng: string,
    level?: string,
    entryPointerDepth?: number,
  ): Promise<Array<{ key: string; name: string; value: BCMSPropParsed }>>;
}
