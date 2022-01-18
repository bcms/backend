export interface BCMSColorService {
  check(color: string): Promise<boolean>;
}
