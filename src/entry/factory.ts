import { Types } from 'mongoose';
import {
  BCMSEntryFactory,
  BCMSEntryMeta,
  BCMSPropType,
  BCMSPropValue,
} from '../types';

export function createBcmsEntryFactory(): BCMSEntryFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        templateId: data.templateId ? data.templateId : '',
        userId: data.userId ? data.userId : '',
        status: data.status ? data.status : '',
        meta: data.meta ? data.meta : [],
        content: data.content ? data.content : [],
      };
    },
    toLite(entry, template) {
      const entryMeta: BCMSEntryMeta[] = [];
      for (let k = 0; k < entry.meta.length; k++) {
        const meta = entry.meta[k];
        let imageProp: BCMSPropValue | undefined;
        if (template) {
          const tProp = template.props.find(
            (e) => e.type === BCMSPropType.MEDIA,
          );
          if (tProp) {
            imageProp = meta.props.find((e) => e.id === tProp.id);
          }
        }
        entryMeta.push({
          lng: meta.lng,
          props: imageProp
            ? [...meta.props.slice(0, 2), imageProp]
            : meta.props.slice(0, 2),
        });
      }
      return {
        _id: entry._id,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        cid: entry.cid,
        templateId: entry.templateId,
        userId: entry.userId,
        meta: entryMeta,
      };
    },
  };
}
