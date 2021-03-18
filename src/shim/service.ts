setInterval(() => {

}, 1000);

export class ShimService {
  private static connected = false;
  static isConnected(): boolean {
    return this.connected;
  }
  static async connect() {

  }
}
