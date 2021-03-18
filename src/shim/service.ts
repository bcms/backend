import { Http } from '../util/http';
import { HttpError, HttpStatus, Logger } from '@becomes/purple-cheetah';

setInterval(() => {
  // TODO: check connection every second
}, 1000);

export class ShimService {
  private static readonly logger = new Logger('ShimService');
  private static connected = false;
  private static http = new Http('localhost', '2070');
  static isConnected(): boolean {
    return this.connected;
  }
  static async connect() {
    // TODO: try to connect to the SHIM
  }
  static async send<T>(
    uri: string,
    payload: unknown,
    error?: HttpError,
  ): Promise<T> {
    if (!this.connected) {
      if (error) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'Instance in not connected.',
        );
      }
      throw Error('Instance is not connected.');
    }
    try {
      const response = await this.http.send<T>({
        path: uri,
        method: 'POST',
        data: payload,
        headers: {
          iid: process.env.BCMS_INSTANCE_ID,
        },
      });
      return response.data;
    } catch (e) {
      this.logger.error('send', e);
      if (error) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to send a request.',
        );
      }
      throw Error('Failed to send a request.');
    }
  }
}
