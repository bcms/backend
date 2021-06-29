export class StatusUtility {
  static isColorOk(color: string): boolean {
    if (color.length !== 6 || /[^0-9a-fA-F]/g.test(color)) {
      return false;
    }
    return true;
  }
}
