export interface BCMSTypeConverterProp {
  name: string;
  type: string;
}

export interface BCMSTypeConverterRootTS {
  name: string;
  type: 'interface' | 'type';
  output: string;
  description?: string;
}

export interface BCMSTypeConverterResultTS {
  root: BCMSTypeConverterRootTS;
  extends?: string[];
  union?: string[];
  props: BCMSTypeConverterProp[];
  dependencies?: BCMSTypeConverterResultTS[];
}

export interface BCMSTypeConverterResultItem {
  outputFile: string;
  content: string;
}

