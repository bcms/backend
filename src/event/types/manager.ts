import type { BCMSEventConfigMethod, BCMSEventConfigScope } from "./config";

export interface BCMSEventManager {
  emit(
    scope: BCMSEventConfigScope | string,
    method: BCMSEventConfigMethod | string,
    data: unknown,
  ): Promise<void>;
}
