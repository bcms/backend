import { MongoWidgetRepository } from './widget';
import { FSWidgetRepository } from './fs-widget';

export const WidgetRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSWidgetRepository()
    : new MongoWidgetRepository();
