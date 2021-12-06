import type {
  BCMSGroup,
  BCMSPropGroupPointerData,
  BCMSTemplate,
  BCMSTypeConverterResultItem,
  BCMSWidget,
} from '@bcms/types';
import * as fs from 'fs/promises';
import { BCMSRepo } from '@bcms/repo';
import path = require('path');
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
    // let f:BCMSTypeConverterResultItem
    let widget = {
      outputFile: '',
      content: '',
    };
    let group = {
      outputFile: '',
      content: '',
    };
    let template = {
      outputFile: '',
      content: '',
    };
    if (type === 'widget') {
      // let widgetFile;
      // const p = await fs.stat('../widget')
      // if(p.isFile())
      //   {
      //    widgetFile = '../widget';
      //  } else {
     
      const widgetFile = await fs.mkdir(path.join(__dirname, 'widget'), {
        recursive: true,
      });
      // }
      const name = (target as BCMSWidget).name;
      const props = (target as BCMSWidget).props;
      const desc = (target as BCMSWidget).desc;
      let label = (target as BCMSWidget).label;
      label = changeLabel(label);
      const nameInterface = label + 'Widget';
      let textInterface = '';
      const allText = [];
      let propType = '';
      let typeProp = '';
      let typeName = '';
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        typeProp = prop.type.toLowerCase();
        const nameProp = prop.name.toLowerCase();
        propType = typeProp;
        if (typeProp === 'group_pointer') {
          const groupId = (prop.defaultData as BCMSPropGroupPointerData)._id;
          const groupPointer = await BCMSRepo.group.findById(groupId);
          typeProp = `${changeLabel(
            groupPointer ? groupPointer.label : '',
          )}Group`;
          typeName = groupPointer?.name as string;
          this.typescript({
            target: groupPointer as BCMSGroup,
            type: 'group',
            skip: [],
          });
        }
        if (typeProp === 'rich_text') {
          typeProp = 'string';
        }
        if (typeProp === 'media') {
          typeProp = 'BCMSMediaParser';
        }
        allText.push(`\n${nameProp}:${typeProp}`);
      }
      textInterface = `${
        propType === 'media'
          ? `import type { BCMSMediaParsed } from '@becomes/cms-client/types'`
          : ``
      }
   ${
     propType === 'group_pointer'
       ? `
import type {${typeProp}} from '../group/${typeName}'`
       : ``
   }
  
  /**
  * ${desc}
  */ 
export interface ${nameInterface} {${allText}\n} `;
      await fs.writeFile(`${widgetFile}/${name}.ts`, textInterface);

      widget = {
        outputFile: `${widgetFile}/${name}.ts`,
        content: textInterface,
      };
    }
    if (type === 'group') {
      //   let groupFile;

      //  const p = await fs.stat('../group')
      //  if(p.isFile())
      //    {
      //     groupFile = '../group';
      //   } else {
      const groupFile = await fs.mkdir(path.join(__dirname, 'group'), {
        recursive: true,
      });
      // }
      const name = (target as BCMSGroup).name;
      const props = (target as BCMSGroup).props;
      const desc = (target as BCMSGroup).desc;
      let label = (target as BCMSGroup).label;
      label = changeLabel(label);
      const nameInterface = label + 'Group';
      let textInterface = '';
      const allText = [];
      let typeProp = '';
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        typeProp = prop.type.toLowerCase();
        const nameProp = prop.name.toLowerCase();
        if (typeProp === 'media') {
          typeProp = 'BCMSMediaParser';
        }
        if (typeProp === 'rich_text') {
          typeProp = 'string';
        }
        allText.push(`\n${nameProp}:${typeProp}`);
      }
      textInterface = `${
        typeProp === 'media'
          ? `import type { BCMSMediaParsed } from '@becomes/cms-client/types'`
          : ``
      }
/**
  * ${desc}
  */ 
export interface ${nameInterface} {${allText}\n} `;

      await fs.writeFile(`${groupFile}/${name}.ts`, textInterface);
      group = {
        outputFile: `group/${name}.ts`,
        content: textInterface,
      };
    }
    if (type === 'template') {
      let templateFile;
      // const p = await fs.stat('../widget')
      // if(p.isFile())
      //   {
      //    widgetFile = '../widget';
      //  } else {
       try{
         await fs.access('/template')
         templateFile = '/template'
       }catch{
          templateFile = await fs.mkdir(path.join(__dirname, 'template'), {
           recursive: true,
         });

       }
      // }
      const name = (target as BCMSWidget).name;
      const props = (target as BCMSWidget).props;
      const desc = (target as BCMSWidget).desc;
      let label = (target as BCMSWidget).label;
      label = changeLabel(label);
      const nameInterface = label + 'Template';
      let textInterface = '';
      const allText = [];
      let propType = '';
      let propTypeGroup = '';
      let propGroupName = '';
      let typeProp = '';

      let typeName = '';
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        typeProp = prop.type.toLowerCase();
        const nameProp = prop.name.toLowerCase();

        if (typeProp === 'group_pointer') {
          propTypeGroup = 'group_pointer';
          const groupId = (prop.defaultData as BCMSPropGroupPointerData)._id;
          const groupPointer = await BCMSRepo.group.findById(groupId);
          typeProp = `${changeLabel(
            groupPointer ? groupPointer.label : '',
          )}Group`;
          propGroupName = typeProp;
          typeName = groupPointer?.name as string;
          this.typescript({
            target: groupPointer as BCMSGroup,
            type: 'group',
            skip: [],
          });
        }
        if (typeProp === 'rich_text') {
          typeProp = 'string';
        }
        if (typeProp === 'media') {
          propType = 'media';
          typeProp = 'BCMSMediaParsed';
        }
        allText.push(`\n${nameProp}:${typeProp}`);
      }
      textInterface = `${
        propType === 'media'
          ? `import type { BCMSMediaParsed } from '@becomes/cms-client/types'`
          : ``
      }
    ${
      (console.log(propType),
      propTypeGroup === 'group_pointer'
        ? `
import type {${propGroupName}} from '../group/${typeName}'`
        : ``)
    }
  
  /**
  * ${desc}
  */ 
export interface ${nameInterface} {${allText}\n} `;
      await fs.writeFile(`${templateFile}/${name}.ts`, textInterface);

      template = {
        outputFile: `${templateFile}/${name}.ts`,
        content: textInterface,
      };
    }
    console.log(group, widget, template);
    return [widget, group];
  }
}
function changeLabel(label: string) {
  return label
    .replace(
      /(^\w|\s\w)(\S*)/g,
      (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase(),
    )
    .replace(/\s/g, '');
}
