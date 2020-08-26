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
import { FSWidget, Widget } from './models';
import { WidgetRequestHandler } from './request-handler';

@Controller('/api/widget')
export class WidgetController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get('/all')
  async getAll(
    request: Request,
  ): Promise<{ widgets: Array<Widget | FSWidget> }> {
    return {
      widgets: await WidgetRequestHandler.getAll(request.headers.authorization),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await WidgetRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.add(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ widget: Widget | FSWidget }> {
    return {
      widget: await WidgetRequestHandler.update(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await WidgetRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
