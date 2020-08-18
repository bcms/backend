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

@Controller('/api/group')
export class GroupController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router;
  initRouter: () => void;

  @Get('/all/lite')
  async getAllLite(request: Request): Promise<{ groups: GroupLite[] }> {}

  @Get('/all')
  async getAll(request: Request): Promise<{ groups: Array<Group | FSGroup> }> {}

  @Get('/:id')
  async getById(request: Request): Promise<{ group: Group | FSGroup }> {}

  @Get('/count')
  async count(request: Request): Promise<{ count: number }> {}

  @Post()
  async add(request: Request): Promise<{ group: Group | FSGroup }> {}

  @Put()
  async update(request: Request): Promise<{ group: Group | FSGroup }> {}

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {}
}
