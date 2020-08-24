import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { Language, FSLanguage } from './models';
import { LanguageRequestHandler } from './request-handler';

@Controller('/api/language')
export class LanguageController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/all')
  async getAll(
    request: Request,
  ): Promise<{ languages: Array<Language | FSLanguage> }> {
    return {
      languages: await LanguageRequestHandler.getAll(
        request.headers.authorization,
      ),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await LanguageRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(
    request: Request,
  ): Promise<{ language: Language | FSLanguage }> {
    return {
      language: await LanguageRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ language: Language | FSLanguage }> {
    return {
      language: await LanguageRequestHandler.add(
        request.headers.authorization,
        request.body,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ language: Language | FSLanguage }> {
    return {
      language: await LanguageRequestHandler.update(
        request.headers.authorization,
        request.body,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await LanguageRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
    );
    return {
      message: 'Success.',
    };
  }
}
