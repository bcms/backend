import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import { BCMSPropType } from '../types';
import type { BCMSTemplate, BCMSTemplateFactory } from './types';

let tempFactory: BCMSTemplateFactory;

export function useBcmsTemplateFactory(): BCMSTemplateFactory {
  if (!tempFactory) {
    const bcmsConfig = useBcmsConfig();
    tempFactory = {
      create(data) {
        const temp: BCMSTemplate = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          desc: data.desc ? data.desc : '',
          label: data.label ? data.label : '',
          name: data.name ? data.name : '',
          singleEntry: data.singleEntry ? data.singleEntry : false,
          userId: data.userId ? data.userId : '',
          props: data.props
            ? data.props
            : [
                {
                  label: 'Title',
                  name: 'title',
                  array: false,
                  required: true,
                  type: BCMSPropType.STRING,
                  value: [''],
                },
                {
                  label: 'Slug',
                  name: 'slug',
                  array: false,
                  required: true,
                  type: BCMSPropType.STRING,
                  value: [''],
                },
              ],
        };
        if (bcmsConfig.database.fs) {
          temp._id = temp._id.toHexString() as never;
        }
        return temp;
      },
    };
  }

  return tempFactory;
}
