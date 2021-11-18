import type {
  BCMSGroup,
  BCMSTemplate,
  BCMSTypeConverterResultItem,
  BCMSWidget,
} from '@bcms/types';

export class BCMSTypeConverter {
  static async typescript({
    target,
    type,
    skip,
  }: {
    target: BCMSGroup | BCMSWidget | BCMSTemplate;
    type: 'group' | 'template' | 'widget';
    skip?: string[];
  }): Promise<BCMSTypeConverterResultItem[]> {
    // eslint-disable-next-line no-console
    console.log({ type, target, skip });
    return [];
  }
}
