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
  }: {
    target: BCMSGroup | BCMSWidget | BCMSTemplate;
    type: 'group' | 'template' | 'widget';
  }): Promise<BCMSTypeConverterResultItem[]> {
    // eslint-disable-next-line no-console
    console.log(type, target);
    return [];
  }
}
