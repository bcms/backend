export interface BCMSFunctionConfig {
  /**
   * Will be converted to lowercase without
   * special characters and spaces will be
   * replaced with "-".
   */
  name: string;
  /**
   * If set to "true", anyone can call this
   * function.
   */
  public: boolean;
}
