import { StringUtility } from '@becomes/purple-cheetah';

export class General {
  static async delay(time: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
  static labelToName(label: string): string {
    return StringUtility.createSlug(label).replace(/-/g, '_');
  }
}
