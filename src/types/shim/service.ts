import type { HTTPError } from '@becomes/purple-cheetah/types';

export interface BCMSShimService {
  isConnected(): boolean;
  getCode(): string;
  refreshAvailable(): void;
  send<Return, Payload>(data: {
    uri: string;
    payload: Payload;
    errorHandler?: HTTPError;
  }): Promise<Return>;
}
