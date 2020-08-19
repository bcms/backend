import { MongoWidgetRepository } from './widget';
import { FSWidgetRepository } from './fs-widget';

let repo: FSWidgetRepository | MongoWidgetRepository;
if (process.env.DB_USE_FS) {
  repo = new FSWidgetRepository();
} else {
  repo = new MongoWidgetRepository();
}

export const WidgetRepo = repo;
