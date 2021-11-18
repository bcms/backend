import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import type { Module } from '@becomes/purple-cheetah/types';
import type {
  BCMSEntryParsed,
  BCMSEntryParser,
  BCMSStatus,
} from '../types';

let parser: BCMSEntryParser;

export function useBcmsEntryParser(): BCMSEntryParser {
  return parser;
}

export function createBcmsEntryParser(): Module {
  return {
    name: 'Entry parser',
    initialize(moduleConfig) {
      parser = {
        async parse({ entry, maxDepth, depth, level }) {
          if (!level) {
            level = 'entry';
          }
          if (!depth) {
            depth = 0;
          }
          let status: BCMSStatus | null = null;
          if (entry.status) {
            status = await BCMSRepo.status.findById(entry.status);
          }
          const entryParsed: BCMSEntryParsed = {
            _id: entry._id,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            templateId: entry.templateId,
            userId: entry.userId,
            status: status ? status.name : '',
            meta: {},
          };
          const langs = await BCMSRepo.language.findAll();
          const temp = await BCMSRepo.template.findById(entry.templateId);
          if (!temp) {
            return null;
          }
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const meta = entry.meta.find((e) => e.lng === lang.code);
            if (meta) {
              entryParsed.meta[lang.code] = await BCMSPropHandler.parse({
                meta: temp.props,
                values: meta.props,
                maxDepth,
                depth: 0,
                level: entry._id,
                onlyLng: lang.code,
              });
            } else {
              entryParsed.meta[lang.code] = await BCMSPropHandler.parse({
                meta: temp.props,
                values: [],
                maxDepth,
                depth: 0,
                level: entry._id,
                onlyLng: lang.code,
              });
            }
          }
          return entryParsed;
        },
      };
      moduleConfig.next();
    },
  };
}

// TODO: Do not forget to remove
// {
//   const entryTemplate: BCMSTemplate = {
//     _id: 'asdf',
//     cid: '1a',
//     createdAt: 0,
//     updatedAt: 0,
//     desc: 'asdf',
//     label: 'Test template',
//     name: 'test_template',
//     singleEntry: false,
//     userId: 'asdf',
//     props: [
//       {
//         id: '1',
//         array: false,
//         label: 'Title',
//         name: 'title',
//         required: true,
//         type: BCMSPropType.STRING,
//         defaultData: [''],
//       },
//       {
//         id: '2',
//         array: false,
//         label: 'Slug',
//         name: 'slug',
//         required: true,
//         type: BCMSPropType.STRING,
//         defaultData: [''],
//       },
//       {
//         id: '3',
//         array: true,
//         label: 'My string',
//         name: 'my_string',
//         required: true,
//         type: BCMSPropType.STRING,
//         defaultData: [''],
//       },
//       {
//         id: '4',
//         array: false,
//         label: 'My number',
//         name: 'my_number',
//         required: true,
//         type: BCMSPropType.NUMBER,
//         defaultData: [0],
//       },
//     ],
//   };
//   const entry: BCMSEntry = {
//     _id: 'asdf',
//     cid: '1as',
//     createdAt: 0,
//     updatedAt: 0,
//     templateId: 'asdf',
//     userId: 'asdf',
//     status: 'DRAFT',
//     content: [],
//     meta: [
//       {
//         lng: 'en',
//         props: [
//           {
//             id: '1',
//             data: ['My title'],
//           },
//           {
//             id: '2',
//             data: ['my-slug'],
//           },
//           {
//             id: '3',
//             data: ['My string'],
//           },
//           {
//             id: '4',
//             data: [4],
//           },
//         ],
//       },
//     ],
//   };
//   const entryParsed: BCMSEntryParsed = {
//     _id: 'asdf',
//     createdAt: 0,
//     updatedAt: 0,
//     status: 'DRAFT',
//     templateId: 'asdf',
//     userId: 'asdf',
//     meta: {
//       en: {
//         title: 'My title',
//         slug: 'my-slug',
//         my_string: ['My string'],
//         my_number: 4,
//       },
//     },
//   };
// }
