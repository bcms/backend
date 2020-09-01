import { Template, FSTemplate } from '../models';
import { Types } from 'mongoose';
import { PropType } from '../../prop';

export class TemplateFactory {
  public static get instance(): Template | FSTemplate {
    if (process.env.DB_USE_FS === 'true') {
      return new FSTemplate(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
        [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
        ],
      );
    } else {
      return new Template(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
        [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
        ],
      );
    }
  }
}
