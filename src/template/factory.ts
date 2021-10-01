import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { BCMSPropType, BCMSTemplate, BCMSTemplateFactory } from '../types';
import { BCMSConfig } from '@bcms/config';

export function createBcmsTemplateFactory(): BCMSTemplateFactory {
  return {
    create(data) {
      const temp: BCMSTemplate = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        desc: data.desc ? data.desc : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        singleEntry: data.singleEntry ? data.singleEntry : false,
        userId: data.userId ? data.userId : '',
        props: data.props
          ? data.props
          : [
              {
                id: uuidv4(),
                label: 'Title',
                name: 'title',
                array: false,
                required: true,
                type: BCMSPropType.STRING,
                defaultData: [''],
              },
              {
                id: uuidv4(),
                label: 'Slug',
                name: 'slug',
                array: false,
                required: true,
                type: BCMSPropType.STRING,
                defaultData: [''],
              },
            ],
      };
      if (BCMSConfig.database.fs) {
        temp._id = `${temp._id}` as never;
      }
      return temp;
    },
  };
}
