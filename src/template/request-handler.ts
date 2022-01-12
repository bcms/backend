import { BCMSFactory } from '@bcms/factory';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSTemplateUpdateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSTemplateRequestHandler {
  static async getAll(): Promise<BCMSTemplate[]> {
    return await BCMSRepo.template.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTemplate[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.template.findAllById(ids);
    } else {
      return await BCMSRepo.template.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.template.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTemplate> {
    const template =
      id.length === 24
        ? await BCMSRepo.template.findById(id)
        : await BCMSRepo.template.methods.findByCid(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    return template;
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTemplateCreateData;
  }): Promise<BCMSTemplate> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('templates');
    if (!idc) {
      const templateIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'templates',
        name: 'Templates',
      });
      const addIdcResult = await BCMSRepo.idc.add(templateIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const template = BCMSFactory.template.create({
      cid: idc.toString(16),
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      desc: body.desc,
      singleEntry: body.singleEntry,
      userId: accessToken.payload.userId,
    });
    const templateWithSameName = await BCMSRepo.template.methods.findByName(
      template.name,
    );
    if (templateWithSameName) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('tmp002', { name: template.name }),
      );
    }
    const addedTemplate = await BCMSRepo.template.add(template);
    if (!addedTemplate) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp003'),
      );
    }
    await BCMSSocketManager.emit.template({
      templateId: addedTemplate._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
    return addedTemplate;
  }
  static async update({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTemplateUpdateData;
  }): Promise<BCMSTemplate> {
    const id = body._id;
    const template = await BCMSRepo.template.findById(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label !== 'undefined' && body.label !== template.label) {
      const name = StringUtility.toSlugUnderscore(body.label);
      if (template.name !== name) {
        if (await BCMSRepo.template.methods.findByName(name)) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('tmp002', { name: template.name }),
          );
        }
      }
      changeDetected = true;
      template.label = body.label;
      template.name = name;
    }
    if (typeof body.desc !== 'undefined' && template.desc !== body.desc) {
      changeDetected = true;
      template.desc = body.desc;
    }
    if (
      typeof body.singleEntry !== 'undefined' &&
      template.singleEntry !== body.singleEntry
    ) {
      changeDetected = true;
      template.singleEntry = body.singleEntry;
    }
    if (
      typeof body.propChanges !== 'undefined' &&
      body.propChanges.length > 0
    ) {
      for (let i = 0; i < body.propChanges.length; i++) {
        const change = body.propChanges[i];
        if (change.add) {
          const name = StringUtility.toSlugUnderscore(change.add.label);
          if (name === 'title' || name === 'slug') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('tmp009', {
                name,
              }),
            );
          }
        } else if (change.update) {
          if (
            change.update.label === 'Title' ||
            change.update.label === 'Slug'
          ) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('tmp009', {
                name: change.update.label,
              }),
            );
          }
        } else if (change.remove) {
          if (change.remove === 'title' || change.remove === 'slug') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('tmp009', {
                name: change.remove,
              }),
            );
          }
        }
      }
      changeDetected = true;
      const result = await BCMSPropHandler.applyPropChanges(
        template.props,
        body.propChanges,
      );
      if (result instanceof Error) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('g009', {
            msg: result.message,
          }),
        );
      }
      template.props = result;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const hasInfiniteLoop = await BCMSPropHandler.testInfiniteLoop(
      template.props,
    );
    if (hasInfiniteLoop instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g008', {
          msg: hasInfiniteLoop.message,
        }),
      );
    }
    const checkProps = await BCMSPropHandler.propsChecker(
      template.props,
      template.props,
      'template.props',
      true,
    );
    if (checkProps instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g007', {
          msg: checkProps.message,
        }),
      );
    }
    const updatedTemplate = await BCMSRepo.template.update(template);
    if (!updatedTemplate) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp005'),
      );
    }
    await BCMSSocketManager.emit.template({
      templateId: updatedTemplate._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
    return updatedTemplate;
  }
}
