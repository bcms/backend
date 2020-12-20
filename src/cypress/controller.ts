import {
  Controller,
  ControllerPrototype,
  Logger,
  Post,
} from '@becomes/purple-cheetah';
import { Router } from 'express';
import { Types } from 'mongoose';
import { CacheControl } from '../cache';

@Controller('/api/cy')
export class CypressController implements ControllerPrototype {
  baseUri: string;
  initRouter: () => void;
  logger: Logger;
  name: string;
  router: Router;

  @Post('/reset')
  async reset() {
    let ids: Array<string | Types.ObjectId> = (
      await CacheControl.apiKey.findAll()
    ).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.apiKey.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.entry.findAll()).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.entry.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.group.findAll()).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.group.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.language.findAll())
      .filter((e) => e.code !== 'en')
      .map((e) => e._id);
    for (const i in ids) {
      await CacheControl.language.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.media.findAll()).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.media.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.template.findAll()).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.template.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.widget.findAll()).map((e) => e._id);
    for (const i in ids) {
      await CacheControl.widget.deleteById(`${ids[i]}`);
    }
    ids = (await CacheControl.user.findAll()).map((e) => e._id).slice(1);
    for (const i in ids) {
      await CacheControl.user.deleteById(`${ids[i]}`);
    }
    return {
      message: 'OK',
    };
  }
}
