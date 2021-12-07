import {
  BCMSGroup,
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
    let containsMediaProp = false;
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
        propType = `${prop.type.toLowerCase()}${prop.array ? '[]' : ''}`;
      } else if (prop.type === BCMSPropType.COLOR_PICKER) {
        propType = `string${prop.array ? '[]' : ''}`;
      } else if (prop.type === BCMSPropType.TAG) {
        propType = 'string[]';
      } else if (prop.type === BCMSPropType.DATE) {
        propType = 'number[]';
      } else if (prop.type === BCMSPropType.ENUMERATION) {
        const textInEnum: string[] = [];
        let textEnum = '';
        const enumName = `${toCamelCase(prop.name)}Enum`;
        textInEnum.push(
          `${(prop.defaultData as BCMSPropEnumData).items
            .map((e) => `${e}='${e}',`)
            .join('\n')}`,
        );
        textEnum += [
          `// eslint-disable-next-line no-shadow 
export enum ${enumName} {`,
          ...textInEnum,
          '}',
        ].join('\n');
        output.push({
          outputFile: `enum/${prop.name}.ts`,
          content: textEnum,
        });
        textInterface += `import type { ${enumName} } from '../enum/${prop.name}';\n`;
        propType = `${enumName}`;
      } 
   else if (prop.type === BCMSPropType.ENTRY_POINTER) {
    const entryName = `${toCamelCase(prop.name)}Entry`;


    textInterface += `import type { ${entryName} } from '../entry/${prop.name}';\n`;
    propType = `${entryName}`;
   }
      else if (prop.type === BCMSPropType.GROUP_POINTER) {
        const groupId = (prop.defaultData as BCMSPropGroupPointerData)._id;
        const group = await BCMSRepo.group.findById(groupId);
        console.log(skip)
        if (group) {
          if(skip.map((s) => s ===(`.../group/${group.name}.ts`))){
            skipAdd = false
          const groupInterfaceName = `${toCamelCase(group.name)}Group`;
          skip.push(`../group/${group.name}.ts`);
          output.push(
            ...(await this.typescript({
              target: group,
              type: 'group',
              skip: skip,
            })),
            );
            textInterface += `import type { ${groupInterfaceName} } from '../group/${group.name}';\n`;
            propType = `${groupInterfaceName}${prop.array ? '[]' : ''}`;
            console.log("skip:",skip)
        } }else {
          console.log('ok')
          skipAdd = true;
        }
      } else if (prop.type === BCMSPropType.RICH_TEXT) {
        propType = 'string';
      } else if (prop.type === BCMSPropType.MEDIA) {
        containsMediaProp = true;
        propType = 'BCMSMediaParsed';
      }
      if (!skipAdd) {
        allText.push(`  ${prop.name}: ${propType};`);
      }
    }
    if (containsMediaProp) {
      textInterface += `import type { BCMSMediaParsed } from '@becomes/cms-client/types';\n\n`;
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
    //     else if (type === 'group') {
    //       //   let groupFile;

    //       //  const p = await fs.stat('../group')
    //       //  if(p.isFile())
    //       //    {
    //       //     groupFile = '../group';
    //       //   } else {
    //       const groupFile = await fs.mkdir(path.join(__dirname, 'group'), {
    //         recursive: true,
    //       });
    //       // }
    //       const name = (target as BCMSGroup).name;
    //       const props = (target as BCMSGroup).props;
    //       const desc = (target as BCMSGroup).desc;
    //       let label = (target as BCMSGroup).label;
    //       label = changeLabel(label);
    //       const nameInterface = label + 'Group';
    //       let textInterface = '';
    //       const allText = [];
    //       let typeProp = '';
    //       for (let i = 0; i < props.length; i++) {
    //         const prop = props[i];
    //         typeProp = prop.type.toLowerCase();
    //         const nameProp = prop.name.toLowerCase();
    //         if (typeProp === 'media') {
    //           typeProp = 'BCMSMediaParser';
    //         }
    //         if (typeProp === 'rich_text') {
    //           typeProp = 'string';
    //         }
    //         allText.push(`\n${nameProp}:${typeProp}`);
    //       }
    //       textInterface = `${
    //         typeProp === 'media'
    //           ? `import type { BCMSMediaParsed } from '@becomes/cms-client/types'`
    //           : ``
    //       }
    // /**
    //   * ${desc}
    //   */
    // export interface ${nameInterface} {${allText}\n} `;

    //       await fs.writeFile(`${groupFile}/${name}.ts`, textInterface);
    //       group = {
    //         outputFile: `group/${name}.ts`,
    //         content: textInterface,
    //       };
    //     } else if (type === 'template') {
    //       let templateFile;
    //       // const p = await fs.stat('../widget')
    //       // if(p.isFile())
    //       //   {
    //       //    widgetFile = '../widget';
    //       //  } else {
    //       try {
    //         await fs.access('/template');
    //         templateFile = '/template';
    //       } catch {
    //         templateFile = await fs.mkdir(path.join(__dirname, 'template'), {
    //           recursive: true,
    //         });
    //       }
    //       // }
    //       const name = (target as BCMSWidget).name;
    //       const props = (target as BCMSWidget).props;
    //       const desc = (target as BCMSWidget).desc;
    //       let label = (target as BCMSWidget).label;
    //       label = changeLabel(label);
    //       const nameInterface = label + 'Template';
    //       let textInterface = '';
    //       const allText = [];
    //       let propType = '';
    //       let propTypeGroup = '';
    //       let propGroupName = '';
    //       let typeProp = '';

    //       let typeName = '';
    //       for (let i = 0; i < props.length; i++) {
    //         const prop = props[i];
    //         typeProp = prop.type.toLowerCase();
    //         const nameProp = prop.name.toLowerCase();

    //         if (typeProp === 'group_pointer') {
    //           propTypeGroup = 'group_pointer';
    //           const groupId = (prop.defaultData as BCMSPropGroupPointerData)._id;
    //           const groupPointer = await BCMSRepo.group.findById(groupId);
    //           typeProp = `${changeLabel(
    //             groupPointer ? groupPointer.label : '',
    //           )}Group`;
    //           propGroupName = typeProp;
    //           typeName = groupPointer?.name as string;
    //           this.typescript({
    //             target: groupPointer as BCMSGroup,
    //             type: 'group',
    //             skip: [],
    //           });
    //         }
    //         if (typeProp === 'rich_text') {
    //           typeProp = 'string';
    //         }
    //         if (typeProp === 'media') {
    //           propType = 'media';
    //           typeProp = 'BCMSMediaParsed';
    //         }
    //         allText.push(`\n${nameProp}:${typeProp}`);
    //       }
    //       textInterface = `${
    //         propType === 'media'
    //           ? `import type { BCMSMediaParsed } from '@becomes/cms-client/types'`
    //           : ``
    //       }
    //     ${
    //       (console.log(propType),
    //       propTypeGroup === 'group_pointer'
    //         ? `
    // import type {${propGroupName}} from '../group/${typeName}'`
    //         : ``)
    //     }

    //   /**
    //   * ${desc}
    //   */
    // export interface ${nameInterface} {${allText}\n} `;
    //       await fs.writeFile(`${templateFile}/${name}.ts`, textInterface);

    //       template = {
    //         outputFile: `${templateFile}/${name}.ts`,
    //         content: textInterface,
    //       };
    //     }
    return output;
    // console.log(group, widget, template);
    // return [widget, group];
  }
}
function toCamelCase(nameEncoded: string) {
  return nameEncoded
    .split('_')
    .map((e) => e.substring(0, 1).toUpperCase() + e.substring(1))
    .join('');
}
// function changeLabel(label: string) {
//   return label
//     .replace(
//       /(^\w|\s\w)(\S*)/g,
//       (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase(),
//     )
//     .replace(/\s/g, '');
// }
