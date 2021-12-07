import {
  BCMSGroup,
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropType,
  BCMSTemplate,
  BCMSTypeConverterResultItem,
  BCMSWidget,
} from '@bcms/types';
import { BCMSRepo } from '@bcms/repo';
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
    if (!skip) {
      skip = [];
    }
    const bcmsImports: {
      [name: string]: boolean;
    } = {};
    let interfaceNameType = '';
    switch (type) {
      case 'group':
        interfaceNameType = 'Group';
        break;
      case 'template':
        interfaceNameType = 'Template';
        break;
      case 'widget':
        interfaceNameType = 'Widget';
    } 
    const output: BCMSTypeConverterResultItem[] = [];
    const name = target.name;
    const props = target.props;
    const desc = target.desc;
    const interfaceName = toCamelCase(name) + interfaceNameType;
    let textInterface = '';
    const allText: string[] = [];
    let skipAdd = false;
    for (let i = 0; i < props.length; i++) {
      skipAdd = false;
      const prop = props[i];
      let propType = '';
      if (
        prop.type === BCMSPropType.STRING ||
        prop.type === BCMSPropType.NUMBER ||
        prop.type === BCMSPropType.BOOLEAN
      ) {
        propType = `${prop.type.toLowerCase()}`;
      } else if (prop.type === BCMSPropType.COLOR_PICKER) {
        propType = `string`;
      } else if (prop.type === BCMSPropType.TAG) {
        propType = 'string';
      } else if (prop.type === BCMSPropType.DATE) {
        propType = 'number';
      } else if (prop.type === BCMSPropType.ENUMERATION) {
        const enumName = `${toCamelCase(prop.name)}Enum`;
        const enumContent = [
          `export type ${enumName} = `,
          (prop.defaultData as BCMSPropEnumData).items
            .map((e) => `  | '${e}'`)
            .join('\n'),
        ].join('\n');
        output.push({
          outputFile: `enum/${prop.name}.ts`,
          content: enumContent,
        });
        textInterface += `import type { ${enumName} } from '../enum/${prop.name}';\n`;
        bcmsImports['BCMSPropEnum'] = true;
        propType = `BCMSPropEnum<${enumName}>`;
      } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
        let entryContent = '';
        const entryName = `${toCamelCase(prop.name)}Entry`;
        const templateId = (prop.defaultData as BCMSPropEntryPointerData)
          .templateId;
        const template = await BCMSRepo.template.findById(templateId);
        let templateName = '';
        if (template) {
          const entry = await BCMSRepo.entry.methods.findAllByTemplateId(
            template._id,
          );
          templateName = `${toCamelCase(template.name)}Template`;
          if (!skip.includes(`../template/${template.name}.ts`)) {
            skip.push(`../template/${template.name}.ts`);
            output.push(
              ...(await this.typescript({
                target: template,
                type: 'template',
                skip: skip,
              })),
            );
            entryContent += `import type { ${templateName} } from '../template/${template.name}';\n`;
          }
          
          let lng = '';
          for (let j = 0; j < entry.length; j++) {
            let oneMetaLng = '';
            let oneContentLng = '';
            for (let k = 0; k < entry[j].meta.length; k++) {
              const item = entry[j].meta[k].lng;
              oneMetaLng += ` ${item}: ${templateName}; `;
              oneContentLng += ` ${item}: BCMSEntryContentParsed; `;
            }
            lng += `meta: {${oneMetaLng}}, \n  content: {${oneContentLng}}`;
          }
          entryContent += [
            `import type { BCMSEntryContentParsed } from '@becomes/cms-client/types';\n\n`,
            `export interface ${entryName} {`,
            `  id: string,\n  createdAt: number,\n  cid: string, \n  templateId: string, `,
            `  userId: string, \n  status?: string, \n  ${lng}\n}`,
          ].join('\n');
          output.push({
            outputFile: `entry/${prop.name}.ts`,
            content: entryContent,
          });

          textInterface += `import type { ${entryName} } from '../entry/${prop.name}';\n`;
          propType = `${entryName}`;
        } else {
          skipAdd = true;
        }
      } else if (prop.type === BCMSPropType.GROUP_POINTER) {
        const groupId = (prop.defaultData as BCMSPropGroupPointerData)._id;
        const group = await BCMSRepo.group.findById(groupId);
        if (group) {
          const groupInterfaceName = `${toCamelCase(group.name)}Group`;
          if (!skip.includes(`../group/${group.name}.ts`)) {
            skip.push(`../group/${group.name}.ts`);
            output.push(
              ...(await this.typescript({
                target: group,
                type: 'group',
                skip: skip,
              })),
            );
            textInterface += `import type { ${groupInterfaceName} } from '../group/${group.name}';\n`;
          }
          propType = `${groupInterfaceName}`;
        } else {
          skipAdd = true;
        }
      } else if (prop.type === BCMSPropType.RICH_TEXT) {
        bcmsImports['BCMSPropRichTextDataParsed'] = true;
        propType = 'BCMSPropRichTextDataParsed';
      } else if (prop.type === BCMSPropType.MEDIA) {
        bcmsImports['BCMSMediaParsed'] = true;
        propType = 'BCMSMediaParsed';
      }
      if (!skipAdd) {
        allText.push(`  ${prop.name}: ${propType}${prop.array ? '[]' : ''};`);
      }
    }
    const bcmsImportKeys = Object.keys(bcmsImports);
    if (bcmsImportKeys.length > 0) {
      textInterface += `import type { ${bcmsImportKeys.join(
        ', ',
      )} } from '@becomes/cms-client/types';\n\n`;
    }
    textInterface += [
      '/**',
      ...desc.split('\n').map((e) => '* ' + e),
      '*/',
      `export interface ${interfaceName} {`,
      ...allText,
      '}',
    ].join('\n');

    output.push({
      outputFile: `${type}/${name}.ts`,
      content: textInterface,
    });
    return output;
  }
}
function toCamelCase(nameEncoded: string) {
  return nameEncoded
    .split('_')
    .map((e) => e.substring(0, 1).toUpperCase() + e.substring(1))
    .join('');
}
