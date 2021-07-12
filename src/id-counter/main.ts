import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsIdCounterFactory } from './factory';
import { useBcmsIdCounterRepository } from './repository';

export function createIDCounterInitializeModule(): Module {
  return {
    name: 'ID counter initialization',
    initialize(moduleConfig) {
      const idcRepo = useBcmsIdCounterRepository();
      const idcFactory = useBcmsIdCounterFactory();

      idcRepo.methods
        .findByForId('orgs')
        .then(async (result) => {
          if (!result) {
            const idc = idcFactory.create({
              count: 1,
              forId: 'orgs',
              name: 'Organizations',
            });
            await idcRepo.add(idc as never);
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
