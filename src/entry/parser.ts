import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import type { Module } from '@becomes/purple-cheetah/types';
import type { BCMSEntryParsed, BCMSEntryParser, BCMSStatus } from '../types';

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
