import { PropHandler, PropParsed, PropType } from '../prop';
import { EntryParsed } from './interfaces';
import { Entry, FSEntry } from './models';

export class EntryParser {
  static async parse(
    entry: Entry | FSEntry,
    justLanguage?: string,
    level?: string,
    depth?: number,
  ): Promise<EntryParsed> {
    if (!level) {
      level = 'entry';
    }
    if (!depth) {
      depth = 0;
    }
    const entryParsed: EntryParsed = {
      _id: `${entry._id}`,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      templateId: entry.templateId,
      userId: entry.userId,
      meta: {},
      content: {},
    };
    if (justLanguage) {
      const metaForLanguage = entry.meta.find((e) => e.lng === justLanguage);
      if (!metaForLanguage) {
        throw Error(
          `[ ${level}.meta ] ---> Data does not exist for language "${justLanguage}".`,
        );
      }
      const contentForLanguage = entry.content.find(
        (e) => e.lng === justLanguage,
      );
      if (!contentForLanguage) {
        throw Error(
          `[ ${level}.content ] ---> Data does not exist for language "${justLanguage}".`,
        );
      }
      const metaParsed = await PropHandler.parseProps(
        metaForLanguage.props,
        metaForLanguage.lng,
        `entry.meta[${justLanguage}].props`,
        depth,
      );
      const contentParsed = await PropHandler.parseProps(
        contentForLanguage.props,
        contentForLanguage.lng,
        `entry.content[${justLanguage}].props`,
        depth,
      );
      entryParsed.meta[metaForLanguage.lng] = {};
      entryParsed.content[contentForLanguage.lng] = [];
      metaParsed.forEach((meta) => {
        entryParsed.meta[metaForLanguage.lng][meta.key] = meta.value;
      });
      contentParsed.forEach((content) => {
        const value = content.value as {
          type: PropType;
          value: PropParsed;
        };
        entryParsed.content[contentForLanguage.lng].push(value);
      });
    } else {
      for (const i in entry.meta) {
        const metaForLanguage = entry.meta.find(
          (e) => e.lng === entry.meta[i].lng,
        );
        if (!metaForLanguage) {
          throw Error(
            `[ ${level}.meta ] ---> Data does not exist for language "${entry.meta[i].lng}".`,
          );
        }
        const contentForLanguage = entry.content.find(
          (e) => e.lng === metaForLanguage.lng,
        );
        if (!contentForLanguage) {
          throw Error(
            `[ ${level}.content ] ---> Data does not exist for language "${metaForLanguage.lng}".`,
          );
        }
        const metaParsed = await PropHandler.parseProps(
          metaForLanguage.props,
          metaForLanguage.lng,
          `${level}.meta[${i}].props`,
          depth,
        );
        const contentParsed = await PropHandler.parseProps(
          contentForLanguage.props,
          contentForLanguage.lng,
          `entry.content[${contentForLanguage.lng}].props`,
          depth,
        );
        entryParsed.meta[entry.meta[i].lng] = {};
        entryParsed.content[contentForLanguage.lng] = [];
        metaParsed.forEach((meta) => {
          entryParsed.meta[entry.meta[i].lng][meta.key] = meta.value;
        });
        contentParsed.forEach((content) => {
          const value = content.value as {
            type: PropType;
            value: PropParsed;
          };
          entryParsed.content[contentForLanguage.lng].push(value);
        });
      }
    }
    return entryParsed;
  }
}
