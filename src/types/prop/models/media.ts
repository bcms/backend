export type BCMSPropMediaData = string;

export interface BCMSPropMediaDataParsed {
  _id: string;
  src: string;
  name: string;
  width: number;
  height: number;
  caption: string;
  alt_text: string;
}

export interface BCMSPropValueMediaData {
  _id: string;
  alt_text?: string;
  caption?: string;
}
