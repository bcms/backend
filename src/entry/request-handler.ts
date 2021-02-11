import { Entry, FSEntry, EntryMeta, EntryContent } from './models';
import {
  HttpErrorFactory,
  Logger,
  CreateLogger,
  HttpStatus,
  StringUtility,
  ObjectUtility,
  Entity,
  FSDBEntity,
} from '@becomes/purple-cheetah';
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import {
  EntryLite,
  AddEntryData,
  AddEntryDataSchema,
  UpdateEntryData,
  EntryParsed,
} from './interfaces';
import { EntryFactory } from './factory';
import { PropHandler, PropType } from '../prop';
import { SocketUtil, SocketEventName } from '../util';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';
import { EntryParser } from './parser';

export class EntryRequestHandler {
  @CreateLogger(EntryRequestHandler)
  private static logger: Logger;

  static async getAll(): Promise<Array<Entry | FSEntry>> {
    return await CacheControl.entry.findAll();
  }

  static async getAllLite(): Promise<EntryLite[]> {
    return (
      await CacheControl.entry.findAll()
    ).map((entry) => {
      return EntryFactory.toLite(entry);
    });
  }

  static async getManyLite(idsString: string): Promise<EntryLite[]> {
    const error = HttpErrorFactory.instance(
      'getManyLite',
      this.logger,
    );
    if (!idsString) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g010',
          {
            param: 'ids',
          },
        ),
      );
    }
    const ids: string[] = idsString.split('-').map((id, i) => {
      if (StringUtility.isIdValid(id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'g004',
            {
              id: `ids[${i}]: ${id}`,
            },
          ),
        );
      }
      return id;
    });
    return (
      await CacheControl.entry.findAllById(ids)
    ).map((entry) => {
      return EntryFactory.toLite(entry);
    });
  }

  static async getAllByTemplateId(
    templateId: string,
  ): Promise<Array<Entry | FSEntry>> {
    const error = HttpErrorFactory.instance(
      'getAllByTemplateId',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { templateId },
        ),
      );
    }
    return await CacheControl.entry.findAllByTemplateId(templateId);
  }

  static async getAllByTemplateIdParsed(
    templateId: string,
  ): Promise<EntryParsed[]> {
    const error = HttpErrorFactory.instance(
      'getAllByTemplateIdParsed',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { templateId },
        ),
      );
    }
    const entries = await CacheControl.entry.findAllByTemplateId(templateId);
    const entriesParsed: EntryParsed[] = [];
    for (const i in entries) {
      const entry = entries[i];
      try {
        entriesParsed.push(await EntryParser.parse(entry));
      } catch (e) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Parsing entry "${entry._id}" failed with message: ${e.message}`,
        );
      }
    }
    return entriesParsed;
  }

  static async getAllByTemplateIdIndexed(
    templateId: string,
  ): Promise<Array<Entity | FSDBEntity>> {
    const error = HttpErrorFactory.instance(
      'getAllByTemplateIdIndexed',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { templateId },
        ),
      );
    }
    const entries = await CacheControl.entry.findAllByTemplateId(templateId);
    return entries.map((e) => {
      return {
        _id: `${e._id}`,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    });
  }

  static async getAllLiteByTemplateId(
    templateId: string,
  ): Promise<EntryLite[]> {
    const error = HttpErrorFactory.instance(
      'getAllLiteByTemplateId',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { templateId },
        ),
      );
    }
    const entries = await CacheControl.entry.findAllByTemplateId(templateId);
    return entries.map(
      (entry) => {
        return EntryFactory.toLite(entry);
      },
    );
  }

  static async countByTemplateId(templateId: string): Promise<number> {
    const error = HttpErrorFactory.instance(
      'countByTemplateId',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { templateId },
        ),
      );
    }
    return await CacheControl.entry.countByTemplateId(templateId);
  }

  static async getById(id: string): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance(
      'getById',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'etr001',
          { id },
        ),
      );
    }
    return entry;
  }

  static async getByIdParsed(id: string): Promise<EntryParsed> {
    const error = HttpErrorFactory.instance(
      'getByIdParsed',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'etr001',
          { id },
        ),
      );
    }
    return await EntryParser.parse(entry);
  }

  static async getByIdLite(id: string): Promise<EntryLite> {
    const error = HttpErrorFactory.instance(
      'getByIdLite',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'etr001',
          { id },
        ),
      );
    }
    return EntryFactory.toLite(entry);
  }

  static async add(
    data: AddEntryData,
    sid: string,
    userId: string,
  ): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance(
      'add',
      this.logger,
    );
    try {
      ObjectUtility.compareWithSchema(
        data,
        AddEntryDataSchema,
        'data',
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g002',
          {
            msg: e.message,
          },
        ),
      );
    }
    if (StringUtility.isIdValid(data.templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id: data.templateId },
        ),
      );
    }
    const template = await CacheControl.template.findById(data.templateId);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'tmp001',
          {
            id: data.templateId,
          },
        ),
      );
    }
    const languages = await CacheControl.language.findAll();
    const meta: EntryMeta[] = [];
    const content: EntryContent[] = [];
    for (const i in languages) {
      const lngMeta = data.meta.find((e) => e.lng === languages[i].code);
      const lngContent = data.content.find((e) => e.lng === languages[i].code);
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr002',
            {
              lng: languages[i].name,
              prop: 'meta',
            },
          ),
        );
      }
      if (!lngContent) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr002',
            {
              lng: languages[i].name,
              prop: 'content',
            },
          ),
        );
      }
      const metaCheckResult = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
        `data.meta[${i}].props`,
      );
      if (metaCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr003',
            {
              error: metaCheckResult.message,
              prop: 'meta',
            },
          ),
        );
      }
      const contentCheckResult = await PropHandler.propsValidate(
        lngContent.props,
        `data.content[${i}].props`,
      );
      if (contentCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr003',
            {
              error: contentCheckResult.message,
              prop: 'content',
            },
          ),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
          slug = true;
        }
      });
      if (!slug) {
        lngMeta.props = [
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      if (!title) {
        lngMeta.props = [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      meta.push(lngMeta);
      content.push(lngContent);
    }
    const entry = EntryFactory.instance;
    entry.templateId = data.templateId;
    entry.userId = userId;
    entry.meta = meta;
    entry.content = content;
    entry.status = data.status ? data.status : '';
    const addResult = await CacheControl.entry.add(
      entry,
      async () => {
        SocketUtil.emit(
          SocketEventName.ENTRY,
          {
            entry: {
              _id: `${entry._id}`,
            },
            message: '',
            source: '',
            type: 'remove',
          },
        );
      },
    );
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr004'),
      );
    }
    SocketUtil.emit(
      SocketEventName.ENTRY,
      {
        entry: {
          _id: `${entry._id}`,
          additional: {
            templateId: entry.templateId,
          },
        },
        message: 'Entry added.',
        source: sid,
        type: 'add',
      },
    );
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(entry)),
    );
    return entry;
  }

  static async update(
    data: UpdateEntryData,
    sid: string,
  ): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance(
      'update',
      this.logger,
    );
    try {
      ObjectUtility.compareWithSchema(
        data,
        AddEntryDataSchema,
        'data',
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g002',
          {
            msg: e.message,
          },
        ),
      );
    }
    if (StringUtility.isIdValid(data.templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id: `templateId: ${data.templateId}` },
        ),
      );
    }
    if (StringUtility.isIdValid(data._id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id: `_id: ${data._id}` },
        ),
      );
    }
    const entry = await CacheControl.entry.findById(data._id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'etr001',
          {
            id: data._id,
          },
        ),
      );
    }
    const template = await CacheControl.template.findById(data.templateId);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'tmp001',
          {
            id: data.templateId,
          },
        ),
      );
    }
    const languages = await CacheControl.language.findAll();
    const meta: EntryMeta[] = [];
    const content: EntryContent[] = [];
    for (const i in languages) {
      const dataMeta = data.meta.find((e) => e.lng === languages[i].code);
      const lngMeta: EntryMeta = {
        lng: dataMeta.lng,
        props: dataMeta.props.map((prop) => {
          return {
            array: prop.array,
            label: prop.label,
            name: prop.name,
            required: prop.required,
            type: prop.type,
            value: prop.value,
          };
        }),
      };
      const dataContent = data.content.find((e) => e.lng === languages[i].code);
      const lngContent: EntryContent = {
        lng: dataContent.lng,
        props: dataContent.props.map((prop) => {
          return {
            array: prop.array,
            label: prop.label,
            name: prop.name,
            required: prop.required,
            type: prop.type,
            value: prop.value,
          };
        }),
      };
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr002',
            {
              lng: languages[i].name,
              prop: 'meta',
            },
          ),
        );
      }
      if (!lngContent) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr002',
            {
              lng: languages[i].name,
              prop: 'content',
            },
          ),
        );
      }
      const metaCheckResult = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
        `data.meta[${i}].props`,
      );
      if (metaCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr003',
            {
              error: metaCheckResult.message,
              prop: 'meta',
            },
          ),
        );
      }
      const contentCheckResult = await PropHandler.propsValidate(
        lngContent.props,
        `data.content[${i}].props`,
      );
      if (contentCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get(
            'etr003',
            {
              error: contentCheckResult.message,
              prop: 'content',
            },
          ),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
          slug = true;
        }
      });
      if (!slug) {
        lngMeta.props = [
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      if (!title) {
        lngMeta.props = [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      meta.push(lngMeta);
      content.push(lngContent);
    }
    entry.meta = meta;
    entry.content = content;
    entry.status = data.status ? data.status : '';
    const updateResult = await CacheControl.entry.update(
      entry,
      async (type) => {
        SocketUtil.emit(
          SocketEventName.ENTRY,
          {
            entry: {
              _id: `${entry._id}`,
            },
            message: '',
            source: '',
            type,
          },
        );
      },
    );
    if (updateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr004'),
      );
    }
    SocketUtil.emit(
      SocketEventName.ENTRY,
      {
        entry: {
          _id: `${entry._id}`,
          additional: {
            templateId: entry.templateId,
          },
        },
        message: 'Entry updated.',
        source: sid,
        type: 'update',
      },
    );
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.UPDATE,
      JSON.parse(JSON.stringify(entry)),
    );
    return entry;
  }

  static async deleteById(id: string, sid: string) {
    const error = HttpErrorFactory.instance(
      'deleteById',
      this.logger,
    );
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get(
          'g004',
          { id },
        ),
      );
    }
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get(
          'etr001',
          { id },
        ),
      );
    }
    const deleteResult = await CacheControl.entry.deleteById(
      id,
      async () => {
        SocketUtil.emit(
          SocketEventName.ENTRY,
          {
            entry: {
              _id: `${entry._id}`,
            },
            message: '',
            source: '',
            type: 'add',
          },
        );
      },
    );
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr006'),
      );
    }
    SocketUtil.emit(
      SocketEventName.ENTRY,
      {
        entry: {
          _id: `${entry._id}`,
          additional: {
            templateId: entry.templateId,
          },
        },
        message: 'Entry removed.',
        source: sid,
        type: 'remove',
      },
    );
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(entry)),
    );
  }
}
