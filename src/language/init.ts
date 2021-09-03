import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import type { Module } from '@becomes/purple-cheetah/types';

export function initLanguage(): Module {
  return {
    name: 'Language initializer',
    initialize(moduleConfig) {
      BCMSRepo.language
        .findAll()
        .then(async (langs) => {
          if (langs.length === 0) {
            const lang = BCMSFactory.language.create({
              code: 'en',
              def: true,
              name: 'English',
              nativeName: 'English',
              userId: '',
            });
            const addResult = await BCMSRepo.language.add(lang as never);
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
