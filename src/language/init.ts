import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsLanguageFactory } from './factory';
import { useBcmsLanguageRepository } from './repository';

export function initLanguage(): Module {
  return {
    name: 'Language initializer',
    initialize(moduleConfig) {
      const langRepo = useBcmsLanguageRepository();
      const langFactory = useBcmsLanguageFactory();
      langRepo
        .findAll()
        .then(async (langs) => {
          if (langs.length === 0) {
            const lang = langFactory.create({
              code: 'en',
              def: true,
              name: 'English',
              nativeName: 'English',
              userId: '',
            });
            const addResult = await langRepo.add(lang as never);
            if (!addResult) {
              moduleConfig.next(
                Error('Failed to add default language to the database.'),
              );
              return;
            }
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
