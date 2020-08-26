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
import { GroupLite } from './interfaces';
import { Group, FSGroup } from './models';
import { GroupRequestHandler } from './request-handler';
import { GroupFactory } from './factories';

@Controller('/api/group')
export class GroupController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get('/all/lite')
  async getAllLite(request: Request): Promise<{ groups: GroupLite[] }> {
    return {
      groups: (
        await GroupRequestHandler.getAll(request.headers.authorization)
      ).map((e) => {
        return GroupFactory.toLite(e);
      }),
    };
  }

  @Get('/all')
  async getAll(request: Request): Promise<{ groups: Array<Group | FSGroup> }> {
    return {
      groups: await GroupRequestHandler.getAll(request.headers.authorization),
    };
  }

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {
    return {
      count: await GroupRequestHandler.count(request.headers.authorization),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ group: Group | FSGroup }> {
    return {
      group: await GroupRequestHandler.getById(
        request.headers.authorization,
        request.params.id,
      ),
    };
  }

  @Post()
  async add(request: Request): Promise<{ group: Group | FSGroup }> {
    return {
      group: await GroupRequestHandler.add(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Put()
  async update(request: Request): Promise<{ group: Group | FSGroup }> {
    return {
      group: await GroupRequestHandler.update(
        request.headers.authorization,
        request.body,
        request.headers.sid as string,
      ),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    await GroupRequestHandler.deleteById(
      request.headers.authorization,
      request.params.id,
      request.headers.sid as string,
    );
    return {
      message: 'Success.',
    };
  }
}
