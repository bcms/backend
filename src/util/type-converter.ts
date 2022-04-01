import {
  BCMSProp,
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropType,
  BCMSTypeConverterResultItem,
  BCMSTypeConverterTarget,
} from '@bcms/types';
import { BCMSRepo } from '@bcms/repo';
interface BCMSTypeConverterPropsResult {
  props: Array<{
    name: string;
    type: string;
  }>;
  imports: BCMSImports;
}
interface ImportMetadata {
  name: string;
  type: 'entry' | 'group' | 'widget' | 'enum';
  props?: BCMSProp[];
  enumItems?: string[];
}
class BCMSImports {
  state: {
    [path: string]: {
      [name: string]: {
        metadata?: ImportMetadata;
      };
    };
  } = {};
  set(name: string, path: string, metadata?: ImportMetadata) {
    if (!this.state[path]) {
      this.state[path] = {};
    }
    this.state[path][name] = {
      metadata,
    };
  }
  addMetadata(name: string, path: string, metadata: ImportMetadata) {
    this.state[path][name].metadata = metadata;
  }
  fromImports(imports: BCMSImports) {
    for (const path in imports.state) {
      for (const name in imports.state[path]) {
        this.set(name, path, imports.state[path][name].metadata);
      }
    }
  }
  flatten(): string[] {
    const output: string[] = [];
    for (const path in this.state) {
      const names = Object.keys(this.state[path]);
      if (!names[0]) {
        console.log(this.state[path][names[0]]);
      }
      output.push(
        `import type { ${
          names.length > 1
            ? '\n' + names.map((e) => '  ' + e).join(',\n') + '\n'
            : names[0] + ' pera'
        }} from '${path}';`,
      );
    }
    return output;
  }
  flattenForJSDoc(): string[] {
    const output: string[] = [];
    for (const path in this.state) {
      const names = Object.keys(this.state[path]);
      names.map((e) => {
        output.push(` *  @typedef { import('${path}').${e} } ${e}`);
      });
    }
    return output;
  }
}

