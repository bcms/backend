import { FSStatusRepository } from './fs-status';
import { StatusRepository } from './status';

export const StatusRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSStatusRepository()
    : new StatusRepository();
