import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { BCMSPropValueWidgetData, BCMSPropParsed } from '../../prop';

export interface BCMSEntryContent {
  lng: string;
  nodes: BCMSEntryContentNode[];
}
export const BCMSEntryContentFSDBSchema: ObjectSchema = {
  lng: {
    __type: 'string',
    __required: true,
  },
  nodes: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {},
    },
  },
};
export const BCMSEntryContentMongoDBSchema = new Schema({
  lng: {
    type: String,
    required: true,
  },
  nodes: {
    type: [Object],
    required: true,
  },
});

export interface BCMSEntryContentNode {
  type: BCMSEntryContentNodeType;
  content?: BCMSEntryContentNode[];
  attrs?:
    | BCMSEntryContentNodeHeadingAttr
    | BCMSPropValueWidgetData
    | BCMSEntryContentNodeLinkAttr;
  marks?: BCMSEntryContentNodeMarker[];
  text?: string;
}

export interface BCMSEntryContentNodeHeadingAttr {
  level: number;
}

export interface BCMSEntryContentNodeLinkAttr {
  href: string;
  target: string;
}

export interface BCMSEntryContentNodeMarker {
  type: BCMSEntryContentNodeMarkerType;
  attrs?: BCMSEntryContentNodeLinkAttr;
}

// eslint-disable-next-line no-shadow
export enum BCMSEntryContentNodeType {
  paragraph = 'paragraph',
  heading = 'heading',
  widget = 'widget',
  bulletList = 'bulletList',
  listItem = 'listItem',
  orderedList = 'orderedList',
  text = 'text',
}

// eslint-disable-next-line no-shadow
export enum BCMSEntryContentNodeMarkerType {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  strike = 'strike',
  link = 'link',
}

export interface BCMSEntryContentParsedItem {
  type: BCMSEntryContentNodeType;
  attrs?: {
    level?: number;
  };
  value: string | BCMSPropParsed;
}

export interface BCMSEntryContentParsed {
  [lng: string]: BCMSEntryContentParsedItem[];
}
