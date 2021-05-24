import {
  Controller,
  ControllerPrototype,
  Get,
  Logger,
} from '@becomes/purple-cheetah';
import { Router } from 'express';
import { PluginManager } from './manager';

@Controller('/api/plugin')
export class PluginController implements ControllerPrototype {
  name: string;
  router: Router;
  baseUri: string;
  initRouter: () => void;
  logger: Logger;

  @Get('/list')
  list(): { items: string[] } {
    return { items: PluginManager.getList() };
  }
}