export class BCMSTypeConverter {
  static async bcmsPropTypeToConvertType(
    prop: BCMSProp,
  ): Promise<{ type: string; imports: BCMSImports }> {
    let output = '';
    const imports = new BCMSImports();
    if (
      prop.type === BCMSPropType.BOOLEAN ||
      prop.type === BCMSPropType.STRING ||
      prop.type === BCMSPropType.NUMBER
    ) {
      output = prop.type.toLowerCase();
    } else if (prop.type === BCMSPropType.COLOR_PICKER) {
      output = 'string';
    } else if (prop.type === BCMSPropType.DATE) {
      output = 'number';
    } else if (prop.type === BCMSPropType.ENUMERATION) {
      const data = prop.defaultData as BCMSPropEnumData;
      output = toCamelCase(prop.name) + 'EnumType';
      const path = `../enum/${prop.name}`;
      imports.set(output, path);
      imports.addMetadata(output, path, {
        name: prop.name,
        type: 'enum',
        enumItems: data.items,
      });
    } else if (prop.type === BCMSPropType.GROUP_POINTER) {
      const data = prop.defaultData as BCMSPropGroupPointerData;
      const group = await BCMSRepo.group.findById(data._id);
      if (group) {
        output = toCamelCase(group.name) + 'Group';
        const path = `../group/${group.name}`;
        imports.set(output, path);
        imports.addMetadata(output, path, {
          name: group.name,
          type: 'group',
          props: group.props,
        });
      }
    } else if (prop.type === BCMSPropType.MEDIA) {
      output = 'BCMSMediaParsed';
      imports.set(output, '@becomes/cms-client/types');
    } else if (prop.type === BCMSPropType.RICH_TEXT) {
      output = 'BCMSPropRichTextDataParsed';
      imports.set(output, '@becomes/cms-client/types');
    } else if (prop.type === BCMSPropType.TAG) {
      output = 'string';
    } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
      const data = prop.defaultData as BCMSPropEntryPointerData[];
      const outputTypes: string[] = [];
      for (let j = 0; j < data.length; j++) {
        const info = data[j];
        const template = await BCMSRepo.template.findById(info.templateId);
        if (template) {
          outputTypes.push(toCamelCase(template.name) + 'Entry');
          const path = `../entry/${template.name}`;
          imports.set(output, path);
          imports.addMetadata(output, path, {
            name: template.name,
            type: 'entry',
            props: template.props,
          });
        }
      }
      if (outputTypes.length > 0) {
        output = outputTypes.join(' | ');
      }
    }
    return { type: prop.array ? output + '[]' : output, imports };
  }
  static async toConvertProps({
    props,
  }: {
    props: BCMSProp[];
  }): Promise<BCMSTypeConverterPropsResult> {
    const output: BCMSTypeConverterPropsResult = {
      imports: new BCMSImports(),
      props: [],
    };
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const typeResult = await this.bcmsPropTypeToConvertType(prop);
      output.imports.fromImports(typeResult.imports);
      output.props.push({
        name: prop.name,
        type: typeResult.type,
      });
    }
    return output;
  }
  static async typescript(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [outputFile: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};
    while (loop) {
      const target = data.pop();
      if (!target) {
        loop = false;
      } else {
        if (target.type === 'enum' && target.enumItems) {
          const baseName = `${toCamelCase(target.name)}Enum`;
          output[`enum/${target.name}.ts`] = [
            `export type ${baseName} =`,
            ...target.enumItems.map((e) => `  | '${e}'`),
            ';',
          ].join('\n');
          output[`enum/${target.name}.ts`] += [
            `\n\nexport interface ${baseName}Type {`,
            `  items: ${baseName}[];`,
            `  selected: ${baseName};`,
            `}`,
          ].join('\n');
        } else if (target.props) {
          const props = target.props;
          const result = await this.toConvertProps({ props });
          const interfaceName = toCamelCase(target.name + '_' + target.type);
          let typescriptProps: string[] = [];
          let additional: string[] = [''];
          if (target.type === 'entry') {
            const languages = await BCMSRepo.language.findAll();
            typescriptProps = [
              '  _id: string;',
              '  createdAt: number;',
              '  updatedAt: number;',
              '  templateId: string;',
              '  userId: string;',
              '  status?: string;',
              '  meta: {',
              ...languages.map(
                (lng) => `    ${lng.code}: ${interfaceName}Meta;`,
              ),
              '  }',
              '  content: {',
              ...languages.map(
                (lng) => `    ${lng.code}: BCMSEntryContentParsed;`,
              ),
              '  }',
            ];
            result.imports.set(
              'BCMSEntryContentParsed',
              '@becomes/cms-client/types',
            );
            additional = [
              '',
              `export interface ${interfaceName}Meta {`,
              ...result.props.map((prop) => `  ${prop.name}: ${prop.type};`),
              '}',
              '',
            ];
          } else {
            typescriptProps = result.props.map(
              (prop) => `  ${prop.name}: ${prop.type};`,
            );
          }
          output[`${target.type}/${target.name}.ts`] = [
            ...result.imports.flatten(),
            ...additional,
            `export ${
              target.type === 'enum' ? 'type' : 'interface'
            } ${toCamelCase(target.name + '_' + target.type)} {`,
            ...typescriptProps,
            '}',
          ].join('\n');

          const importsState = result.imports.state;
          for (const path in importsState) {
            if (!path.startsWith('@becomes')) {
              for (const name in importsState[path]) {
                const metadata = importsState[path][name].metadata;
                if (metadata && !parsedItems[name]) {
                  data.push(metadata);
                }
              }
            }
          }
        }
      }
    }
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }
  static async jsDoc(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [outputFile: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};

    while (loop) {
      const target = data.pop();
      if (!target) {
        loop = false;
      } else {
        if (target.type === 'enum' && target.enumItems) {
          output[`enum/${target.name}.js`] = [
            `/** `,
            ' *  @typedef {(',
            ...target.enumItems.map((e) => ` *              | '${e}'`),
            ` *           )} ${toCamelCase(target.name)}Enum `,
            ' */',
          ].join('\n');
        } else if (target.props) {
          const props = target.props;
          const result = await this.toConvertProps({ props });
          const interfaceName = toCamelCase(target.name + '_' + target.type);
          let jsDocProps: string[] = [];
          let additional: string[] = [''];
          if (target.type === 'entry') {
            const languages = await BCMSRepo.language.findAll();
            jsDocProps = [
              ' *  @property { string } id',
              ' *  @property { number } createdAt',
              ' *  @property { number } updatedAt',
              ' *  @property { string } cid',
              ' *  @property { string } templateId',
              ' *  @property { string } userId',
              ' *  @property { string } status',
              ' *  @property {{  ',
              ...languages.map(
                (lng) => ` *              ${lng.code}: ${interfaceName}Meta `,
              ),
              ' *            }} meta',
              ' *  @property {{  ',
              ...languages.map(
                (lng) =>
                  ` *               ${lng.code}: BCMSEntryContentParsed `,
              ),
              ' *            }} content',
            ];

            result.imports.set(
              'BCMSEntryContentParsed',
              '@becomes/cms-client/types',
            );
            additional = [
              ' *',
              ` *  @typedef { Object } ${interfaceName}Meta`,
              ...result.props.map(
                (prop) => ` *  @property { ${prop.type} } ${prop.name}`,
              ),
              ' *',
            ];
          } else {
            jsDocProps = result.props.map(
              (prop) => ` *  @property { ${prop.type} } ${prop.name}`,
            );
          }
          output[`${target.type}/${target.name}.js`] = [
            `/**`,
            ...result.imports.flattenForJSDoc(),
            ...additional,
            ` *  @typedef { Object } ${toCamelCase(
              target.name + '_' + target.type,
            )}`,
            ...jsDocProps,
            ` */`,
          ].join('\n');
          const importsState = result.imports.state;
          for (const path in importsState) {
            if (!path.startsWith('@becomes')) {
              for (const name in importsState[path]) {
                const metadata = importsState[path][name].metadata;
                if (metadata && !parsedItems[name]) {
                  data.push(metadata);
                }
              }
            }
          }
        }
      }
    }
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }
}
function toCamelCase(nameEncoded: string) {
  return nameEncoded
    .split('_')
    .map((e) => e.substring(0, 1).toUpperCase() + e.substring(1))
    .join('');
}
