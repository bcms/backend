import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from '@becomes/purple-cheetah';
import { Request } from 'express';
import { Template, FSTemplate } from './models';
import { TemplateRequestHandler } from './request-handler';

@Controller('/api/template')
export class TemplateController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get('/all')
  async getAll(
    request: Request,
  ): Promise<{ templates: Array<Template | FSTemplate> }> {
    return {
      templates: await TemplateRequestHandler.getAll(
        request.headers.authorization,
      ),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await TemplateRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(
    request: Request,
  ): Promise<{ template: Template | FSTemplate }> {
    return {
      template: await TemplateRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ template: Template | FSTemplate }> {
    return {
      template: await TemplateRequestHandler.add(
        request.headers.authorization,
        request.body,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ template: Template | FSTemplate }> {
    return {
      template: await TemplateRequestHandler.update(
        request.headers.authorization,
        request.body,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await TemplateRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
    );
    return {
      message: 'Success.',
    };
  }
}
