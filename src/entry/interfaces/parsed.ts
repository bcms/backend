import { PropParsed, PropType } from '../../prop';

export interface EntryParsedMeta {
  [lng: string]: {
    [key: string]: PropParsed;
  };
}

export interface EntryParsedContent {
  [lng: string]: Array<{
    type: PropType;
    value: PropParsed;
    name: string;
  }>;
}

export interface EntryParsed {
  _id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status: string;
  meta: EntryParsedMeta;
  content: EntryParsedContent;
}
