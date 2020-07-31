export class General {
  static async delay(time: number) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
